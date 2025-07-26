import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('Notification reçue:', notification);
  },

  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

// Créer un canal de notification (nécessaire pour Android)
PushNotification.createChannel(
  {
    channelId: 'daily-reminder',
    channelName: 'Daily Reminder',
    importance: 4, // Max = 5
    vibrate: true,
  },
  (created) => console.log(`Canal créé: ${created}`)
);

export const scheduleDailyReminder = () => {
    PushNotification.localNotificationSchedule({
      channelId: 'daily-reminder',
      title: '💰 Pensez à vos finances',
      message: 'Ajoutez vos transactions du jour 📒',
      date: getNextTriggerTime(20, 0), // heure : 20h00
      repeatType: 'day',
      allowWhileIdle: true,
      playSound: true,
      soundName: 'default',
    });
  };
  
  // Calcule la prochaine heure de déclenchement
  function getNextTriggerTime(hour, minute) {
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1); // planifier pour le jour suivant
    }
    return trigger;
  }
  