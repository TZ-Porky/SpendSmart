// src/screens/Main/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth'; // Pour la déconnexion et les infos utilisateur
import { useNavigation } from '@react-navigation/native'; // Pour la navigation

function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    // Nettoyer l'abonnement lors du démontage du composant
    return subscriber;
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Se déconnecter",
          onPress: async () => {
            try {
              await auth().signOut();
              // La navigation sera gérée par votre AuthNavigator qui détecte l'état de déconnexion
              console.log("Utilisateur déconnecté !");
            } catch (error) {
              console.error("Erreur lors de la déconnexion:", error);
              Alert.alert("Erreur de déconnexion", "Impossible de se déconnecter. Veuillez réessayer.");
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // Fallback si l'utilisateur n'est pas trouvé (bien que onAuthStateChanged devrait gérer cela)
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Aucun utilisateur connecté.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // URL de l'image de profil (utilisez user.photoURL si disponible, sinon un avatar par défaut)
  const profileImage = user.photoURL
    ? { uri: user.photoURL }
    : require('../../../assets/AppIcon.png'); // Assurez-vous d'avoir une image d'avatar par défaut

  return (
    <View style={styles.container}>
      {/* En-tête de la page de profil */}
      <LinearGradient
        colors={['#6A1B9A', '#4A148C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerBackground}
      >
        <Text style={styles.pageTitle}>Mon Profil</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {/* Section Informations personnelles */}
        <View style={styles.profileInfoCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={profileImage}
              style={styles.avatar}
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
            {/* Vous pouvez ajouter un bouton pour changer l'avatar ici */}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.displayName || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {/* Vous pouvez ajouter d'autres infos ici */}
          <TouchableOpacity style={styles.editProfileButton} onPress={() => navigateTo('EditProfile')}>
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
            <Icon name="chevron-right" size={20} color="#6A1B9A" />
          </TouchableOpacity>
        </View>

        {/* Section Paramètres de compte */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Paramètres de compte</Text>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('NotificationsSettings')}>
            <Icon name="bell-outline" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Notifications</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('CurrencySettings')}>
            <Icon name="currency-usd" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Devise</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('ThemeSettings')}>
            <Icon name="palette-outline" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Thème</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
        </View>

        {/* Section Sécurité */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('ChangePassword')}>
            <Icon name="lock-outline" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Changer le mot de passe</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('TwoFactorAuth')}>
            <Icon name="shield-lock-outline" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Authentification à deux facteurs</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
        </View>

        {/* Section Aide et Support */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Aide & Support</Text>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('FAQ')}>
            <Icon name="help-circle-outline" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>FAQ</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigateTo('ContactSupport')}>
            <Icon name="lifebuoy" size={24} color="#6A1B9A" style={styles.optionIcon} />
            <Text style={styles.optionText}>Contacter le support</Text>
            <Icon name="chevron-right" size={20} color="#999" style={styles.optionArrow} />
          </TouchableOpacity>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FFF" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} /> {/* Espace en bas */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Fond clair
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A1B9A',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerBackground: {
    paddingTop: 50, // Pour gérer la barre de statut
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le titre
    alignItems: 'center',
    borderBottomLeftRadius: 30, // Courbure en bas à gauche
    borderBottomRightRadius: 30, // Courbure en bas à droite
    overflow: 'hidden', // Important pour que le border radius fonctionne avec LinearGradient
    zIndex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollViewContent: {
    flex: 1,
    marginTop: -20, // Remonter légèrement sous le header pour un effet de superposition
    paddingTop: 20, // Padding pour le contenu à l'intérieur du ScrollView
  },
  profileInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6A1B9A', // Bordure de l'avatar
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A1B9A',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginBottom: 15,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1BEE7', // Un violet plus clair
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  editProfileButtonText: {
    color: '#6A1B9A',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionIcon: {
    marginRight: 15,
    width: 24, // Pour s'assurer que les icônes sont alignées
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  optionArrow: {
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#EF5350', // Couleur rouge pour la déconnexion
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#EF5350',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;