import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import webpush from 'web-push';
import { prisma } from '../lib/prisma';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@pizzaria.local',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

const notificationPayloadSchema = z.object({
  title: z.string().min(1).max(50),
  body: z.string().min(1).max(200),
  icon: z.string().url().optional().default('/icon-192.svg'),
  badge: z.string().url().optional().default('/icon-192.svg'),
  tag: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function pushRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/vapid-key - Retorna a chave pública VAPID
  typedApp.get('/vapid-key', async () => {
    return { publicKey: process.env.VAPID_PUBLIC_KEY };
  });

  // POST /api/subscribe - Salva a subscription do cliente
  typedApp.post(
    '/subscribe',
    { schema: { body: pushSubscriptionSchema } },
    async (request, reply) => {
      const { endpoint, keys } = request.body;

      try {
        // Upsert: cria ou atualiza se endpoint já existir
        const subscription = await prisma.pushSubscription.upsert({
          where: { endpoint },
          update: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          create: {
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        });

        return reply.status(201).send({ success: true, id: subscription.id });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao salvar subscription.', detalhe: error.message });
      }
    }
  );

  // DELETE /api/unsubscribe - Remove a subscription
  typedApp.delete(
    '/unsubscribe',
    { schema: { body: z.object({ endpoint: z.string().url() }) } },
    async (request, reply) => {
      const { endpoint } = request.body;

      try {
        await prisma.pushSubscription.delete({
          where: { endpoint },
        });
        return reply.send({ success: true });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ mensagem: 'Subscription não encontrada.' });
        }
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao remover subscription.', detalhe: error.message });
      }
    }
  );

  // POST /api/send - Envia notificação para todas as subscriptions
  typedApp.post(
    '/send',
    { schema: { body: notificationPayloadSchema } },
    async (request, reply) => {
      const payload = request.body;

      try {
        const subscriptions = await prisma.pushSubscription.findMany();

        if (subscriptions.length === 0) {
          return reply.status(404).send({ mensagem: 'Nenhuma subscription cadastrada.' });
        }

        const pushPromises = subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: payload.icon,
                badge: payload.badge,
                tag: payload.tag,
                data: payload.data,
              })
            );
            return { endpoint: sub.endpoint, success: true };
          } catch (error: any) {
            // Se subscription expirada/inválida, remove do banco
            if (error.statusCode === 410 || error.statusCode === 404) {
              await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
            }
            app.log.error({ endpoint: sub.endpoint }, 'Erro ao enviar push');
            return { endpoint: sub.endpoint, success: false, error: error.message };
          }
        });

        const results = await Promise.all(pushPromises);
        const sent = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return reply.send({ total: subscriptions.length, sent, failed, details: results });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao enviar notificações.', detalhe: error.message });
      }
    }
  );
}