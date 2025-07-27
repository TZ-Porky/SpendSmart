// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Button
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth'; // Pour la déconnexion
import { userService } from '../services/UserService'; // Pour récupérer et mettre à jour les infos utilisateur
import { authService } from '../services/AuthService'; // Pour la déconnexion et la mise à jour du profil Firebase
import { notificationService } from '../services/NotificationService';

function ProfileScreen({ userUid, onBack, onSignOut }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(''); // L'email ne peut pas être modifié ici directement pour Firebase Auth
  const [photoURL, setPhotoURL] = useState(''); // Pour l'URL de la photo de profil

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userUid) return;
      setLoading(true);
      try {
        const currentUserData = await userService.getUser(userUid);
        if (currentUserData) {
          setUserProfile(currentUserData);
          setDisplayName(currentUserData.displayName || '');
          setEmail(currentUserData.email || '');
          setPhotoURL(currentUserData.photoURL || '');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Erreur", "Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userUid]);

  const handleUpdateProfile = async () => {
    if (!userProfile) return;

    if (displayName.trim() === '') {
      Alert.alert('Erreur', 'Le nom d\'affichage ne peut pas être vide.');
      return;
    }

    setLoading(true);
    try {
      // Mettre à jour le profil Firebase Auth
      await authService.updateProfile(displayName, photoURL);

      // Mettre à jour le document utilisateur dans Firestore
      await userService.updateUser(userProfile.uid, {
        displayName: displayName,
        photoURL: photoURL,
        // Ne pas mettre à jour l'email ici pour Firestore si c'est géré par Firebase Auth
        // email: email,
      });

      // Mettre à jour l'état local après succès
      setUserProfile(prev => ({
        ...prev,
        displayName: displayName,
        photoURL: photoURL,
      }));
      setIsEditing(false);
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Erreur', 'Échec de la mise à jour du profil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Ici, vous redirigeriez vers un écran de changement de mot de passe
    // Ou utiliseriez une fonction Firebase comme `sendPasswordResetEmail`
    Alert.alert(
      "Changer le mot de passe",
      "Un lien de réinitialisation de mot de passe sera envoyé à votre adresse email. Voulez-vous continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Envoyer",
          onPress: async () => {
            try {
              if (auth().currentUser && auth().currentUser.email) {
                await auth().sendPasswordResetEmail(auth().currentUser.email);
                Alert.alert("Succès", "Un email de réinitialisation de mot de passe a été envoyé à " + auth().currentUser.email + ".");
              } else {
                Alert.alert("Erreur", "Votre email n'est pas disponible pour la réinitialisation.");
              }
            } catch (error) {
              console.error("Error sending password reset email:", error);
              Alert.alert("Erreur", "Échec de l'envoi de l'email: " + error.message);
            }
          }
        }
      ]
    );
  };

  const testImmediateNotification = async () => {
    if (userUid) {
        await notificationService.testSimpleNotification();
        Alert.alert("Notification Immédiate", "Une notification simple devrait apparaître maintenant.");
    } else {
        Alert.alert("Erreur", "Veuillez vous connecter pour tester les notifications.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Impossible de charger les données de l'utilisateur.</Text>
        <Button title="Retour" onPress={onBack} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#007bff" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Mon Profil</Text>

      {/* Photo de profil */}
      <View style={styles.avatarContainer}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="account" size={60} color="#fff" />
          </View>
        )}
        {isEditing && (
          <TouchableOpacity style={styles.changePhotoOverlay} onPress={() => Alert.alert("Changer la photo", "Cette fonctionnalité n'est pas encore implémentée.")}>
            <Icon name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Nom d'affichage</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Votre nom d'affichage"
          />
        ) : (
          <Text style={styles.infoText}>{userProfile.displayName || 'Non défini'}</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.infoText}>{userProfile.email}</Text>
        {!isEditing && ( // Ne pas afficher le bouton si déjà en édition
            <TouchableOpacity onPress={() => Alert.alert("Changer l'email", "Pour des raisons de sécurité, le changement d'email doit être géré via les paramètres de compte Firebase directement. Vous pouvez réinitialiser votre mot de passe pour changer d'email.")} style={styles.actionButton}>
              <Icon name="pencil" size={20} color="#007bff" />
            </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Sauvegarder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsEditing(false); setDisplayName(userProfile.displayName); setPhotoURL(userProfile.photoURL); }}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Modifier le Profil</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.passwordButton} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Changer le Mot de Passe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutButtonText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Section pour les futurs paramètres */}
      <Text style={styles.sectionHeader}>Paramètres Généraux</Text>
      <TouchableOpacity style={styles.settingItem} onPress={testImmediateNotification}>
        <Text style={styles.settingText}>Tester la notification</Text>
        <Icon name="chevron-right" size={20} color="#555" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Devise", "Gérer votre devise préférée")}>
        <Text style={styles.settingText}>Devise par défaut</Text>
        <Icon name="chevron-right" size={20} color="#555" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Notifications", "Gérer les préférences de notifications")}>
        <Text style={styles.settingText}>Notifications</Text>
        <Icon name="chevron-right" size={20} color="#555" />
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007bff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#eee',
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#eee',
    borderWidth: 3,
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: '25%', // Ajuster pour centrer sous l'avatar
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'right',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  passwordButton: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30, // Plus d'espace pour la déconnexion
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;