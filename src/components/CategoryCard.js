// src/components/CategoryCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Fonction utilitaire pour le formatage du montant (15000 -> 15K)
const formatAmountForDisplay = (amount) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`; // Pour 15000 -> 15K
  }
  return amount.toString();
};

/**
 * Composant de carte réutilisable pour afficher une catégorie de dépense/revenu.
 *
 * @param {object} props - Les props du composant.
 * @param {object} props.category - L'objet catégorie à afficher.
 * Doit contenir: id, name, description, amount.
 * @param {function} [props.onPress] - Fonction de rappel lorsque la carte est pressée.
 */
const CategoryCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress && onPress(category)}>
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <View style={styles.amountCircle}>
        <Text style={styles.amountText}>{formatAmountForDisplay(category.amount)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20, // Les marges pour l'alignement
    marginVertical: 5,    // Marge pour espacer chaque carte
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  detailsContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  amountCircle: {
    width: 60, // Taille du cercle
    height: 60,
    borderRadius: 30, // Pour faire un cercle
    backgroundColor: '#E0E0E0', // Couleur de fond du cercle
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderWidth: 2, // Bordure pour le cercle comme sur la capture
    borderColor: '#D1C4E9', // Une couleur proche du violet clair
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryCard;