// Importations
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

// Navigation
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { notificationService } from './src/services/NotificationService';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async loggedInUser => {
      setUser(loggedInUser);
      if (initializing) {
        setInitializing(false);
      }

      if (loggedInUser) {
        // Demander les permissions
        const hasPermission =
          await notificationService.requestNotificationPermissions();
        if (hasPermission) {
          await notificationService.checkBudgetsAndSendAlerts(loggedInUser.uid);
          console.log('Budget check and alerts run on app start.');

          // Initialisation du rappel quotidien
          const dailyReminderStatus =
            await notificationService.getDailyTransactionReminderStatus();
          if (!dailyReminderStatus.enabled) {
            // Planifier le rappel pour 20h00
            await notificationService.scheduleDailyTransactionReminder(20, 0);
          }
        } else {
          console.warn(
            'Notifications permissions not granted, cannot schedule reminders/alerts.',
          );
        }
      } else {
        // Annuler toutes les notifications de l'app
        await notificationService.cancelAllNotifications();
        await notificationService.cancelAllTriggers();
      }
    });
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
