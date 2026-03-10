const { Expo } = require("expo-server-sdk");

const expo = new Expo()

async function sendNotification(token, message) {
  if (!Expo.isExpoPushToken(token)) {
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
};

module.exports = sendNotification;