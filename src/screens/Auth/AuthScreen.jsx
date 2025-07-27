import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { authService } from '../../services/AuthService'

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = phone => {
    // Validation pour format camerounais et international
    const phoneRegex = /^(\+237|237)?[67]\d{8}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone) || /^\+\d{10,15}$/.test(cleanPhone);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validations spécifiques à l'inscription
    if (!isLogin) {
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      }

      if (!formData.lastName || formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
      }

      if (!formData.phone) {
        newErrors.phone = 'Le téléphone est requis';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // Connexion
        const result = await authService.login(formData.email, formData.password);
        
        if (result.success) {
          Alert.alert('Succès', 'Connexion réussie !', [
            { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
          ]);
        } else {
          Alert.alert('Erreur de connexion', result.errors?.join('\n') || 'Identifiants incorrects');
        }
      } else {
        // Inscription
        const userData = {
          nom: formData.lastName.trim(),
          prenom: formData.firstName.trim(),
          telephone: formData.phone.replace(/\s/g, ''),
          email: formData.email.toLowerCase().trim(),
          motDePasse: formData.password
        };

        const result = await authService.register(userData);
        
        if (result.success) {
          Alert.alert(
            'Inscription réussie !', 
            result.message || 'Votre compte a été créé avec succès. Veuillez vérifier votre email.',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setIsLogin(true);
                  // Réinitialiser le formulaire
                  setFormData({
                    email: formData.email, // Garder l'email pour faciliter la connexion
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert('Erreur d\'inscription', result.errors?.join('\n') || 'Une erreur est survenue');
        }
      }
    } catch (error) {
      console.error('Erreur authentification:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email d\'abord');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setIsLoading(true);
      const result = await authService.resetPassword(formData.email);
      
      if (result.success) {
        Alert.alert(
          'Email envoyé',
          'Un lien de réinitialisation a été envoyé à votre adresse email'
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer l\'email de réinitialisation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setErrors({});
  };

  const getInputStyle = (fieldName) => [
    styles.input,
    errors[fieldName] && styles.inputError
  ];

  const getPasswordInputStyle = (fieldName) => [
    styles.passwordInput,
    errors[fieldName] && styles.inputError
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>💰 SpendLess</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Bon retour parmi nous !' : 'Créez votre compte'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[styles.toggleText, isLogin && styles.activeToggleText]}
            >
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[styles.toggleText, !isLogin && styles.activeToggleText]}
            >
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* Registration Fields */}
        {!isLogin && (
          <>
            <View style={styles.nameContainer}>
              <View style={styles.nameField}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={getInputStyle('firstName')}
                  value={formData.firstName}
                  onChangeText={value => handleInputChange('firstName', value)}
                  placeholder="John"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              <View style={styles.nameField}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={getInputStyle('lastName')}
                  value={formData.lastName}
                  onChangeText={value => handleInputChange('lastName', value)}
                  placeholder="Doe"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Téléphone *</Text>
              <TextInput
                style={getInputStyle('phone')}
                value={formData.phone}
                onChangeText={value => handleInputChange('phone', value)}
                placeholder="+237 6XX XXX XXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </>
        )}

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={getInputStyle('email')}
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            placeholder="exemple@email.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={getPasswordInputStyle('password')}
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm Password Field */}
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={getPasswordInputStyle('confirmPassword')}
                value={formData.confirmPassword}
                onChangeText={value =>
                  handleInputChange('confirmPassword', value)
                }
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        )}

        {/* Forgot Password */}
        {isLogin && (
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading
              ? 'Chargement...'
              : isLogin
              ? 'Se connecter'
              : "S'inscrire"}
          </Text>
        </TouchableOpacity>

        {/* Alternative Auth Methods */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>🔍 Continuer avec Google</Text>
        </TouchableOpacity>

        {/* Switch Auth Mode */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Vous n'avez pas de compte ? "
              : 'Vous avez déjà un compte ? '}
          </Text>
          <TouchableOpacity onPress={toggleAuthMode}>
            <Text style={styles.switchLink}>
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5F33FD',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#5F33FD',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  inputContainer: {
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
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    padding: 14,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#5F33FD',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#5F33FD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
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
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchLink: {
    color: '#5F33FD',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthScreen;
