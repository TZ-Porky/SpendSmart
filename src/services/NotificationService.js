// Importations
import notifee, { AndroidImportance, TriggerType, RepeatFrequency } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { transactionService } from './TransactionService';
import { budgetService } from './BudgetService';

// Paramètres de Notifee
const NOTIFICATION_CHANNEL_ID = "SpendSmartChannel";
const DAILY_REMINDER_ID = 'daily_transaction_reminder';
const CARD_REMINDER_ID = 'attach_card_reminder';
const BUDGET_ALERT_ID_PREFIX = 'budget_alert_';

// Utilitaire pour formater la devise utilisée dans l'application
const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

class NotificationService {
  constructor() {
    this.createNotificationChannel();
  }

  // Crée le canal de notification Android
  async createNotificationChannel() {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Spending Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }

  // Demande les permissions nécessaires pour envoyer les transactions
  async requestNotificationPermissions() {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus) { // 1 = Authorized, 2 = Denied
      console.log('Notification permissions granted:', settings.authorizationStatus);
      return true;
    } else {
      console.warn('Notification permissions denied:', settings.authorizationStatus);
      return false;
    }
  }

  // Planifie un rappel quotidien pour noter les transactiosn
  async scheduleDailyTransactionReminder(hour, minute) {
    await notifee.cancelTriggerNotification(DAILY_REMINDER_ID);
  
    const now = new Date();
    let scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  
    console.log("Current time:", now.toLocaleString());
    console.log("Initial scheduled date:", scheduledDate.toLocaleString());
  
    if (scheduledDate.getTime() < now.getTime()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      console.log("Scheduled date adjusted to tomorrow:", scheduledDate.toLocaleString());
    }
  
    // Programmation des rappels
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledDate.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };
  
    console.log("Final timestamp for trigger:", trigger.timestamp);
    console.log("Final scheduled date for trigger:", new Date(trigger.timestamp).toLocaleString());

    await notifee.createTriggerNotification(
      {
        id: DAILY_REMINDER_ID,
        title: 'Rappel SpendSmart',
        body: "N'oubliez pas de noter vos transactions du jour !",
        android: {
          channelId: NOTIFICATION_CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
            sound: 'default',
        },
        data: { type: "daily_transaction_reminder" },
      },
      trigger,
    );

    await AsyncStorage.setItem('dailyTransactionReminder', JSON.stringify({ hour, minute, enabled: true }));
    console.log(`Daily transaction reminder scheduled for ${hour}:${minute}`);
  }

  // Annule toutes les notifications de rappel journalier
  async cancelDailyTransactionReminder() {
    await notifee.cancelTriggerNotification(DAILY_REMINDER_ID);
    await AsyncStorage.removeItem('dailyTransactionReminder');
    console.log("Daily transaction reminder cancelled.");
  }

  // Ferme toutes les notifications actuellement affichées
  async cancelAllNotifications() {
    await notifee.cancelAllNotifications();
    console.log("All displayed notifications cancelled.");
  }

  // Annule toutes les notifications programmées
  async cancelAllTriggers() {
    await notifee.cancelAllTriggers();
    console.log("All scheduled triggers cancelled.");
  }

  // Envoi une notification pour tester l'implémentation
  async testSimpleNotification() {
    console.log("Attempting to display a simple notification immediately.");
    try {
      await notifee.displayNotification({
        title: 'Test Notification',
        body: 'Ceci est un test immédiat de Notifee!',
        android: {
          channelId: NOTIFICATION_CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
            sound: 'default',
        }
      });
      console.log("Simple notification displayed successfully (or queued).");
    } catch (error) {
      console.error("Error displaying simple notification:", error);
    }
  }

  // Récupère l'état d'activation d'envoi des notifications
  async getDailyTransactionReminderStatus() {
    const status = await AsyncStorage.getItem('dailyTransactionReminder');
    return status ? JSON.parse(status) : { hour: 20, minute: 0, enabled: false };
  }

  // Planifie un rappel pour joindre une carte bancaire
  async scheduleAttachCardReminder(date, repeatFrequency = null) {
    await notifee.cancelTriggerNotification(CARD_REMINDER_ID);

    const trigger = repeatFrequency ? {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: repeatFrequency,
    } : {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: CARD_REMINDER_ID,
        title: 'Rappel SpendSmart',
        body: "N'oubliez pas de joindre votre carte bancaire pour une meilleure gestion !",
        android: {
          channelId: NOTIFICATION_CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
            sound: 'default',
        },
        data: { type: "attach_card_reminder" },
      },
      trigger,
    );
    console.log(`Attach card reminder scheduled for ${date}`);
  }

  // Annule les notifications programmées pour l'attachement d'une carte bancaire
  async cancelAttachCardReminder() {
    await notifee.cancelTriggerNotification(CARD_REMINDER_ID);
    console.log("Attach card reminder cancelled.");
  }


  // Vérifie les budgets et déclenche des alertes si les seuils sont atteints ou proches.
  // ! Cette fonction devrait être appelée au démarrage de l'app, ou après chaque nouvelle transaction.
  async checkBudgetsAndSendAlerts(userUid) {
    if (!userUid) return;

    try {
      const budgets = await budgetService.getBudgets(userUid);
      const transactions = await transactionService.getTransactions(userUid);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      for (const budget of budgets) {
        const relevantTransactions = transactions.filter(tx =>
          tx.type === 'expense' &&
          tx.categoryId === budget.categoryId &&
          tx.date.getMonth() === currentMonth &&
          tx.date.getFullYear() === currentYear
        );

        const currentSpent = relevantTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const budgetAmount = budget.amount;

        const remaining = budgetAmount - currentSpent;
        const percentageSpent = (currentSpent / budgetAmount) * 100;

        const alertThreshold = 80;
        const budgetAlertId = BUDGET_ALERT_ID_PREFIX + budget.id;

        // Récupérer la dernière alerte envoyée pour ce budget
        const lastAlertStatus = await AsyncStorage.getItem(`budgetAlert_${budget.id}`);

        if (percentageSpent >= 100 && lastAlertStatus !== 'exceeded') {
          await notifee.displayNotification({
            id: budgetAlertId,
            title: "Alerte Budget Dépassé !",
            body: `Vous avez dépassé votre budget de ${budget.name} (${formatCurrency(budgetAmount)}). Dépensé : ${formatCurrency(currentSpent)}`,
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              pressAction: { id: 'default' },
            },
            ios: { sound: 'default' },
            data: { type: "budget_exceeded", budgetId: budget.id },
          });
          await AsyncStorage.setItem(`budgetAlert_${budget.id}`, 'exceeded');
          console.log(`Budget ${budget.name} exceeded alert sent.`);

        } else if (percentageSpent >= alertThreshold && percentageSpent < 100 && lastAlertStatus !== 'close') {
          await notifee.displayNotification({
            id: budgetAlertId,
            title: "Alerte Budget !",
            body: `Votre budget pour ${budget.name} est presque atteint (${alertThreshold}%). Il vous reste ${formatCurrency(remaining)}.`,
            android: {
              channelId: NOTIFICATION_CHANNEL_ID,
              pressAction: { id: 'default' },
            },
            ios: { sound: 'default' },
            data: { type: "budget_close", budgetId: budget.id },
          });
          await AsyncStorage.setItem(`budgetAlert_${budget.id}`, 'close');
          console.log(`Budget ${budget.name} close alert sent.`);
        } else if (percentageSpent < alertThreshold && (lastAlertStatus === 'close' || lastAlertStatus === 'exceeded')) {
          // Si le budget n'est plus proche ou dépassé, annuler la notification et effacer l'état d'alerte
          await notifee.cancelNotification(budgetAlertId);
          await AsyncStorage.removeItem(`budgetAlert_${budget.id}`);
        }
      }
    } catch (error) {
      console.error("Error checking budgets for alerts:", error);
    }
  }

}

export const notificationService = new NotificationService();