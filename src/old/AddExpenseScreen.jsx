/* eslint-disable react-native/no-inline-styles */
// src/screens/AddTransactionScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // npm install @react-native-community/datetimepicker
import { transactionService } from '../services/TransactionService';
import { accountService } from '../services/AccountService';
import { categoryService } from '../services/CategoryService';
import Transaction from '../models/Transaction';

function AddTransactionScreen({ userUid, onTransactionAdded }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState('expense'); // 'expense', 'income', 'transfer'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transferToAccount, setTransferToAccount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userUid) return;

    const unsubscribeAccounts = accountService.listenToAccounts(userUid, (accs) => {
      setAccounts(accs);
      if (accs.length > 0 && !selectedAccount) {
        setSelectedAccount(accs[0].id); // Sélectionne le premier compte par défaut
      }
      if (accs.length > 1 && !transferToAccount) {
        // Sélectionne un compte différent du premier pour le transfert
        setTransferToAccount(accs[1].id || accs[0].id);
      }
      setLoading(false);
    });

    const unsubscribeCategories = categoryService.listenToAllCategories(userUid, (cats) => {
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        // Sélectionne une catégorie par défaut pour les dépenses
        const defaultExpenseCat = cats.find(c => c.type === 'expense');
        setSelectedCategory(defaultExpenseCat ? defaultExpenseCat.id : cats[0].id);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeCategories();
    };
  }, [userUid, selectedAccount, transferToAccount, selectedCategory]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const getFilteredCategories = useCallback(() => {
    return categories.filter(cat => cat.type === type);
  }, [categories, type]);

  const handleAddTransaction = async () => {
    if (!amount || !description || !selectedAccount) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le montant, la description et sélectionner un compte.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un nombre positif.');
      return;
    }

    let finalAmount = parsedAmount;
    if (type === 'expense') {
      finalAmount = -parsedAmount; // Les dépenses sont négatives
    } else if (type === 'transfer') {
      finalAmount = -parsedAmount; // Le transfert sort du compte sélectionné
      if (!transferToAccount || selectedAccount === transferToAccount) {
        Alert.alert('Erreur', 'Veuillez sélectionner un compte de destination différent pour le transfert.');
        return;
      }
    }

    try {
      const newTransaction = new Transaction(
        userUid,
        selectedAccount,
        finalAmount,
        description,
        type,
        type !== 'transfer' ? selectedCategory : null, // Catégorie null pour les transferts
        date,
        '', // ID vide, Firestore le générera
        detail,
        type === 'transfer' ? transferToAccount : '' // Compte de destination pour les transferts
      );
      await transactionService.addTransaction(userUid, newTransaction);
      Alert.alert('Succès', 'Transaction ajoutée !');
      // Réinitialiser le formulaire
      setAmount('');
      setDescription('');
      setDetail('');
      setType('expense');
      // Réinitialiser les sélecteurs par défaut
      if (accounts.length > 0) setSelectedAccount(accounts[0].id);
      if (categories.length > 0) setSelectedCategory(categories.find(c => c.type === 'expense')?.id || categories[0].id);
      setTransferToAccount('');
      setDate(new Date());
      onTransactionAdded(); // Notifier le parent que la transaction a été ajoutée (ex: pour revenir au Dashboard)
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout de la transaction: ' + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ajouter une Nouvelle Transaction</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type de transaction</Text>
        <Picker
          selectedValue={type}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setType(itemValue);
            // Réinitialiser la catégorie si le type change
            if (itemValue !== 'transfer') {
              const defaultCat = categories.find(c => c.type === itemValue);
              setSelectedCategory(defaultCat ? defaultCat.id : '');
            } else {
              setSelectedCategory(''); // Pas de catégorie pour les transferts
            }
          }}
        >
          <Picker.Item label="Dépense" value="expense" />
          <Picker.Item label="Revenu" value="income" />
          <Picker.Item label="Transfert" value="transfer" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Montant</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 50000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Compte</Text>
        <Picker
          selectedValue={selectedAccount}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedAccount(itemValue)}
        >
          {accounts.map(account => (
            <Picker.Item key={account.id} label={account.name} value={account.id} />
          ))}
        </Picker>
      </View>

      {type === 'transfer' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vers le compte</Text>
          <Picker
            selectedValue={transferToAccount}
            style={styles.picker}
            onValueChange={(itemValue) => setTransferToAccount(itemValue)}
          >
            {accounts.filter(acc => acc.id !== selectedAccount).map(account => (
              <Picker.Item key={account.id} label={account.name} value={account.id} />
            ))}
          </Picker>
        </View>
      )}

      {type !== 'transfer' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {getFilteredCategories().map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Achat de courses, Salaire du mois"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Détail (Optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Carrefour, Paiement de Victoire"
          value={detail}
          onChangeText={setDetail}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      <Button title="Ajouter la Transaction" onPress={handleAddTransaction} />
      <Button title="Annuler" onPress={onTransactionAdded} color="red" style={{marginTop: 10}} />
    </ScrollView>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50, // Nécessaire pour iOS
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    height: 50,
  },
  button: {
    marginTop: 10,
  },
});

export default AddTransactionScreen;