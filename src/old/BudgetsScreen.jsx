/* eslint-disable react-native/no-inline-styles */
// src/screens/BudgetsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { budgetService } from '../services/BudgetService';
import { categoryService } from '../services/CategoryService';
import { transactionService } from '../services/TransactionService'; // Pour calculer les dépenses du budget
import Budget from '../models/Budget';

const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

function BudgetsScreen({ userUid, onBack }) {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]); // Pour calculer les dépenses réelles
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [frequency, setFrequency] = useState('monthly');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);


  useEffect(() => {
    if (!userUid) return;

    const unsubscribeBudgets = budgetService.listenToBudgets(userUid, (bgs) => {
      setBudgets(bgs);
      setLoading(false);
    });

    const unsubscribeCategories = categoryService.listenToAllCategories(userUid, (cats) => {
      setCategories(cats.filter(c => c.type === 'expense')); // Seules les catégories de dépenses pour les budgets
    });

    // Écoute des transactions pour calculer le "spent" des budgets
    const unsubscribeTransactions = transactionService.listenToTransactions(userUid, (txs) => {
        setTransactions(txs);
    });

    return () => {
        unsubscribeBudgets();
        unsubscribeCategories();
        unsubscribeTransactions();
    };
  }, [userUid]);

  const calculateSpent = useCallback((budget) => {
    const budgetStartDate = budget.startDate.getTime();
    const budgetEndDate = budget.endDate.getTime();

    return transactions.reduce((sum, tx) => {
      const txDate = tx.date.getTime();
      const isExpense = tx.type === 'expense';
      const isWithinDateRange = txDate >= budgetStartDate && txDate <= budgetEndDate;

      // Si le budget est lié à des catégories spécifiques, vérifier la correspondance
      const isCategoryMatch = budget.categoryIds.length === 0 || budget.categoryIds.includes(tx.category);

      if (isExpense && isWithinDateRange && isCategoryMatch) {
        return sum + Math.abs(tx.amount);
      }
      return sum;
    }, 0);
  }, [transactions]);


  const handleAddBudget = async () => {
    if (!name || !amount || !startDate || !endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const parsedAmount = parseFloat(amount);
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
        userUid,
        name,
        parsedAmount,
        startDate,
        endDate,
        frequency,
        '', // ID vide
        selectedCategoryIds
      );
      await budgetService.addBudget(userUid, newBudget);
      Alert.alert('Succès', 'Budget ajouté !');
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout du budget: ' + error.message);
      console.error(error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!currentBudget || !name || !amount || !startDate || !endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Le montant du budget doit être un nombre positif.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    try {
      await budgetService.updateBudget(userUid, currentBudget.id, {
        name: name,
        amount: parsedAmount,
        startDate: startDate,
        endDate: endDate,
        frequency: frequency,
        categoryIds: selectedCategoryIds,
      });
      Alert.alert('Succès', 'Budget mis à jour !');
      resetForm();
      setModalVisible(false);
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
              await budgetService.deleteBudget(userUid, budgetId);
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
  }, [userUid]);

  const openEditModal = (budget) => {
    setCurrentBudget(budget);
    setName(budget.name);
    setAmount(budget.amount.toString());
    setStartDate(budget.startDate);
    setEndDate(budget.endDate);
    setFrequency(budget.frequency);
    setSelectedCategoryIds(budget.categoryIds || []);
    setEditMode(true);
    setModalVisible(true);
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setStartDate(new Date());
    setEndDate(new Date());
    setFrequency('monthly');
    setSelectedCategoryIds([]);
    setEditMode(false);
    setCurrentBudget(null);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#007bff" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Mes Budgets</Text>

      <Button title="Créer un Nouveau Budget" onPress={() => { setModalVisible(true); resetForm(); }} />

      {budgets.length === 0 ? (
        <Text style={styles.noBudgetsText}>Aucun budget enregistré.</Text>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const spent = calculateSpent(item);
            const progress = (spent / item.amount) * 100;
            const remainingDays = Math.ceil((item.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const budgetStatus = remainingDays > 0 ? `${remainingDays} jours restants` : 'Terminé';
            const progressBarColor = progress > 100 ? '#dc3545' : '#28a745'; // Rouge si dépassé

            return (
              <View style={styles.budgetItem}>
                <View style={styles.budgetHeaderRow}>
                  <Text style={styles.budgetItemName}>{item.name}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                      <Icon name="pencil" size={20} color="#007bff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteBudget(item.id)} style={styles.deleteButton}>
                      <Icon name="delete" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.budgetItemPeriod}>{item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()} ({budgetStatus})</Text>
                <View style={styles.budgetItemProgressContainer}>
                  <View style={[styles.budgetItemProgressBar, { width: `${Math.min(100, progress)}%`, backgroundColor: progressBarColor }]} />
                </View>
                <View style={styles.budgetItemAmounts}>
                  <Text style={styles.budgetItemAmountText}>Dépensé: {formatCurrency(spent)}</Text>
                  <Text style={styles.budgetItemAmountText}>Total: {formatCurrency(item.amount)}</Text>
                </View>
                {item.categoryIds && item.categoryIds.length > 0 && (
                    <Text style={styles.budgetItemCategories}>Catégories: {item.categoryIds.map(id => categories.find(c => c.id === id)?.name || 'Inconnu').join(', ')}</Text>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Modal pour ajouter/modifier un budget */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <ScrollView contentContainerStyle={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editMode ? 'Modifier le Budget' : 'Créer un Budget'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du budget (ex: Budget Alimentation)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Montant du budget"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Fréquence</Text>
            <Picker
              selectedValue={frequency}
              style={styles.picker}
              onValueChange={(itemValue) => setFrequency(itemValue)}
            >
              <Picker.Item label="Mensuel" value="monthly" />
              <Picker.Item label="Hebdomadaire" value="weekly" />
              <Picker.Item label="Personnalisé" value="custom" />
            </Picker>

            <Text style={styles.label}>Date de début</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'start')}
              />
            )}

            <Text style={styles.label}>Date de fin</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
              <Text>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => onDateChange(event, selectedDate, 'end')}
              />
            )}

            <Text style={styles.label}>Catégories concernées (Optionnel)</Text>
            <View style={styles.categorySelectionContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategoryIds.includes(cat.id) ? styles.selectedCategoryChip : {},
                    { backgroundColor: selectedCategoryIds.includes(cat.id) ? cat.color : '#e0e0e0' }
                  ]}
                  onPress={() => toggleCategorySelection(cat.id)}
                >
                  <Text style={[styles.categoryChipText, selectedCategoryIds.includes(cat.id) ? styles.selectedCategoryChipText : {}]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            <Button
              title={editMode ? 'Mettre à Jour' : 'Créer'}
              onPress={editMode ? handleUpdateBudget : handleAddBudget}
            />
            <Button title="Annuler" onPress={() => { setModalVisible(false); resetForm(); }} color="red" />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007bff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  noBudgetsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  budgetItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  budgetItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  budgetItemPeriod: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  budgetItemProgressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  budgetItemProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetItemAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItemAmountText: {
    fontSize: 15,
    color: '#555',
  },
  budgetItemCategories: {
    fontSize: 13,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  centeredView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  datePickerButton: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    height: 50,
  },
  categorySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedCategoryChip: {
    borderColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BudgetsScreen;