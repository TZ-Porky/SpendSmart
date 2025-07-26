import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';

const AddTransactionScreen = () => {
  const [transactionData, setTransactionData] = useState({
    type: 'expense', // 'income', 'expense', 'transfer'
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recipient: '',
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = {
    income: [
      { id: 'salary', name: 'Salaire', icon: '💼' },
      { id: 'freelance', name: 'Freelance', icon: '💻' },
      { id: 'investment', name: 'Investissement', icon: '📈' },
      { id: 'gift', name: 'Cadeau', icon: '🎁' },
      { id: 'other_income', name: 'Autre', icon: '💰' },
    ],
    expense: [
      { id: 'food', name: 'Alimentation', icon: '🍕' },
      { id: 'transport', name: 'Transport', icon: '🚗' },
      { id: 'shopping', name: 'Shopping', icon: '🛍️' },
      { id: 'bills', name: 'Factures', icon: '📄' },
      { id: 'health', name: 'Santé', icon: '🏥' },
      { id: 'entertainment', name: 'Loisirs', icon: '🎮' },
      { id: 'education', name: 'Éducation', icon: '📚' },
      { id: 'other_expense', name: 'Autre', icon: '💸' },
    ],
    transfer: [
      { id: 'bank_transfer', name: 'Virement bancaire', icon: '🏦' },
      { id: 'mobile_money', name: 'Mobile Money', icon: '📱' },
      { id: 'cash', name: 'Espèces', icon: '💵' },
    ],
  };

  const transactionTypes = [
    { id: 'income', name: 'Revenus', icon: '💰', color: '#4CAF50' },
    { id: 'expense', name: 'Dépenses', icon: '💸', color: '#F44336' },
    { id: 'transfer', name: 'Transfert', icon: '🔄', color: '#2196F3' },
  ];

  const handleInputChange = (field, value) => {
    setTransactionData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = type => {
    setTransactionData(prev => ({
      ...prev,
      type,
      category: '', // Reset category when type changes
    }));
  };

  const handleCategorySelect = category => {
    setTransactionData(prev => ({
      ...prev,
      category: category.id,
    }));
    setShowCategoryModal(false);
  };

  const getSelectedCategory = () => {
    const categoryList = categories[transactionData.type];
    return categoryList.find(cat => cat.id === transactionData.category);
  };

  const validateForm = () => {
    if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return false;
    }

    if (!transactionData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    if (transactionData.type === 'transfer' && !transactionData.recipient) {
      Alert.alert('Erreur', 'Veuillez spécifier le destinataire du transfert');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert('Succès', 'Transaction ajoutée avec succès !', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTransactionData({
              type: 'expense',
              amount: '',
              category: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
              recipient: '',
            });
            console.log('Navigate back to HomeScreen');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = amount => {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Transaction</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Transaction Types */}
      <View style={styles.typeContainer}>
        {transactionTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              transactionData.type === type.id && [
                styles.activeTypeButton,
                { backgroundColor: type.color },
              ],
            ]}
            onPress={() => handleTypeChange(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeText,
                transactionData.type === type.id && styles.activeTypeText,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Montant</Text>
        <View style={styles.amountInputContainer}>
          <TextInput
            style={styles.amountInput}
            value={formatAmount(transactionData.amount)}
            onChangeText={value =>
              handleInputChange('amount', value.replace(/\s/g, ''))
            }
            placeholder="0"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
          />
          <Text style={styles.currency}>FCFA</Text>
        </View>
      </View>

      {/* Category Selection */}
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryLabel}>Catégorie</Text>
          {getSelectedCategory() ? (
            <View style={styles.selectedCategory}>
              <Text style={styles.categoryIcon}>
                {getSelectedCategory().icon}
              </Text>
              <Text style={styles.categoryName}>
                {getSelectedCategory().name}
              </Text>
            </View>
          ) : (
            <Text style={styles.categoryPlaceholder}>
              Choisir une catégorie
            </Text>
          )}
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>

      {/* Recipient (for transfers) */}
      {transactionData.type === 'transfer' && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Destinataire</Text>
          <TextInput
            style={styles.input}
            value={transactionData.recipient}
            onChangeText={value => handleInputChange('recipient', value)}
            placeholder="Nom du destinataire"
            placeholderTextColor="#999"
          />
        </View>
      )}

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={transactionData.description}
          onChangeText={value => handleInputChange('description', value)}
          placeholder="Ajouter une note..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Date */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date</Text>
        <TextInput
          style={styles.input}
          value={transactionData.date}
          onChangeText={value => handleInputChange('date', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Ajout en cours...' : 'Ajouter la transaction'}
        </Text>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une catégorie</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryList}>
              {categories[transactionData.type].map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryItemIcon}>{category.icon}</Text>
                  <Text style={styles.categoryItemName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

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
  placeholder: {
    width: 40,
  },
  typeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  activeTypeButton: {
    backgroundColor: '#5F33FD',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeText: {
    color: '#fff',
  },
  amountContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    padding: 0,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#666',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#ccc',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5F33FD',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#5F33FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    maxHeight: '70%',
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
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryItemName: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddTransactionScreen;
