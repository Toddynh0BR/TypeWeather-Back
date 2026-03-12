const { Expo } = require("expo-server-sdk");

const expo = new Expo()

async function sendNotification(token, message) {
  console.log("Enviando para:", token);

  if (!Expo.isExpoPushToken(token)) {
    console.log("Token inválido");
    return;
  }

  const notification = {
    to: token,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data || {},
    priority: "high",
    ttl: 3600,
    channelId: "default",
  };

  const chunks = expo.chunkPushNotifications([notification]);
  let tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  console.log("Tickets:", tickets);
}

module.exports = sendNotification;