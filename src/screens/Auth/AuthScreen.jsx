import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { authService } from '../../services/AuthService';
import { styles } from './AuthScreenStyle';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!isLogin) {
      if (!formData.username || formData.username.trim().length < 4) {
        newErrors.username = 'Le nom d\'utilisateur doit au moins avoir 4 caractères';
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
        const result = await authService.signIn(formData.email, formData.password);

        if (result.success) {
          Alert.alert('Succès', 'Connexion réussie !');
        } else {
          Alert.alert('Erreur de connexion', result.errors?.join('\n') || 'Identifiants incorrects');
        }
      } else {
        const userData = {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          username: formData.username.trim(),
        };

        const result = await authService.signUp(userData);

        if (result.success) {
          Alert.alert(
            'Inscription réussie !',
            result.message || 'Votre compte a été créé avec succès. Veuillez vérifier votre email.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsLogin(true);
                  setFormData({
                    email: formData.email,
                    password: '',
                    confirmPassword: '',
                    username: ''
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

  const getInputStyle = (fieldName) => [
    styles.input,
    errors[fieldName] && styles.inputError
  ];

  const getPasswordInputStyle = (fieldName) => [
    styles.passwordInput,
    errors[fieldName] && styles.inputError
  ];

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer} // Nouveau conteneur global
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec dégradé */}
        <LinearGradient
          colors={['#6A1B9A', '#4A148C']} // Dégradé violet
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerBackground}
        >
          {/* Logo SpendSmart */}
          <Text style={styles.logo}>SpendSmart</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Bon retour parmi nous !' : 'Créez votre compte'}
          </Text>

          {/* Toggle Buttons (Connexion / Inscription) */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(true)}
            >
              <LinearGradient
                colors={isLogin ? ['#FF4081', '#E00040'] : ['transparent', 'transparent']} // Dégradé rose/violet pour actif
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.toggleButtonInner}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  Connexion
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(false)}
            >
              <LinearGradient
                colors={!isLogin ? ['#FF4081', '#E00040'] : ['transparent', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.toggleButtonInner}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  Inscription
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Formulaire principal */}
        <View style={styles.formContainer}>
          {/* Registration Fields */}
          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom d'utilisateur *</Text>
                <TextInput
                  style={getInputStyle('firstName')}
                  value={formData.username}
                  onChangeText={value => handleInputChange('username', value)}
                  placeholder="Bille"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  keyboardType='default'
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
            </>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse E-mail *</Text>
            <TextInput
              style={getInputStyle('email')}
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              placeholder="Entrer votre adresse e-mail"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={getPasswordInputStyle('password')}
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                placeholder="Entrer votre mot de passe"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Field */}
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={getPasswordInputStyle('confirmPassword')}
                  value={formData.confirmPassword}
                  onChangeText={value =>
                    handleInputChange('confirmPassword', value)
                  }
                  placeholder="Confirmer votre mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
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
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Alternative Auth Methods */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Fonctionnalité', 'Connexion Google à implémenter')}>
            <Icon name="google" size={20} color="#333" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Se connecter avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Fonctionnalité', 'Connexion SMS à implémenter')}>
            <Icon name="email-outline" size={20} color="#333" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Se connecter avec un SMS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;