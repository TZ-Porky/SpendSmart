/* eslint-disable react/no-unstable-nested-components */

import React from 'react';
import { View, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Écrans principaux
import HomeScreen from '../screens/Main/HomeScreen';
import TransactionsScreen from '../screens/Main/TransactionsScreen';
import BudgetsScreen from '../screens/Main/BudgetsScreen';
import StatisticsScreen from '../screens/Main/StatisticsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';

// Écrans d'ajout
import AddTransactionScreen from '../old/AddExpenseScreen';

// === ÉCRANS PLACEHOLDER ===
const AddBudgetScreen = () => (
  <View style={placeholderStyles.container}>
    <Text style={placeholderStyles.text}>Page Ajout Budget</Text>
  </View>
);

const AddInsightDataScreen = () => (
  <View style={placeholderStyles.container}>
    <Text style={placeholderStyles.text}>Page Ajout Donnée Insight</Text>
  </View>
);

// === COMPOSANT BOUTON D'AJOUT INTÉGRÉ ===
const CustomAddButton = ({ onPress, focused }) => {
  return (
    <TouchableOpacity
      style={customButtonStyles.container}
      onPress={() => {
        console.log('CustomAddButton pressed internally');
        // On ne fait rien ici, on laisse les listeners gérer
        // onPress?.();
      }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#42A5F5', '#1976D2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[customButtonStyles.button, focused && customButtonStyles.focusedButton]}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// === CONSTANTES ===
const TAB_NAMES = {
  HOME: 'Accueil',
  TRANSACTIONS: 'Transactions',
  QUICK_ADD: 'QuickAdd',
  BUDGETS: 'Budgets',
  INSIGHT: 'Insight',
  PROFILE: 'Profile'
};

const COLORS = {
  ACTIVE_TAB: '#007AFF',
  INACTIVE_TAB: 'gray',
  TAB_BAR_BG: '#FFF'
};

// === CRÉATEURS DE STACK ===
const HomeStack = createStackNavigator();
const TransactionsStack = createStackNavigator();
const BudgetsStack = createStackNavigator();
const InsightStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// === CONFIGURATIONS D'ÉCRANS ===
const defaultStackOptions = { headerShown: false };
const headerShownOptions = { headerShown: true };

// === COMPOSANTS DE STACK ===
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={defaultStackOptions}>
      <HomeStack.Screen 
        name="HomeDashboard" 
        component={HomeScreen} 
      />
      <HomeStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ ...defaultStackOptions, title: 'Détails du Compte' }}
      />
      <HomeStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ ...headerShownOptions, title: 'Nouvelle Transaction' }}
      />
    </HomeStack.Navigator>
  );
}

function TransactionsStackScreen() {
  return (
    <TransactionsStack.Navigator screenOptions={defaultStackOptions}>
      <TransactionsStack.Screen
        name="TransactionsList"
        component={TransactionsScreen}
      />
      <TransactionsStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ ...headerShownOptions, title: 'Nouvelle Transaction' }}
      />
    </TransactionsStack.Navigator>
  );
}

function BudgetsStackScreen() {
  return (
    <BudgetsStack.Navigator screenOptions={defaultStackOptions}>
      <BudgetsStack.Screen 
        name="BudgetsList" 
        component={BudgetsScreen} 
      />
      <BudgetsStack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{ ...headerShownOptions, title: 'Nouveau Budget' }}
      />
    </BudgetsStack.Navigator>
  );
}

function InsightStackScreen() {
  return (
    <InsightStack.Navigator screenOptions={defaultStackOptions}>
      <InsightStack.Screen 
        name="InsightOverview" 
        component={StatisticsScreen} 
      />
      <InsightStack.Screen
        name="AddInsightData"
        component={AddInsightDataScreen}
        options={{ ...headerShownOptions, title: 'Ajouter Données' }}
      />
    </InsightStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={defaultStackOptions}>
      <ProfileStack.Screen 
        name="ProfileDetail" 
        component={ProfileScreen} 
      />
    </ProfileStack.Navigator>
  );
}

