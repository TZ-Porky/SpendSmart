/* eslint-disable react/no-unstable-nested-components */
// src/screens/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importez Icon
import firestore from '@react-native-firebase/firestore';

import { transactionService } from '../services/TransactionService';
import { balanceService } from '../services/BalanceService';
import { budgetService } from '../services/BudgetService';
import { categoryService } from '../services/CategoryService';
import { userService } from '../services/UserService';
import BalanceSummary from '../models/BalanceSummary';

// Helper pour formater les devises (peut être déplacé dans un fichier utils)
const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0, // Pour éviter les .00 si ce n'est pas nécessaire
    maximumFractionDigits: 2,
  }).format(amount);
};

// Mapper les noms d'icônes aux composants réels si nécessaire
// eslint-disable-next-line no-unused-vars
const categoryIcons = {}; // Vous pouvez populer ceci si vous avez des icônes spécifiques pour chaque catégorie.

function DashboardScreen({ userUid, onNavigateToAddTransaction, onNavigateToAccounts, onNavigateToBudgets, onNavigateToProfile, onNavigateToInsight }) {
  const [userDisplayName, setUserDisplayName] = useState('Chargement...');
  const [balanceSummary, setBalanceSummary] = useState(new BalanceSummary(userUid)); // Valeur par défaut
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]); // Pour mapper les IDs de catégorie aux noms/icônes
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    if (!userUid) return;

    const unsubscribeBalance = balanceService.listenToBalanceSummary(userUid, (summary) => {
      setBalanceSummary(summary || new BalanceSummary(userUid)); // Assurez-vous d'avoir un objet BalanceSummary
      setLoading(false);
    });

    const unsubscribeTransactions = transactionService.listenToTransactions(userUid, (txs) => {
      setTransactions(txs);
      setLoading(false);
    });

    const unsubscribeBudgets = budgetService.listenToBudgets(userUid, (bgs) => {
      setBudgets(bgs);
      setLoading(false);
    });

    const unsubscribeCategories = categoryService.listenToAllCategories(userUid, (cats) => {
      setCategories(cats);
      setLoading(false);
    });

    // Optionnel: Récupérer le nom de l'utilisateur pour l'affichage
    const fetchUserName = async () => {
      const userDoc = await firestore().collection('users').doc(userUid).get();
      if (userDoc.exists && userDoc.data().displayName) {
        setUserDisplayName(userDoc.data().displayName);
      } else {
        setUserDisplayName('Utilisateur');
      }
    };
    fetchUserName();

    const fetchUserProfile = async () => {
      try {
        const currentUserData = await userService.getUser(userUid);
        if (currentUserData) {
          setUserProfile(currentUserData); // <--- AJOUTER CETTE LIGNE
          setUserDisplayName(currentUserData.displayName || 'Utilisateur');
        } else {
          setUserDisplayName('Utilisateur');
        }
      } catch (error) {
        console.error('Error fetching user profile for dashboard:', error);
        setUserDisplayName('Utilisateur');
      }
    };
    fetchUserProfile();


    return () => {
      unsubscribeBalance();
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeCategories();
    };
  }, [userUid]);

  const getCategoryDetails = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: 'Inconnu', iconName: 'help', color: '#ccc' };
  }, [categories]);

  const handleDeleteTransaction = useCallback(async (transactionId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              // La logique de suppression dans transactionService gère la mise à jour des soldes
              await transactionService.deleteTransaction(userUid, transactionId);
              Alert.alert('Succès', 'Transaction supprimée !');
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

  // Calcul des dépenses du budget en cours (simplifié pour l'exemple)
  const currentBudget = budgets.length > 0 ? budgets[0] : null; // Prend le premier budget pour l'exemple
  let spentInCurrentBudget = 0;
  if (currentBudget) {
    const budgetStartDate = currentBudget.startDate.getTime();
    const budgetEndDate = currentBudget.endDate.getTime();

    spentInCurrentBudget = transactions.reduce((sum, tx) => {
      const txDate = tx.date.getTime();
      const categoryMatch = currentBudget.categoryIds.length === 0 || currentBudget.categoryIds.includes(getCategoryDetails(tx.category).id);

      if (tx.type === 'expense' && txDate >= budgetStartDate && txDate <= budgetEndDate && categoryMatch) {
        return sum + Math.abs(tx.amount); // Les dépenses sont stockées en négatif
      }
      return sum;
    }, 0);
  }


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des données financières...</Text>
      </View>
    );
  }

  const userCurrency = balanceSummary ? balanceSummary.currency || 'XOF' : 'XOF';

  return (
    <ScrollView style={styles.container}>
      {/* En-tête Utilisateur */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.userInfo} onPress={onNavigateToProfile}> {/* Rendre l'avatar/nom cliquable */}
          {userProfile?.photoURL ? ( // Utiliser userProfile pour l'image
              <Image source={{ uri: userProfile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userDisplayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.userName}>Bonjour, {userDisplayName}</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bell-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="cog-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carte du Solde Global */}
      <View style={styles.summaryCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.summaryTitle}>Votre solde</Text>
          <TouchableOpacity onPress={() => console.log('Voir plus options solde')}>
            <Icon name="dots-horizontal" size={24} color="#555" />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(balanceSummary.currentBalance, userCurrency)}</Text>
        <View style={styles.summaryDetails}>
          <Text style={styles.profitText}>Profits: {formatCurrency(balanceSummary.totalIncome, userCurrency)}</Text>
          <Text style={styles.expenseText}>Dépenses: {formatCurrency(Math.abs(balanceSummary.totalExpenses), userCurrency)}</Text>
        </View>
      </View>

      {/* Boutons de Navigation Rapide (simulent la barre de navigation) */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navigationButtonsContainer}>
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToAddTransaction}>
          <Icon name="plus-circle-outline" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Ajouter Trans.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={onNavigateToAccounts}>
          <Icon name="bank-outline" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Mes Comptes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={onNavigateToBudgets}>
          <Icon name="cash-multiple" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Mes Budgets</Text>
        </TouchableOpacity>

        {/* Ajoutez d'autres boutons si nécessaire */}
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToInsight}> {/* <--- AJOUT DE CE BOUTON */}
          <Icon name="chart-bar" size={24} color="#007bff" />
          <Text style={styles.navButtonText}>Analyses</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Transactions Récentes */}
      <Text style={styles.sectionHeader}>Transactions Récentes</Text>
      {transactions.length === 0 ? (
        <Text style={styles.noTransactionsText}>Aucune transaction enregistrée.</Text>
      ) : (
        <FlatList
          data={transactions.slice(0, 5)} // Afficher seulement les 5 plus récentes
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isExpense = item.type === 'expense';
            const transactionAmount = isExpense ? Math.abs(item.amount) : item.amount;
            const category = getCategoryDetails(item.category);
            const displayAmount = isExpense ? `-${formatCurrency(transactionAmount, userCurrency)}` : `+${formatCurrency(transactionAmount, userCurrency)}`;

            return (
              <View style={styles.transactionItem}>
                <View style={[styles.transactionIconContainer, { backgroundColor: category.color }]}>
                  <Icon name={category.iconName} size={24} color="#fff" />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{item.description}</Text>
                  <Text style={styles.transactionCategory}>{item.detail || category.name}</Text>
                  <Text style={styles.transactionDate}>{item.date.toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.transactionAmount, isExpense ? styles.negativeAmount : styles.positiveAmount]}>
                  {displayAmount}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={styles.deleteButton}>
                    <Icon name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListFooterComponent={() => (
            transactions.length > 5 && (
              <TouchableOpacity onPress={() => console.log('Voir toutes les transactions')} style={styles.seeAllButton}>
                <Text style={styles.seeAllButtonText}>Tout voir</Text>
              </TouchableOpacity>
            )
          )}
        />
      )}

      {/* État du Budget */}
      <Text style={styles.sectionHeader}>État du Budget</Text>
      {currentBudget ? (
        <View style={styles.budgetCard}>
          <Text style={styles.budgetName}>{currentBudget.name}</Text>
          <View style={styles.budgetProgressContainer}>
            <View style={[styles.progressBar, { width: `${(spentInCurrentBudget / currentBudget.amount) * 100}%` }]} />
          </View>
          <View style={styles.budgetDetails}>
            <Text style={styles.budgetText}>Dépenses: {formatCurrency(spentInCurrentBudget, userCurrency)}</Text>
            <Text style={styles.budgetText}>Budget: {formatCurrency(currentBudget.amount, userCurrency)}</Text>
          </View>
          <Text style={styles.budgetText}>Durée restante: {(currentBudget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) > 0 ? `${Math.ceil((currentBudget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Jours` : 'Terminé'}</Text>
        </View>
      ) : (
        <Text style={styles.noBudgetText}>Aucun budget actif. Créez-en un pour suivre vos dépenses !</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Ajoutez un style pour l'image de l'avatar si photoURL est utilisé
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },

  // Carte du Solde Global
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    color: '#555',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginVertical: 10,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  profitText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  expenseText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
  },

  // Boutons de Navigation
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },

  navigationButtonsContainer: {
    flexDirection: 'row', // Important: aligne les éléments horizontalement
    justifyContent: 'space-around', // Distribue l'espace si pas assez d'éléments pour remplir
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
    // Note: Le ScrollView lui-même aura une largeur fixe, mais son contenu peut dépasser
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff', // Fond blanc pour les boutons
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 8, // Espacement entre les boutons
    minWidth: 100, // Largeur minimale pour chaque bouton
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Liste des Transactions
  transactionItem: {
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
  transactionIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  positiveAmount: {
    color: '#28a745',
  },
  negativeAmount: {
    color: '#dc3545',
  },
  deleteButton: {
    marginLeft: 15,
    backgroundColor: '#dc3545',
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  seeAllButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // État du Budget
  budgetCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  budgetProgressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  budgetText: {
    fontSize: 15,
    color: '#555',
  },
  noBudgetText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
});

export default DashboardScreen;