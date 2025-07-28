// src/components/TransactionCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assurez-vous d'avoir cette bibliothèque

// Fonction utilitaire pour le formatage de la devise
// Idéalement, cette fonction serait dans un fichier utils/formatters.js
const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Fonction pour formater la date
const formatDate = (date) => {
  if (!date) return '';
  const transactionDate = new Date(date); // Assurez-vous que c'est un objet Date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (transactionDate.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (transactionDate.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return transactionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
};

/**
 * Composant de carte réutilisable pour afficher une seule transaction.
 *
 * @param {object} props - Les props du composant.
 * @param {object} props.transaction - L'objet transaction à afficher.
 * Doit contenir: id, amount, type ('income'|'expense'), currency, title/categoryName, description, date.
 * @param {function} props.onPress - Fonction de rappel lorsque la carte est pressée.
 */
const TransactionCard = ({ transaction, onPress }) => {
  const amountColor = transaction.type === 'income' ? '#66BB6A' : '#EF5350'; // Vert pour revenu, Rouge pour dépense
  const iconName = transaction.type === 'income' ? 'credit-card-plus-outline' : 'credit-card-minus-outline'; // Exemples d'icônes

  const displayAmount = transaction.type === 'income'
    ? `+${formatCurrency(transaction.amount, transaction.currency)}`
    : `-${formatCurrency(Math.abs(transaction.amount), transaction.currency)}`;

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(transaction)}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={24} color="#555" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{transaction.title || transaction.categoryName || 'Transaction'}</Text>
        <Text style={styles.subtitle}>{transaction.description || formatDate(transaction.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {displayAmount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20, // Les marges horizontales pour l'alignement
    marginVertical: 5,    // Marge pour espacer chaque carte
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Pour Android
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0', // Couleur de fond pour le cercle d'icône
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1, // Prend l'espace disponible
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default TransactionCard;