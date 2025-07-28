// src/components/TransactionHeader.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Pour le dégradé

// Fonction utilitaire pour le formatage de la devise
const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Composant d'en-tête pour l'écran des transactions, affichant le solde et le statut.
 *
 * @param {object} props - Les props du composant.
 * @param {number} props.currentBalance - Le solde actuel à afficher.
 * @param {string} props.currency - La devise.
 * @param {string} props.statusMessage - Le message de statut (ex: "Vous êtes en déficit budgétaire").
 * @param {boolean} [props.isBudgetDeficit=false] - Indique si le statut est un déficit budgétaire pour adapter le style.
 */
const TransactionHeader = ({ currentBalance, currency, statusMessage, isBudgetDeficit = false }) => {
  const gradientColors = ['#6A1B9A', '#4A148C']; // Violet foncé à violet plus foncé
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerContainer}
    >
      <Text style={styles.headerTitle}>Solde actuel</Text>
      <Text style={styles.balanceText}>{formatCurrency(currentBalance, currency)}</Text>
      {statusMessage && (
        <Text style={[styles.statusMessage, isBudgetDeficit && styles.deficitMessage]}>
          {statusMessage}
        </Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30, // Pour la courbe en bas à gauche si le design l'exige
    borderBottomRightRadius: 30, // Pour la courbe en bas à droite
    overflow: 'hidden', // Important pour que le border radius fonctionne avec LinearGradient
  },
  headerTitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 14,
    color: '#D1C4E9', // Une couleur plus claire pour le texte de statut par défaut
  },
  deficitMessage: {
    color: '#FFCDD2', // Rouge clair pour le message de déficit
    fontWeight: 'bold',
  },
});

export default TransactionHeader;