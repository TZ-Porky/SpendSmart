import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importez vos écrans
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import BankSyncScreen from '../screens/BankSyncScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Mon Tableau de Bord' }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ title: 'Ajouter une Dépense' }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ title: 'Analyse des Dépenses' }}
        />
        <Stack.Screen
          name="Budget"
          component={BudgetScreen}
          options={{ title: 'Mes Budgets' }}
        />
        <Stack.Screen
          name="BankSync"
          component={BankSyncScreen}
          options={{ title: 'Synchronisation Bancaire' }}
        />
        {/* Ajoutez d'autres écrans ici */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
