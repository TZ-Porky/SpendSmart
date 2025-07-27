// src/screens/SignInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../services/AuthService'; // Importez le service d'authentification

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isRegistering) {
        await authService.signUp(email, password);
        Alert.alert('Succès', 'Compte créé ! Vous êtes maintenant connecté.');
      } else {
        await authService.signIn(email, password);
        Alert.alert('Succès', 'Connexion réussie !');
      }
    } catch (error) {
      let errorMessage = 'Une erreur est survenue.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse e-mail est déjà utilisée.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'L\'adresse e-mail n\'est pas valide.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Il doit comporter au moins 6 caractères.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'E-mail ou mot de passe incorrect.';
      }
      Alert.alert('Erreur d\'authentification', errorMessage);
      console.error('Auth error:', error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre e-mail pour réinitialiser le mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email);
      Alert.alert('Succès', 'Un e-mail de réinitialisation de mot de passe a été envoyé à ' + email);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'envoi de l\'e-mail de réinitialisation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Inscription' : 'Connexion'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button
            title={isRegistering ? 'S\'inscrire' : 'Se connecter'}
            onPress={handleAuth}
          />
          <Button
            title={isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
            onPress={() => setIsRegistering(!isRegistering)}
            color="#666"
          />
          {!isRegistering && (
            <Button
              title="Mot de passe oublié ?"
              onPress={handleResetPassword}
              color="#999"
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default SignInScreen;