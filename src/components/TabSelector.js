// src/components/TabSelector.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Pour le dégradé du bouton actif

/**
 * Composant de sélection d'onglet réutilisable (ex: Transactions / Budget).
 *
 * @param {object} props - Les props du composant.
 * @param {string} props.activeTab - L'onglet actuellement actif ('transactions' ou 'budget').
 * @param {function} props.onSelectTab - Fonction de rappel lorsque l'utilisateur sélectionne un onglet.
 */
const TabSelector = ({ activeTab, onSelectTab }) => {
  const activeGradientColors = ['#FF4081', '#E00040']; // Couleurs du dégradé pour l'onglet actif
  const inactiveColor = '#6A1B9A'; // Couleur de fond pour les onglets inactifs

  return (
    <View style={styles.selectorContainer}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('historiques')}
      >
        {activeTab === 'historiques' ? (
          <LinearGradient
            colors={activeGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTabBackground}
          >
            <Text style={styles.activeTabText}>Historiques</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.inactiveTabBackground, { backgroundColor: inactiveColor }]}>
            <Text style={styles.inactiveTabText}>Historiques</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('transaction')}
      >
        {activeTab === 'transaction' ? (
          <LinearGradient
            colors={activeGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTabBackground}
          >
            <Text style={styles.activeTabText}>Transaction</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.inactiveTabBackground, { backgroundColor: inactiveColor }]}>
            <Text style={styles.inactiveTabText}>Transaction</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#6A1B9A', // Couleur de fond du conteneur des sélecteurs (violet de la barre supérieure)
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: -25, // Remonter un peu pour chevaucher l'en-tête
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    // Assurez-vous que le zIndex est suffisant si d'autres éléments le chevauchent
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    borderRadius: 25, // Pour que le dégradé et le fond inactif s'adaptent
    overflow: 'hidden', // Important pour que le border radius fonctionne avec LinearGradient
  },
  activeTabBackground: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25, // Assurez un arrondi parfait
  },
  inactiveTabBackground: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inactiveTabText: {
    color: '#D1C4E9', // Couleur plus claire pour l'onglet inactif
    fontSize: 16,
  },
});

export default TabSelector;