// src/components/CustomAddButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const CustomAddButton = ({ onPress, focused }) => { // Ajoutez 'focused' pour un style potentiel basé sur l'état
  return (
    <TouchableOpacity
      style={styles.container} // Ce conteneur ne gérera plus le positionnement flottant
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#42A5F5', '#1976D2']} // Dégradé de bleu
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, focused && styles.focusedButton]} // Applique le style de base et un style si l'onglet est "focused"
      >
        <Icon name="plus" size={24} color="#FFFFFF" /> {/* Taille ajustée pour être dans la barre */}
      </LinearGradient>
      {/* Vous pouvez ajouter un texte sous l'icône si vous le souhaitez, comme les autres onglets */}
      {/* <Text style={styles.buttonText}>Ajouter</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Permet au bouton de prendre sa place dans la ligne des onglets
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 55, // Largeur plus petite pour s'intégrer
    height: 40, // Hauteur
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedButton: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  buttonText: {
    color: '#1976D2', // Couleur du texte pour l'onglet non-actif (si utilisé)
    fontSize: 12,
    marginTop: 4,
  }
});

export default CustomAddButton;