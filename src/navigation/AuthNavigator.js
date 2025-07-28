// Importations
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Ecran
import AuthScreen from '../screens/Auth/AuthScreen';

const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthLogin" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

export default AuthNavigator;