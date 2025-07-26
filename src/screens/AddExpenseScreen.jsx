// Dans l'écran AddExpenseScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';

function AddExpenseScreen({ route, navigation }) {
  const { transactionId, mode } = route.params || {}; // Récupère les paramètres, avec des valeurs par défaut
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (mode === 'edit' && transactionId) {
      // Charger les données de la transaction depuis Firebase et pré-remplir les champs
      console.log(`Chargement de la transaction ${transactionId} pour édition...`);
      // Exemple : firebase.firestore().collection('transactions').doc(transactionId).get().then(...)
    }
  }, [mode, transactionId]);

  const handleSave = () => {
    if (mode === 'edit') {
      // Mettre à jour la transaction dans Firebase
      console.log('Mise à jour de la dépense...');
    } else {
      // Ajouter une nouvelle transaction à Firebase
      console.log('Ajout de la dépense...');
    }
    navigation.goBack(); // Revenir à l'écran précédent après sauvegarde
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'edit' ? 'Modifier la Dépense' : 'Ajouter une Nouvelle Dépense'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Montant"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Sauvegarder" onPress={handleSave} />
      {mode === 'edit' && <Button title="Annuler" onPress={() => navigation.goBack()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default AddExpenseScreen;