import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Fonction utilitaire pour le formatage de la devise
const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Composant de carte affichant le solde, les profits et les dépenses.
const BalanceCard = ({
  balance,
  income,
  expenses,
  currency = 'XOF',
  onMorePress,
}) => {
  const gradientColors = ['#4730CA', '#231864'];
  const gradientStart = { x: 0, y: 0 };
  const gradientEnd = { x: 0, y: 1 };  
  return (
    <LinearGradient
      colors={gradientColors}
      start={gradientStart}
      end={gradientEnd}
      style={styles.cardContainer} // Appliquez les styles de conteneur au LinearGradient
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solde Courant</Text>
        <TouchableOpacity onPress={onMorePress}>
          <Icon name="dots-horizontal" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.balanceText}>{formatCurrency(balance, currency)}</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItemValue}>
          <View style={styles.summaryItem}>
            <Icon name="arrow-down-circle-outline" size={20} color="#FFF" />
            <Text style={styles.summaryLabel}> Profits</Text>
          </View>
          <Text style={styles.incomeText}>+{formatCurrency(income, currency)}</Text>
        </View>

        <View style={styles.summaryItemValue}>
          <View style={styles.summaryItem}>
            <Icon name="arrow-up-circle-outline" size={20} color="#FFF" />
            <Text style={styles.summaryLabel}> Dépenses</Text>
          </View>
          <Text style={styles.expensesText}>-{formatCurrency(Math.abs(expenses), currency)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#423AB5',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 100,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  summaryItemValue: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#E0E0E0',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#66BB6A', // Vert pour les profits
  },
  expensesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF5350', // Rouge pour les dépenses
  },
});

export default BalanceCard;