// src/screens/Main/BudgetsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Modal, TextInput, Alert, Platform, ScrollView, ActivityIndicator, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';

import { budgetService } from '../../services/BudgetService';
import { categoryService } from '../../services/CategoryService';
import { transactionService } from '../../services/TransactionService';
import { accountService } from '../../services/AccountService';

import auth from '@react-native-firebase/auth';
import Budget from '../../models/Budget';
import Account from '../../models/Account';

const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const accountTypeIcons = {
  checking: 'bank',
  savings: 'piggy-bank',
  cash: 'cash',
  credit_card: 'credit-card',
  investment: 'chart-line',
  other: 'wallet',
};

function BudgetsScreen({ navigation }) {
  const [user, setUser] = useState(auth().currentUser);
  const [activeTab, setActiveTab] = useState('budgets'); // 'budgets' ou 'accounts'
  
  // États pour les budgets
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // États pour les comptes
  const [accounts, setAccounts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // États pour les modales
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  // États du formulaire budget
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [frequency, setFrequency] = useState('monthly');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // États du formulaire compte
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [initialBalance, setInitialBalance] = useState('');

  // Fonction pour charger toutes les données
  const fetchData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Charger les budgets et leurs dépendances
      const fetchedBudgets = await budgetService.getBudgets(user.uid);
      setBudgets(fetchedBudgets);

      const fetchedCategories = await categoryService.getAllCategories(user.uid);
      setCategories(fetchedCategories.filter(c => c.type === 'expense'));

      const fetchedTransactions = await transactionService.getTransactions(user.uid);
      setTransactions(fetchedTransactions);

      // Charger les comptes
      const fetchedAccounts = await accountService.getAccounts(user.uid);
      setAccounts(fetchedAccounts);

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      Alert.alert('Erreur', 'Échec du chargement des données.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (!user.uid) return;

    // Listeners pour les mises à jour en temps réel
    const unsubscribeBudgets = budgetService.listenToBudgets(user.uid, (bgs) => {
      setBudgets(bgs);
    });

    const unsubscribeCategories = categoryService.listenToAllCategories(user.uid, (cats) => {
      setCategories(cats.filter(c => c.type === 'expense'));
    });

    const unsubscribeTransactions = transactionService.listenToTransactions(user.uid, (txs) => {
      setTransactions(txs);
    });

    const unsubscribeAccounts = accountService.listenToAccounts(user.uid, (accs) => {
      setAccounts(accs);
    });

    fetchData();

    return () => {
      unsubscribeBudgets();
      unsubscribeCategories();
      unsubscribeTransactions();
      unsubscribeAccounts();
    };
  }, [user.uid, fetchData]);

  // Fonctions pour les budgets
  const calculateSpent = useCallback((budget) => {
    const budgetStartDate = budget.startDate.getTime();
    const budgetEndDate = budget.endDate.getTime();

    return transactions.reduce((sum, tx) => {
      const txDate = tx.date.getTime();
      const isExpense = tx.type === 'expense';
      const isWithinDateRange = txDate >= budgetStartDate && txDate <= budgetEndDate;
      const isCategoryMatch = budget.categoryIds && (budget.categoryIds.length === 0 || budget.categoryIds.includes(tx.categoryId));

      if (isExpense && isWithinDateRange && isCategoryMatch) {
        return sum + Math.abs(tx.amount);
      }
      return sum;
    }, 0);
  }, [transactions]);

  const handleAddBudget = async () => {
    if (!budgetName || !budgetAmount || !startDate || !endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Le montant du budget doit être un nombre positif.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    try {
      const newBudget = new Budget(
        user.uid,
        budgetName,
        parsedAmount,
        startDate,
        endDate,
        frequency,
        '',
        selectedCategoryIds
      );
      await budgetService.addBudget(user.uid, newBudget);
      Alert.alert('Succès', 'Budget ajouté !');
      resetBudgetForm();
      setBudgetModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout du budget: ' + error.message);
      console.error(error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!currentBudget || !budgetName || !budgetAmount || !startDate || !endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Le montant du budget doit être un nombre positif.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    try {
      await budgetService.updateBudget(user.uid, currentBudget.id, {
        name: budgetName,
        amount: parsedAmount,
        startDate: startDate,
        endDate: endDate,
        frequency: frequency,
        categoryIds: selectedCategoryIds,
      });
      Alert.alert('Succès', 'Budget mis à jour !');
      resetBudgetForm();
      setBudgetModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour du budget: ' + error.message);
      console.error(error);
    }
  };

  const handleDeleteBudget = useCallback(async (budgetId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce budget ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await budgetService.deleteBudget(user.uid, budgetId);
              Alert.alert('Succès', 'Budget supprimé !');
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la suppression: ' + error.message);
              console.error(error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, [user.uid]);

  // Fonctions pour les comptes
  const handleAddAccount = async () => {
    if (!accountName || !initialBalance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const parsedInitialBalance = parseFloat(initialBalance);
    if (isNaN(parsedInitialBalance)) {
      Alert.alert('Erreur', 'Le solde initial doit être un nombre valide.');
      return;
    }

    try {
      const newAccount = new Account(
        user.uid, 
        accountName, 
        accountType, 
        parsedInitialBalance, 
        '', 
        new Date(), 
        new Date(), 
        parsedInitialBalance
      );
      await accountService.addAccount(user.uid, newAccount);
      Alert.alert('Succès', 'Compte ajouté !');
      resetAccountForm();
      setAccountModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout du compte: ' + error.message);
      console.error(error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!currentAccount || !accountName || !initialBalance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const parsedInitialBalance = parseFloat(initialBalance);
    if (isNaN(parsedInitialBalance)) {
      Alert.alert('Erreur', 'Le solde initial doit être un nombre valide.');
      return;
    }

    try {
      await accountService.updateAccount(user.uid, currentAccount.id, {
        name: accountName,
        type: accountType,
      });
      Alert.alert('Succès', 'Compte mis à jour !');
      resetAccountForm();
      setAccountModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour du compte: ' + error.message);
      console.error(error);
    }
  };

  const handleDeleteAccount = useCallback(async (accountId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les transactions liées pourraient être affectées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await accountService.deleteAccount(user.uid, accountId);
              Alert.alert('Succès', 'Compte supprimé !');
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la suppression: ' + error.message);
              console.error(error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, [user.uid]);

  // Fonctions utilitaires
  const openEditBudgetModal = (budget) => {
    setCurrentBudget(budget);
    setBudgetName(budget.name);
    setBudgetAmount(budget.amount.toString());
    setStartDate(budget.startDate.toDate ? budget.startDate.toDate() : budget.startDate);
    setEndDate(budget.endDate.toDate ? budget.endDate.toDate() : budget.endDate);
    setFrequency(budget.frequency);
    setSelectedCategoryIds(budget.categoryIds || []);
    setEditMode(true);
    setBudgetModalVisible(true);
  };

  const openEditAccountModal = (account) => {
    setCurrentAccount(account);
    setAccountName(account.name);
    setAccountType(account.type);
    setInitialBalance(account.initialBalance.toString());
    setEditMode(true);
    setAccountModalVisible(true);
  };

  const resetBudgetForm = () => {
    setBudgetName('');
    setBudgetAmount('');
    setStartDate(new Date());
    setEndDate(new Date());
    setFrequency('monthly');
    setSelectedCategoryIds([]);
    setEditMode(false);
    setCurrentBudget(null);
  };

  const resetAccountForm = () => {
    setAccountName('');
    setAccountType('checking');
    setInitialBalance('');
    setEditMode(false);
    setCurrentAccount(null);
  };

  const onDateChange = (event, selectedDate, type) => {
    if (type === 'start') {
      setShowStartDatePicker(Platform.OS === 'ios');
      if (selectedDate) setStartDate(selectedDate);
    } else {
      setShowEndDatePicker(Platform.OS === 'ios');
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const renderBudgetContent = () => (
    <>
      {budgets.length === 0 ? (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataText}>Aucun budget enregistré.</Text>
          <Text style={styles.noDataSubText}>Appuyez sur "Ajouter" pour en créer un.</Text>
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const spent = calculateSpent(item);
            const progress = (spent / item.amount) * 100;
            const remainingDays = Math.ceil((item.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const budgetStatus = remainingDays > 0 ? `${remainingDays} jours restants` : 'Terminé';
            const progressBarColor = progress > 100 ? '#EF5350' : '#66BB6A';
            const isOverBudget = progress > 100;

            return (
              <View style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => openEditBudgetModal(item)} style={styles.iconButton}>
                      <Icon name="pencil-outline" size={20} color="#6A1B9A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteBudget(item.id)} style={styles.iconButton}>
                      <Icon name="delete-outline" size={20} color="#EF5350" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.budgetPeriod}>{item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}</Text>

                <View style={styles.budgetAmounts}>
                  <Text style={[styles.budgetAmountText, isOverBudget && styles.overBudgetAmount]}>
                    Dépensé: {formatCurrency(spent)}
                  </Text>
                  <Text style={styles.budgetAmountText}>
                    Budget: {formatCurrency(item.amount)}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${Math.min(100, progress)}%`, backgroundColor: progressBarColor }]} />
                </View>
                <Text style={[styles.budgetStatusText, isOverBudget && styles.overBudgetStatusText]}>
                  {isOverBudget ? `Dépassement de ${formatCurrency(spent - item.amount)}` : budgetStatus}
                </Text>
                {item.categoryIds && item.categoryIds.length > 0 && (
                  <Text style={styles.budgetCategories}>
                    Catégories: {item.categoryIds.map(id => categories.find(c => c.id === id)?.name || 'Inconnu').join(', ')}
                  </Text>
                )}
              </View>
            );
          }}
        />
      )}
    </>
  );

  const renderAccountContent = () => (
    <>
      {accounts.length === 0 ? (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataText}>Aucun compte enregistré.</Text>
          <Text style={styles.noDataSubText}>Appuyez sur "Ajouter" pour en créer un.</Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.accountItemContent}>
                <View style={styles.accountIconContainer}>
                  <Icon name={accountTypeIcons[item.type] || 'wallet'} size={30} color="#fff" />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.itemName}>{item.name} {item.isDefault ? '(Par défaut)' : ''}</Text>
                  <Text style={styles.accountType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.accountBalance}>Solde: {formatCurrency(item.currentBalance)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => openEditAccountModal(item)} style={styles.iconButton}>
                    <Icon name="pencil-outline" size={20} color="#6A1B9A" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAccount(item.id)} style={styles.iconButton}>
                    <Icon name="delete-outline" size={20} color="#EF5350" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#204921']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerBackground}
      >
        <Text style={styles.pageTitle}>Gestion Financière</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (activeTab === 'budgets') {
              setBudgetModalVisible(true);
              resetBudgetForm();
            } else {
              setAccountModalVisible(true);
              resetAccountForm();
            }
          }}
        >
          <Icon name="plus" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Navigation par onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budgets' && styles.activeTab]}
          onPress={() => setActiveTab('budgets')}
        >
          <Icon name="chart-pie" size={20} color={activeTab === 'budgets' ? '#6A1B9A' : '#777'} />
          <Text style={[styles.tabText, activeTab === 'budgets' && styles.activeTabText]}>Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accounts' && styles.activeTab]}
          onPress={() => setActiveTab('accounts')}
        >
          <Icon name="bank" size={20} color={activeTab === 'accounts' ? '#6A1B9A' : '#777'} />
          <Text style={[styles.tabText, activeTab === 'accounts' && styles.activeTabText]}>Comptes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'budgets' ? renderBudgetContent() : renderAccountContent()}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal pour les budgets */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={budgetModalVisible}
        onRequestClose={() => {
          setBudgetModalVisible(!budgetModalVisible);
          resetBudgetForm();
        }}
      >
        <ScrollView contentContainerStyle={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editMode ? 'Modifier le Budget' : 'Créer un Budget'}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nom du budget (ex: Alimentation mensuelle)"
              placeholderTextColor="#888"
              value={budgetName}
              onChangeText={setBudgetName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Montant du budget (ex: 50000)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />

            <Text style={styles.label}>Fréquence</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={frequency}
                style={styles.picker}
                onValueChange={(itemValue) => setFrequency(itemValue)}
              >
                <Picker.Item label="Mensuel" value="monthly" />
                <Picker.Item label="Hebdomadaire" value="weekly" />
                <Picker.Item label="Personnalisé" value="custom" />
              </Picker>
            </View>

            <Text style={styles.label}>Date de début</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{startDate.toLocaleDateString()}</Text>
              <Icon name="calendar-month-outline" size={20} color="#6A1B9A" />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'start')}
              />
            )}

            <Text style={styles.label}>Date de fin</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{endDate.toLocaleDateString()}</Text>
              <Icon name="calendar-month-outline" size={20} color="#6A1B9A" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'end')}
              />
            )}

            <Text style={styles.label}>Catégories concernées (Optionnel)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChipsScrollView}>
              <View style={styles.categorySelectionContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryIds.includes(cat.id) ? styles.selectedCategoryChip : {},
                      { backgroundColor: selectedCategoryIds.includes(cat.id) ? (cat.color || '#6A1B9A') : '#e0e0e0' }
                    ]}
                    onPress={() => toggleCategorySelection(cat.id)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategoryIds.includes(cat.id) ? styles.selectedCategoryChipText : {}]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={editMode ? handleUpdateBudget : handleAddBudget}
            >
              <Text style={styles.modalActionButtonText}>{editMode ? 'Mettre à Jour le Budget' : 'Créer le Budget'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalCancelButton]}
              onPress={() => { setBudgetModalVisible(false); resetBudgetForm(); }}
            >
              <Text style={styles.modalActionButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Modal pour les comptes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={accountModalVisible}
        onRequestClose={() => {
          setAccountModalVisible(!accountModalVisible);
          resetAccountForm();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editMode ? 'Modifier le Compte' : 'Ajouter un Compte'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du compte (ex: Compte Courant)"
              placeholderTextColor="#888"
              value={accountName}
              onChangeText={setAccountName}
            />
            
            <Text style={styles.label}>Type de compte</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={accountType}
                style={styles.picker}
                onValueChange={(itemValue) => setAccountType(itemValue)}
              >
                <Picker.Item label="Courant" value="checking" />
                <Picker.Item label="Épargne" value="savings" />
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="Carte de Crédit" value="credit_card" />
                <Picker.Item label="Investissement" value="investment" />
                <Picker.Item label="Autre" value="other" />
              </Picker>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Solde Initial"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
              editable={!editMode}
            />
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={editMode ? handleUpdateAccount : handleAddAccount}
            >
              <Text style={styles.modalActionButtonText}>{editMode ? 'Mettre à Jour' : 'Ajouter'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalCancelButton]}
              onPress={() => { setAccountModalVisible(false); resetAccountForm(); }}
            >
              <Text style={styles.modalActionButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A1B9A',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6A1B9A',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flex: 1,
    marginTop: -20,
    paddingTop: 20,
  },
  noDataCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
  },
  // Styles spécifiques aux budgets
  budgetPeriod: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetAmountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  overBudgetAmount: {
    color: '#EF5350',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  budgetStatusText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'right',
  },
  overBudgetStatusText: {
    color: '#EF5350',
    fontWeight: 'bold',
  },
  budgetCategories: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  // Styles spécifiques aux comptes
  accountItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountDetails: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  // Styles des modales
  centeredView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    alignSelf: 'flex-start',
    marginTop: 10,
    fontWeight: '500',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    width: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  categoryChipsScrollView: {
    maxHeight: 100,
    marginBottom: 15,
  },
  categorySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
    backgroundColor: '#e0e0e0',
  },
  selectedCategoryChip: {
    // Style géré dynamiquement
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActionButton: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  modalActionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BudgetsScreen;