// src/components/SplashScreen.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/AppIcon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Chargement de l'application...</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.indicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1b3c5a', // Couleur de fond de votre splashscreen
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  indicator: {
    marginTop: 20,
  },
});

export default SplashScreen;