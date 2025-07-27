/* eslint-disable react/no-unstable-nested-components */

// Importations
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Ecrans principaux
import HomeScreen from '../screens/Main/HomeScreen';
import TransactionsScreen from '../screens/Main/TransactionsScreen';
import BudgetsScreen from '../screens/Main/BudgetsScreen';
import InsightScreen from '../screens/Main/InsightScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';

// Formulaires et Détails
import AddTransactionScreen from '../screens/Main/AddTransactionScreen';
import TransactionDetailScreen from '../screens/Main/TransactionDetailScreen';
import AddBudgetScreen from '../screens/Main/AddBudgetScreen';
import BudgetDetailScreen from '../screens/Main/BudgetDetailScreen';
import ManageCategoriesScreen from '../screens/Main/ManageCategoriesScreen';
import AccountDetailScreen from '../screens/Main/AccountDetailScreen';
import AddAccountScreen from '../screens/Main/AddAccountScreen';
import AccountListScreen from '../screens/Main/AccountListScreen';

// Stacks
const HomeStack = createStackNavigator();
const TransactionsStack = createStackNavigator();
const BudgetsStack = createStackNavigator();
const InsightStack = createStackNavigator();
const SettingsStack = createStackNavigator();

// Définissez un Stack Navigator pour chaque onglet
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      {/* Vous pouvez ajouter d'autres écrans liés à l'accueil ici */}
      <HomeStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ headerShown: true, title: 'Détails du Compte' }}
      />
      <HomeStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ headerShown: true, title: 'Ajouter un Compte' }}
      />
      <HomeStack.Screen
        name="AccountList"
        component={AccountListScreen}
        options={{ headerShown: true, title: 'Mes Comptes' }}
      />
    </HomeStack.Navigator>
  );
}

function TransactionsStackScreen() {
  return (
    <TransactionsStack.Navigator screenOptions={{ headerShown: false }}>
      <TransactionsStack.Screen
        name="TransactionsList"
        component={TransactionsScreen}
      />
      <TransactionsStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ headerShown: true, title: 'Nouvelle Transaction' }}
      />
      <TransactionsStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ headerShown: true, title: 'Détail Transaction' }}
      />
    </TransactionsStack.Navigator>
  );
}

function BudgetsStackScreen() {
  return (
    <BudgetsStack.Navigator screenOptions={{ headerShown: false }}>
      <BudgetsStack.Screen name="BudgetsList" component={BudgetsScreen} />
      <BudgetsStack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{ headerShown: true, title: 'Nouveau Budget' }}
      />
      <BudgetsStack.Screen
        name="BudgetDetail"
        component={BudgetDetailScreen}
        options={{ headerShown: true, title: 'Détail Budget' }}
      />
    </BudgetsStack.Navigator>
  );
}

function InsightStackScreen() {
  return (
    <InsightStack.Navigator screenOptions={{ headerShown: false }}>
      <InsightStack.Screen name="Insight" component={InsightScreen} />
    </InsightStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ headerShown: true, title: 'Gérer Catégories' }}
      />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'Budgets') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Paramètres') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeStackScreen} />
      <Tab.Screen name="Transactions" component={TransactionsStackScreen} />
      <Tab.Screen name="Budgets" component={BudgetsStackScreen} />
      <Tab.Screen name="Insights" component={InsightStackScreen} />
      <Tab.Screen name="Paramètres" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
}

export default AppNavigator;
