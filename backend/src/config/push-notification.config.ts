export interface PushNotificationConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const pushNotificationConfig: PushNotificationConfig = {
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@controlaivendas.com',
  firebaseConfig: process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : undefined
}; 