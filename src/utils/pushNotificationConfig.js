import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

PushNotification.createChannel(
  {
    channelId: 'daily-reminder', // ID unique
    channelName: 'Daily Reminders',
  },
  () => {}
);
