import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#f8f8f8',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start', // Aligner le contenu en haut
      paddingBottom: 40, // Padding en bas pour le scroll
    },
    headerBackground: {
      paddingTop: Platform.OS === 'android' ? 50 : 80, // Ajuster pour la barre de statut
      paddingBottom: 100, // Espace pour que le formulaire remonte dessus
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: 'hidden',
      marginBottom: -70, // Remonter le header pour que le formulaire le chevauche
    },
    logo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 8,
      fontFamily: 'Roboto-Bold', // Si vous avez une police personnalisée
    },
    subtitle: {
      fontSize: 16,
      color: '#E0E0E0', // Couleur plus claire pour le slogan
      textAlign: 'center',
      marginBottom: 20,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.2)', // Fond semi-transparent pour le sélecteur
      borderRadius: 25, // Plus arrondi
      padding: 5,
      width: '80%', // Largeur fixe pour le sélecteur
      alignSelf: 'center', // Centrer le sélecteur
      marginTop: 20, // Espace sous le slogan
    },
    toggleButton: {
      flex: 1,
      borderRadius: 25,
      overflow: 'hidden', // Important pour le dégradé interne
    },
    toggleButtonInner: {
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 25,
    },
    activeToggle: {
      // Le style actif est géré par LinearGradient dans toggleButtonInner
    },
    toggleText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#E0E0E0', // Texte inactif clair
    },
    activeToggleText: {
      color: '#fff', // Texte actif blanc
    },
    formContainer: {
      backgroundColor: '#fff',
      borderRadius: 20,
      marginHorizontal: 20, // Marges latérales
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1, // Pour s'assurer qu'il est au-dessus du header
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd', // Bordure plus claire
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      backgroundColor: '#f9f9f9', // Fond légèrement gris pour les inputs
      color: '#333',
    },
    inputError: {
      borderColor: '#dc3545', // Rouge pour les erreurs
    },
    errorText: {
      color: '#dc3545',
      fontSize: 12,
      marginTop: 4,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 12,
      backgroundColor: '#f9f9f9',
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#333',
    },
    eyeButton: {
      padding: 14,
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: '#6A1B9A', // Couleur violette pour le lien
      fontSize: 14,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: '#6A1B9A', // Bouton principal violet
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#6A1B9A', // Ombre de la couleur du bouton
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    disabledButton: {
      backgroundColor: '#ccc',
      shadowColor: 'transparent',
      elevation: 0,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#e0e0e0',
    },
    dividerText: {
      marginHorizontal: 16,
      color: '#666',
      fontSize: 14,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 12,
      paddingVertical: 14,
      marginBottom: 12, // Moins d'espace entre les boutons sociaux
      backgroundColor: '#fff',
    },
    socialIcon: {
      marginRight: 10,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20, // Espace après les boutons sociaux
    },
    switchText: {
      color: '#666',
      fontSize: 14,
    },
    switchLink: {
      color: '#6A1B9A', // Lien violet
      fontSize: 14,
      fontWeight: '600',
    },
  });