const { Expo } = require("expo-server-sdk");

const expo = new Expo()

async function sendNotification(token, message) {
  console.log('Enviando para:', token)
  if (!Expo.isExpoPushToken(token)) {
    console.log('token invalido')
    await knex('tokens').where({ token }).delete();
    throw new Error("Token inválido");
  };

  const notification = {
    to: token,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data || {},
    priority: "high",
  };

  const chunks = expo.chunkPushNotifications([notification]);

  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
  console.log('Enviado')
};

module.exports = sendNotification;