// === CONFIGURATION DES ICÔNES ===
const getTabBarIcon = (routeName, focused) => {
  const iconMap = {
    [TAB_NAMES.HOME]: focused ? 'home' : 'home-outline',
    [TAB_NAMES.TRANSACTIONS]: focused ? 'swap-horizontal' : 'swap-horizontal-outline',
    [TAB_NAMES.BUDGETS]: focused ? 'cash' : 'cash-outline',
    [TAB_NAMES.INSIGHT]: focused ? 'stats-chart' : 'stats-chart-outline',
    [TAB_NAMES.PROFILE]: focused ? 'person' : 'person-outline'
  };
  
  return iconMap[routeName];
};

// === GESTIONNAIRE D'ACTIONS RAPIDES ===
const useQuickAddHandler = () => {
  const navigation = useNavigation();
  
  const handleQuickAdd = () => {
    console.log('=== handleQuickAdd called ===');
    
    const state = navigation.getState();
    console.log('Navigation state:', state);
    
    const route = state.routes[state.index];
    console.log('Current route:', route);
    console.log('Current route name:', route.name);
    
    const quickAddActions = {
      [TAB_NAMES.HOME]: () => {
        console.log('Navigating to HOME -> AddTransaction');
        navigation.navigate(TAB_NAMES.HOME, { screen: 'AddTransaction' });
      },
      [TAB_NAMES.TRANSACTIONS]: () => {
        console.log('Navigating to TRANSACTIONS -> AddTransaction');
        navigation.navigate(TAB_NAMES.TRANSACTIONS, { screen: 'AddTransaction' });
      },
      [TAB_NAMES.BUDGETS]: () => {
        console.log('Navigating to BUDGETS -> AddBudget');
        navigation.navigate(TAB_NAMES.BUDGETS, { screen: 'AddBudget' });
      },
      [TAB_NAMES.INSIGHT]: () => {
        console.log('Navigating to INSIGHT -> AddInsightData');
        navigation.navigate(TAB_NAMES.INSIGHT, { screen: 'AddInsightData' });
      },
      [TAB_NAMES.PROFILE]: () => {
        console.log('Profile tab - showing alert');
        Alert.alert("Action rapide", "Pas d'action rapide définie pour le profil.");
      }
    };
    
    console.log('Available actions:', Object.keys(quickAddActions));
    const action = quickAddActions[route.name];
    console.log('Selected action for route:', route.name, 'exists:', !!action);
    
    if (action) {
      console.log('Executing action...');
      try {
        action();
        console.log('Action executed successfully');
      } catch (error) {
        console.error('Error executing action:', error);
      }
    } else {
      console.log('No action found, showing default alert');
      Alert.alert("Action rapide", "Aucune action définie pour cet écran.");
    }
  };
  
  return handleQuickAdd;
};

// === COMPOSANT PRINCIPAL ===
function AppNavigator() {
  const handleQuickAdd = useQuickAddHandler();

  const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
      if (route.name === TAB_NAMES.QUICK_ADD) {
        // On retourne directement le bouton sans onPress
        return <CustomAddButton focused={focused} />;
      }
      
      const iconName = getTabBarIcon(route.name, focused);
      return <Icon name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: COLORS.ACTIVE_TAB,
    tabBarInactiveTintColor: COLORS.INACTIVE_TAB,
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name={TAB_NAMES.HOME} 
        component={HomeStackScreen} 
        options={{ tabBarLabel: 'Accueil' }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.TRANSACTIONS} 
        component={TransactionsStackScreen} 
        options={{ tabBarLabel: 'Transactions' }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.BUDGETS} 
        component={BudgetsStackScreen} 
        options={{ tabBarLabel: 'Budgets' }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.INSIGHT} 
        component={InsightStackScreen} 
        options={{ tabBarLabel: 'Analyse' }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.PROFILE} 
        component={ProfileStackScreen} 
        options={{ tabBarLabel: 'Profil' }} 
      />
    </Tab.Navigator>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: COLORS.TAB_BAR_BG,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});

const customButtonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 55,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedButton: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default AppNavigator;