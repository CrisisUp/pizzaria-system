import webpush from 'web-push';
import { prisma } from './prisma';

// Configura VAPID na inicialização
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@pizzaria.local',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

/**
 * Envia push notification para todas as subscriptions ativas.
 * Remove automaticamente subscriptions expiradas/inválidas (410/404).
 */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany();

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            tag: payload.tag || 'pizzaria-notification',
            icon: payload.icon || '/icon-192.svg',
            badge: '/icon-192.svg',
            data: payload.data || {},
          })
        );
        return { success: true };
      } catch (error: any) {
        // Remove subscription inválida/expirada
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
        return { success: false };
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;

  return { sent, failed };
}
