import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { sendPushToAll } from '../lib/push';

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

  // GET /api/push/vapid-key - Retorna a chave pública VAPID
  typedApp.get('/vapid-key', async () => {
    return { publicKey: process.env.VAPID_PUBLIC_KEY };
  });

  // POST /api/push/subscribe - Salva a subscription do cliente
  typedApp.post(
    '/subscribe',
    { schema: { body: pushSubscriptionSchema } },
    async (request, reply) => {
      const { endpoint, keys } = request.body;

      try {
        const subscription = await prisma.pushSubscription.upsert({
          where: { endpoint },
          update: { p256dh: keys.p256dh, auth: keys.auth },
          create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
        });

        return reply.status(201).send({ success: true, id: subscription.id });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao salvar subscription.', detalhe: error.message });
      }
    }
  );

  // DELETE /api/push/unsubscribe - Remove a subscription
  typedApp.delete(
    '/unsubscribe',
    { schema: { body: z.object({ endpoint: z.string().url() }) } },
    async (request, reply) => {
      const { endpoint } = request.body;

      try {
        await prisma.pushSubscription.delete({ where: { endpoint } });
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

  // POST /api/push/send - Envia notificação para todas as subscriptions
  typedApp.post(
    '/send',
    { schema: { body: notificationPayloadSchema } },
    async (request, reply) => {
      const payload = request.body;

      try {
        const result = await sendPushToAll({
          title: payload.title,
          body: payload.body,
          tag: payload.tag,
          icon: payload.icon,
          data: payload.data,
        });

        if (result.sent === 0 && result.failed === 0) {
          return reply.status(404).send({ mensagem: 'Nenhuma subscription cadastrada.' });
        }

        return reply.send({ total: result.sent + result.failed, sent: result.sent, failed: result.failed });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao enviar notificações.', detalhe: error.message });
      }
    }
  );
}
