/* eslint-disable react-native/no-inline-styles */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'

const HomeScreen = () => {

  const [balance] = useState(1000.00)
  const [profit] = useState(150.50)
  const [recentTransactions] = useState([
    { id: 1, type: 'Dépôt', amount: 500, date: '25 Jul 2025' },
    { id: 2, type: 'Retrait', amount: -200, date: '24 Jul 2025' },
    { id: 3, type: 'Transfert', amount: -50, date: '23 Jul 2025' },
  ])

  const formatCurrency = (amount) => {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
  }

  const handleTransaction = () => {
    // Navigation vers la page de transaction
    console.log('Navigate to transaction page')
  }

  const handleWallet = () => {
    // Navigation vers la page wallet
    console.log('Navigate to wallet page')
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec carte de solde */}
        <View style={styles.userCard}>
          <Text style={styles.cardText}>Votre Solde</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.savingValue}>{formatCurrency(balance)}</Text>
            <Text style={styles.savingCurrency}>FCFA</Text>
          </View>
          
          {/* Boutons d'actions rapides */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleTransaction}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButtonOutline}
              onPress={handleWallet}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextWhite}>Portefeuille</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Profit */}
        <View style={styles.section}>
          <View style={styles.profitCard}>
            <Text style={styles.sectionTitle}>Votre Profit</Text>
            <View style={styles.profitContainer}>
              <Text style={styles.profitValue}>+{formatCurrency(profit)}</Text>
              <Text style={styles.profitCurrency}>FCFA</Text>
            </View>
            <Text style={styles.profitSubtext}>Ce mois-ci</Text>
          </View>
        </View>

        {/* Section Transactions récentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))} FCFA
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Voir toutes les transactions</Text>
          </TouchableOpacity>
        </View>

        {/* Actions rapides additionnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionEmoji}>💸</Text>
              <Text style={styles.quickActionLabel}>Envoyer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionEmoji}>💰</Text>
              <Text style={styles.quickActionLabel}>Recevoir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionEmoji}>📊</Text>
              <Text style={styles.quickActionLabel}>Statistiques</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Text style={styles.quickActionEmoji}>⚙️</Text>
              <Text style={styles.quickActionLabel}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  userCard: {
    width: '100%',
    backgroundColor: '#5F33FD',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#5F33FD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    maxWidth: '92%',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  savingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  savingCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  quickActionButtonOutline: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonText: {
    color: '#5F33FD',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5F33FD',
    marginBottom: 16,
  },
  profitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  profitCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  profitSubtext: {
    fontSize: 14,
    color: '#666',
  },
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllText: {
    color: '#5F33FD',
    fontWeight: '600',
    fontSize: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
})

export default HomeScreen