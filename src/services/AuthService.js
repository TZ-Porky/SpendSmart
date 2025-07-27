// Importation
import auth from '@react-native-firebase/auth';

// Services
import { accountService } from './AccountService';
import { userService } from './UserService';

// Modèles
import User from '../models/User';
import Account from '../models/Account';

class AuthService {
  //Enregistre un nouvel utilisateur avec e-mail et mot de passe.
  async signUp(email, password) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      // Crée un nouveau document utilisateur dans Firestore
      const newUser = new User(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName || '',
        firebaseUser.photoURL || ''
      );
      await userService.createUser(newUser);

      // Crée un compte par défaut pour le nouvel utilisateur
      const defaultAccount = new Account(
        firebaseUser.uid,
        'Cash',               // Nom du compte par défaut
        'cash',               // Type de compte
        0,                    // Solde initial
        '',
        new Date(),
        new Date(),
        0,
        true                  // Est le compte par défaut
      );
      await accountService.addAccount(firebaseUser.uid, defaultAccount);
      console.log('Default account created for new user:', firebaseUser.uid);

      console.log('User signed up and Firestore document created:', firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  // Connecte un utilisateur existant avec e-mail et mot de passe.
  async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      // Met à jour la date de dernière connexion dans Firestore
      await userService.updateUserInfo(firebaseUser.uid, {
        lastLoginAt: new Date(), // Date actuelle
      });

      console.log('User signed in and last login updated:', firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  // Déconnecte l'utilisateur actuel.
  async signOut() {
    try {
      await auth().signOut();
      console.log('User signed out successfully.');
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Réinitialise le mot de passe de l'utilisateur via son e-mail.
  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }

  // Observer l'état d'authentification de l'utilisateur.
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  // Récupère l'utilisateur actuellement connecté.
  getCurrentUser() {
    return auth().currentUser;
  }
}

export const authService = new AuthService();