import React from 'react';
import { View } from 'react-native';
//import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import BudgetWalletScreen from './src/screens/BudgetScreen';

function App() {
  return (
    <View>
       <AuthScreen />
    </View>
  )
}

export default App;