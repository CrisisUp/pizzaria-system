const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export async function isPushSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getVapidPublicKey(): Promise<string> {
  if (VAPID_PUBLIC_KEY) return VAPID_PUBLIC_KEY;

  // Fallback: busca do backend
  const res = await fetch('/api/push/vapid-key');
  const data = await res.json();
  return data.publicKey;
}

export async function subscribeUser(): Promise<PushSubscription | null> {
  if (!await isPushSupported()) {
    throw new Error('Push notifications não suportadas neste navegador');
  }

  const registration = await navigator.serviceWorker.ready;

  // Verifica se já tem subscription
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Envia subscription para o backend
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.mensagem || 'Erro ao salvar subscription');
  }

  return subscription;
}

export async function unsubscribeUser(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return false;

  const res = await fetch('/api/push/unsubscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  if (!res.ok) return false;

  await subscription.unsubscribe();
  return true;
}

export async function getSubscription(): Promise<PushSubscription | null> {
  if (!await isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function isSubscribed(): Promise<boolean> {
  const sub = await getSubscription();
  return !!sub;
}