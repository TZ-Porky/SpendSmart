import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../models/User';

export class AuthService {
  
  // Créer un nouvel utilisateur
  async register(userData) {
    try {
      // Créer une instance du modèle User
      const user = new User(userData);
      
      // Valider les données
      const validation = user.validate();
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Vérifier si l'email existe déjà
      const emailExists = await this.checkEmailExists(user.email);
      if (emailExists) {
        return {
          success: false,
          errors: ['Cette adresse email est déjà utilisée']
        };
      }

      // Vérifier si le téléphone existe déjà
      const phoneExists = await this.checkPhoneExists(user.telephone);
      if (phoneExists) {
        return {
          success: false,
          errors: ['Ce numéro de téléphone est déjà utilisé']
        };
      }

      // Créer le compte Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(
        user.email,
        user.motDePasse
      );

      const firebaseUser = userCredential.user;

      // Mettre à jour le profil Firebase
      await firebaseUser.updateProfile({
        displayName: user.nomComplet
      });

      // Sauvegarder les informations supplémentaires dans Firestore
      const userDoc = {
        id: firebaseUser.uid,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        email: user.email,
        image: user.image,
        dateCreation: firestore.FieldValue.serverTimestamp(),
        dateModification: firestore.FieldValue.serverTimestamp()
      };

      await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .set(userDoc);

      // Envoyer email de vérification
      await firebaseUser.sendEmailVerification();

      // Retourner l'utilisateur créé (sans le mot de passe)
      const createdUser = User.fromJSON({
        ...userDoc,
        id: firebaseUser.uid,
        dateCreation: new Date(),
        dateModification: new Date()
      });

      return {
        success: true,
        user: createdUser,
        message: 'Compte créé avec succès. Veuillez vérifier votre email.'
      };

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gérer les erreurs spécifiques de Firebase
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          errorMessage = 'L\'adresse email n\'est pas valide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Problème de connexion réseau';
          break;
      }

      return {
        success: false,
        errors: [errorMessage]
      };
    }
  }

  // Vérifier si une adresse email est déjà utiliséé
  async checkEmailExists(email) {
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Erreur vérification email:', error);
      return false;
    }
  }

  // Vérifier si un numéro de téléphone est déjà utilisée
  async checkPhoneExists(telephone) {
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('telephone', '==', telephone.replace(/\s/g, ''))
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Erreur vérification téléphone:', error);
      return false;
    }
  }

  // Récupère les informations du compte d'un utilisateur.
  async getUserData(userId) {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (userDoc.exists) {
        return User.fromJSON({
          ...userDoc.data(),
          id: userDoc.id
        });
      }
      
      return null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour les informations d'un utilisateur
  async updateUser(userId, updateData) {
    try {
      const user = new User(updateData);
      const validation = user.validate();
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          ...user.sanitize(),
          dateModification: firestore.FieldValue.serverTimestamp()
        });

      return {
        success: true,
        message: 'Profil mis à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      return {
        success: false,
        errors: ['Erreur lors de la mise à jour du profil']
      };
    }
  }
}

// Instance singleton du service
export const authService = new AuthService();
