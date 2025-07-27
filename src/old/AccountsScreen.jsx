// src/screens/AccountsScreen.js
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { accountService } from '../services/AccountService';
import Account from '../models/Account';

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

function AccountsScreen({ userUid, onBack }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null); // Pour l'édition

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (!userUid) return;

    const unsubscribe = accountService.listenToAccounts(userUid, (accs) => {
      setAccounts(accs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  const handleAddAccount = async () => {
    if (!name || !initialBalance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const parsedInitialBalance = parseFloat(initialBalance);
    if (isNaN(parsedInitialBalance)) {
      Alert.alert('Erreur', 'Le solde initial doit être un nombre valide.');
      return;
    }

    try {
      const newAccount = new Account(userUid, name, type, parsedInitialBalance, '', new Date(), new Date(), parsedInitialBalance);
      await accountService.addAccount(userUid, newAccount);
      Alert.alert('Succès', 'Compte ajouté !');
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout du compte: ' + error.message);
      console.error(error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!currentAccount || !name || !initialBalance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const parsedInitialBalance = parseFloat(initialBalance);
    if (isNaN(parsedInitialBalance)) {
      Alert.alert('Erreur', 'Le solde initial doit être un nombre valide.');
      return;
    }

    try {
      // Pour une mise à jour, on ne change pas l'initialBalance et currentBalance directement ici.
      // Si l'initialBalance est modifiée, il faut une logique plus complexe pour recalculer le currentBalance.
      // Pour l'exemple, nous permettons seulement de modifier le nom et le type.
      await accountService.updateAccount(userUid, currentAccount.id, {
        name: name,
        type: type,
        // currentBalance: parsedInitialBalance, // Décommenter si vous gérez la mise à jour directe du solde initial
      });
      Alert.alert('Succès', 'Compte mis à jour !');
      resetForm();
      setModalVisible(false);
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
              await accountService.deleteAccount(userUid, accountId);
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
  }, [userUid]);

  const openEditModal = (account) => {
    setCurrentAccount(account);
    setName(account.name);
    setType(account.type);
    setInitialBalance(account.initialBalance.toString());
    setEditMode(true);
    setModalVisible(true);
  };

  const resetForm = () => {
    setName('');
    setType('checking');
    setInitialBalance('');
    setEditMode(false);
    setCurrentAccount(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des comptes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#007bff" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Mes Comptes</Text>

      <Button title="Ajouter un Nouveau Compte" onPress={() => { setModalVisible(true); resetForm(); }} />

      {accounts.length === 0 ? (
        <Text style={styles.noAccountsText}>Aucun compte enregistré.</Text>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.accountItem}>
              <View style={styles.accountIconContainer}>
                <Icon name={accountTypeIcons[item.type] || 'wallet'} size={30} color="#fff" />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{item.name} {item.isDefault ? '(Par défaut)' : ''}</Text>
                <Text style={styles.accountType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.accountBalance}>Solde: {formatCurrency(item.currentBalance)}</Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                <Icon name="pencil" size={20} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteAccount(item.id)} style={styles.deleteButton}>
                <Icon name="delete" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal pour ajouter/modifier un compte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editMode ? 'Modifier le Compte' : 'Ajouter un Compte'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du compte (ex: Compte Courant)"
              value={name}
              onChangeText={setName}
            />
            <Picker
              selectedValue={type}
              style={styles.picker}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Courant" value="checking" />
              <Picker.Item label="Épargne" value="savings" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Carte de Crédit" value="credit_card" />
              <Picker.Item label="Investissement" value="investment" />
              <Picker.Item label="Autre" value="other" />
            </Picker>
            <TextInput
              style={styles.modalInput}
              placeholder="Solde Initial"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
              editable={!editMode} // Le solde initial n'est pas modifiable en mode édition
            />
            <Button
              title={editMode ? 'Mettre à Jour' : 'Ajouter'}
              onPress={editMode ? handleUpdateAccount : handleAddAccount}
            />
            <Button title="Annuler" onPress={() => { setModalVisible(false); resetForm(); }} color="red" />
          </View>
        </View>
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
  noAccountsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accountIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff', // Couleur générique, peut être dynamique
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  centeredView: {
    flex: 1,
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
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default AccountsScreen;