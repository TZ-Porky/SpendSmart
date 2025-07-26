/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'

const BudgetWalletScreen = () => {
  const [activeTab, setActiveTab] = useState('budget') // 'budget' or 'accounts'
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Alimentation', icon: '🍕', allocated: 150000, spent: 89000, color: '#FF6B6B' },
    { id: 2, category: 'Transport', icon: '🚗', allocated: 80000, spent: 45000, color: '#4ECDC4' },
    { id: 3, category: 'Loisirs', icon: '🎮', allocated: 60000, spent: 32000, color: '#45B7D1' },
    { id: 4, category: 'Shopping', icon: '🛍️', allocated: 100000, spent: 78000, color: '#96CEB4' },
    { id: 5, category: 'Factures', icon: '📄', allocated: 200000, spent: 185000, color: '#FECA57' },
  ])

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Compte Principal', type: 'Banque', balance: 850000, icon: '🏦', color: '#5F33FD' },
    { id: 2, name: 'Orange Money', type: 'Mobile Money', balance: 45000, icon: '📱', color: '#FF8C00' },
    { id: 3, name: 'MTN MoMo', type: 'Mobile Money', balance: 32000, icon: '📱', color: '#FFD700' },
    { id: 4, name: 'Épargne', type: 'Épargne', balance: 500000, icon: '🏛️', color: '#32CD32' },
    { id: 5, name: 'Espèces', type: 'Liquide', balance: 25000, icon: '💵', color: '#90EE90' },
  ])

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    icon: '💰'
  })

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Banque',
    balance: '',
    icon: '🏦'
  })

  const formatCurrency = (amount) => {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })
  }

  const getBudgetPercentage = (spent, allocated) => {
    return Math.min((spent / allocated) * 100, 100)
  }

  const getTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.allocated, 0)
  }

  const getTotalSpent = () => {
    return budgets.reduce((total, budget) => total + budget.spent, 0)
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0)
  }

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    const budget = {
      id: budgets.length + 1,
      category: newBudget.category,
      icon: newBudget.icon,
      allocated: parseFloat(newBudget.amount),
      spent: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }

    setBudgets([...budgets, budget])
    setNewBudget({ category: '', amount: '', icon: '💰' })
    setShowAddBudgetModal(false)
    Alert.alert('Succès', 'Budget ajouté avec succès !')
  }

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    const account = {
      id: accounts.length + 1,
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance),
      icon: newAccount.icon,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }

    setAccounts([...accounts, account])
    setNewAccount({ name: '', type: 'Banque', balance: '', icon: '🏦' })
    setShowAddAccountModal(false)
    Alert.alert('Succès', 'Compte ajouté avec succès !')
  }

  const accountIcons = {
    'Banque': '🏦',
    'Mobile Money': '📱',
    'Épargne': '🏛️',
    'Liquide': '💵',
    'Investissement': '📈'
  }

  return (
    <KeyboardAvoidingView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'budget' ? 'Budget' : 'Portefeuille'}
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => activeTab === 'budget' ? setShowAddBudgetModal(true) : setShowAddAccountModal(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
          onPress={() => setActiveTab('budget')}
        >
          <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
            📊 Budget
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accounts' && styles.activeTab]}
          onPress={() => setActiveTab('accounts')}
        >
          <Text style={[styles.tabText, activeTab === 'accounts' && styles.activeTabText]}>
            💼 Comptes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'budget' ? (
          // Budget Tab
          <>
            {/* Budget Overview */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Aperçu Budget Mensuel</Text>
              <View style={styles.overviewStats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Alloué</Text>
                  <Text style={styles.statValue}>{formatCurrency(getTotalBudget())} FCFA</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Dépensé</Text>
                  <Text style={[styles.statValue, { color: '#F44336' }]}>
                    {formatCurrency(getTotalSpent())} FCFA
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Restant</Text>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                    {formatCurrency(getTotalBudget() - getTotalSpent())} FCFA
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progress, 
                      { 
                        width: `${getBudgetPercentage(getTotalSpent(), getTotalBudget())}%`,
                        backgroundColor: getBudgetPercentage(getTotalSpent(), getTotalBudget()) > 80 ? '#F44336' : '#5F33FD'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {getBudgetPercentage(getTotalSpent(), getTotalBudget()).toFixed(0)}% utilisé
                </Text>
              </View>
            </View>

            {/* Budget Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Catégories Budget</Text>
              {budgets.map((budget) => (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <Text style={styles.budgetIcon}>{budget.icon}</Text>
                      <Text style={styles.budgetCategory}>{budget.category}</Text>
                    </View>
                    <View style={styles.budgetAmounts}>
                      <Text style={styles.budgetSpent}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)} FCFA
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.budgetProgressContainer}>
                    <View style={styles.budgetProgressBar}>
                      <View 
                        style={[
                          styles.budgetProgress, 
                          { 
                            width: `${getBudgetPercentage(budget.spent, budget.allocated)}%`,
                            backgroundColor: budget.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.budgetPercentage}>
                      {getBudgetPercentage(budget.spent, budget.allocated).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          // Accounts Tab
          <>
            {/* Total Balance */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Solde Total</Text>
              <Text style={styles.totalBalance}>
                {formatCurrency(getTotalBalance())} FCFA
              </Text>
              <Text style={styles.accountsCount}>
                {accounts.length} compte{accounts.length > 1 ? 's' : ''}
              </Text>
            </View>

            {/* Accounts List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes Comptes</Text>
              {accounts.map((account) => (
                <TouchableOpacity key={account.id} style={styles.accountItem}>
                  <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                    <Text style={styles.accountIconText}>{account.icon}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>{account.type}</Text>
                  </View>
                  <View style={styles.accountBalance}>
                    <Text style={styles.accountBalanceText}>
                      {formatCurrency(account.balance)} FCFA
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions Rapides</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>💸</Text>
                  <Text style={styles.quickActionText}>Transfert</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>💰</Text>
                  <Text style={styles.quickActionText}>Dépôt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>🏦</Text>
                  <Text style={styles.quickActionText}>Historique</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>📊</Text>
                  <Text style={styles.quickActionText}>Analyse</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddBudgetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau Budget</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddBudgetModal(false)}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <TextInput
                  style={styles.input}
                  value={newBudget.category}
                  onChangeText={(value) => setNewBudget({...newBudget, category: value})}
                  placeholder="Ex: Alimentation, Transport..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Montant Alloué</Text>
                <TextInput
                  style={styles.input}
                  value={newBudget.amount}
                  onChangeText={(value) => setNewBudget({...newBudget, amount: value})}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Icône</Text>
                <View style={styles.iconSelector}>
                  {['💰', '🍕', '🚗', '🛍️', '📄', '🎮', '🏥', '📚', '✈️', '🏠'].map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        newBudget.icon === icon && styles.selectedIcon
                      ]}
                      onPress={() => setNewBudget({...newBudget, icon})}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddBudget}>
                <Text style={styles.submitButtonText}>Créer Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        visible={showAddAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau Compte</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddAccountModal(false)}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom du Compte</Text>
                <TextInput
                  style={styles.input}
                  value={newAccount.name}
                  onChangeText={(value) => setNewAccount({...newAccount, name: value})}
                  placeholder="Ex: Compte Principal, Orange Money..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Type de Compte</Text>
                <View style={styles.typeSelector}>
                  {Object.keys(accountIcons).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        newAccount.type === type && styles.selectedType
                      ]}
                      onPress={() => setNewAccount({...newAccount, type, icon: accountIcons[type]})}
                    >
                      <Text style={styles.typeIcon}>{accountIcons[type]}</Text>
                      <Text style={styles.typeText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Solde Initial</Text>
                <TextInput
                  style={styles.input}
                  value={newAccount.balance}
                  onChangeText={(value) => setNewAccount({...newAccount, balance: value})}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddAccount}>
                <Text style={styles.submitButtonText}>Créer Compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5F33FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#5F33FD',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  accountsCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  budgetItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetAmounts: {
    alignItems: 'flex-end',
  },
  budgetSpent: {
    fontSize: 14,
    color: '#666',
  },
  budgetProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 12,
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 35,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountIconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountBalanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#5F33FD',
    backgroundColor: '#5F33FD20',
  },
  iconText: {
    fontSize: 24,
  },
  typeSelector: {
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    borderColor: '#5F33FD',
    backgroundColor: '#5F33FD20',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#5F33FD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default BudgetWalletScreen;