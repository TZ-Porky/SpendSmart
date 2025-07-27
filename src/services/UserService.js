// Importation
import firestore from '@react-native-firebase/firestore';

// Modèle
import User from '../models/User';

const usersCollection = firestore().collection('users');

class UserService {
  // Crée un nouvel utilisateur dans Firestore.
  async createUser(user) {
    try {
      if (!(user instanceof User)) {
        throw new Error("Invalid user object provided. Must be an instance of User class.");
      }
      await usersCollection.doc(user.uid).set(user.toFirestore());
      console.log(`User ${user.uid} created successfully.`);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Récupère un utilisateur par son UID.
  async getUser(uid) {
    try {
      const doc = await usersCollection.doc(uid).get();
      if (doc.exists) {
        return User.fromFirestore(doc.data(), doc.id);
      }
      console.log(`User ${uid} not found.`);
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  // Met à jour les informations d'un utilisateur existant.
  async updateUserInfo(uid, updates) {
    try {
      await usersCollection.doc(uid).update(updates);
      console.log(`User ${uid} updated successfully.`);
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  }

  // Met à jour l'état des notifications pour un utilisateur.
  async updateNotificationStatus(uid, enabled) {
    try {
      await usersCollection.doc(uid).update({ notificationsEnabled: enabled });
      console.log(`Notifications for user ${uid} set to ${enabled}.`);
    } catch (error) {
      console.error("Error updating notification status:", error);
      throw error;
    }
  }

  // Met à jour l'heure des notifications pour un utilisateur.
  async updateNotificationTime(uid, hour, minute) {
    try {
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error("Invalid hour or minute for notification time.");
      }
      await usersCollection.doc(uid).update({
        notificationHour: hour,
        notificationMinute: minute,
      });
      console.log(`Notification time for user ${uid} set to ${hour}:${minute}.`);
    } catch (error) {
      console.error("Error updating notification time:", error);
      throw error;
    }
  }

  // Supprime un utilisateur de Firestore.
  async deleteUser(uid) {
    try {
      await usersCollection.doc(uid).delete();
      console.log(`User ${uid} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Écoute les changements sur un document utilisateur spécifique en temps réel.
  listenToUser(uid, callback) {
    const unsubscribe = usersCollection.doc(uid).onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          callback(User.fromFirestore(docSnapshot.data(), docSnapshot.id));
        } else {
          callback(null); // Utilisateur supprimé ou non trouvé
        }
      },
      (error) => {
        console.error("Error listening to user:", error);
        callback(null); // Gérer l'erreur en renvoyant null
      }
    );
    return unsubscribe; // Retourne la fonction de désabonnement
  }
}

export const userService = new UserService();