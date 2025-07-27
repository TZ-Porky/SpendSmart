// src/models/User.js

import firestore from '@react-native-firebase/firestore'; // Assurez-vous d'avoir ce module

class User {
  /**
   * @param {string} uid - L'identifiant unique de l'utilisateur (UID Firebase Auth).
   * @param {string} email - L'adresse e-mail de l'utilisateur.
   * @param {string} [displayName=''] - Le nom d'affichage de l'utilisateur (optionnel).
   * @param {string} [photoURL=''] - L'URL de la photo de profil de l'utilisateur (optionnel).
   * @param {Date} [createdAt=new Date()] - La date de création du compte utilisateur.
   * @param {Date} [lastLoginAt=new Date()] - La date de la dernière connexion.
   * @param {boolean} [notificationsEnabled=true] - Indique si les notifications sont activées.
   * @param {number} [notificationHour=20] - L'heure de la notification quotidienne.
   * @param {number} [notificationMinute=0] - La minute de la notification quotidienne.
   * @param {string} [currency='XOF'] - La devise par défaut de l'utilisateur (ex: 'XOF', 'EUR', 'USD').
   * @param {'monthly' | 'weekly' | 'daily'} [preferredPeriodForSummary='monthly'] - Période préférée pour les résumés (Profits/Dépenses).
   */
  constructor(
    uid,
    email,
    displayName = '',
    photoURL = '',
    createdAt = new Date(),
    lastLoginAt = new Date(),
    notificationsEnabled = true,
    notificationHour = 20,
    notificationMinute = 0,
    currency = 'XOF', // Par défaut pour la région actuelle
    preferredPeriodForSummary = 'monthly'
  ) {
    if (!uid || !email) {
      throw new Error("User requires a uid and email.");
    }

    this.uid = uid;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.createdAt = createdAt;
    this.lastLoginAt = lastLoginAt;
    this.notificationsEnabled = notificationsEnabled;
    this.notificationHour = notificationHour;
    this.notificationMinute = notificationMinute;
    this.currency = currency;
    this.preferredPeriodForSummary = preferredPeriodForSummary;
  }

  /**
   * Crée une instance de User à partir d'un document Firestore.
   * @param {Object} docData - Les données brutes d'un document Firestore.
   * @param {string} uid - L'UID de l'utilisateur, généralement l'ID du document.
   * @returns {User}
   */
  static fromFirestore(docData, uid) {
    if (!docData) {
      throw new Error("Document data cannot be null or undefined.");
    }
    return new User(
      uid,
      docData.email,
      docData.displayName || '',
      docData.photoURL || '',
      docData.createdAt ? docData.createdAt.toDate() : new Date(), // Convertir Timestamp en Date
      docData.lastLoginAt ? docData.lastLoginAt.toDate() : new Date(),
      docData.notificationsEnabled !== undefined ? docData.notificationsEnabled : true,
      docData.notificationHour !== undefined ? docData.notificationHour : 20,
      docData.notificationMinute !== undefined ? docData.notificationMinute : 0,
      docData.currency || 'XOF',
      docData.preferredPeriodForSummary || 'monthly'
    );
  }

  /**
   * Convertit l'instance User en un objet JavaScript plat pour Firestore.
   * @returns {Object} Un objet compatible avec Firestore.
   */
  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: firestore.Timestamp.fromDate(this.createdAt),
      lastLoginAt: firestore.Timestamp.fromDate(this.lastLoginAt),
      notificationsEnabled: this.notificationsEnabled,
      notificationHour: this.notificationHour,
      notificationMinute: this.notificationMinute,
      currency: this.currency,
      preferredPeriodForSummary: this.preferredPeriodForSummary,
    };
  }

  /**
   * Met à jour le nom d'affichage de l'utilisateur.
   * @param {string} newDisplayName - Le nouveau nom d'affichage.
   */
  updateDisplayName(newDisplayName) {
    this.displayName = newDisplayName;
  }

  /**
   * Met à jour l'état des notifications.
   * @param {boolean} enabled - True pour activer, False pour désactiver.
   */
  setNotificationsEnabled(enabled) {
    this.notificationsEnabled = enabled;
  }

  /**
   * Met à jour l'heure des notifications.
   * @param {number} hour - Heure (0-23).
   * @param {number} minute - Minute (0-59).
   */
  setNotificationTime(hour, minute) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error("Invalid hour or minute for notification time.");
    }
    this.notificationHour = hour;
    this.notificationMinute = minute;
  }
}

export default User;