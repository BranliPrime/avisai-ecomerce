// utils/sendNotification.js
import admin from '../firebase/firebase.js';

const sendNotification = async (fcmToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notificación enviada:', response);
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
  }
};

export default sendNotification;
