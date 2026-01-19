import AdaptiveBackground from '@/_components/AdaptiveBackground';
import AdaptiveStatusBar from '@/_components/AdaptiveStatusBar';
import { useAuth } from '@/hooks/use-auth';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { loginAction } from '@/lib/auth-api';
import { authenticateWithGoogle } from '@/lib/google-auth';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import FooterLinks from './_components/FooterLinks';
import Header from './_components/Header';
import LoginForm from './_components/LoginForm';
// ===== MODE TEST STATIQUE =====
// Décommentez la ligne suivante pour afficher les comptes de test sur l'écran
// import TestCredentialsHelper from './_components/TestCredentialsHelper';
// ===== FIN MODE TEST STATIQUE =====

export default function SignInScreen() {
  const { login, refetch, isAuthenticated, isLoading } = useAuth();
  const colors = useAdaptiveColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Récupérer le paramètre de redirection
  const params = useLocalSearchParams();
  const redirectTo = params.redirect as string;

  // Auth testing logs
  useEffect(() => {
    console.log('🔐 [SIGNIN] Page de connexion chargée');
  }, []);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('✅ [SIGNIN] Utilisateur déjà connecté, redirection...');
      // Rediriger vers la destination appropriée
      if (redirectTo === 'build-community') {
        router.replace('/(build_community)');
      } else {
        router.replace('/(communities)');
      }
    } else if (!isLoading && !isAuthenticated) {
      console.log('🔐 [SIGNIN] Utilisateur non connecté');
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  // Fonction pour gérer la redirection après connexion réussie
  const handleSuccessfulLogin = async () => {
    console.log('🎉 Connexion réussie! Refetch des données utilisateur...');

    // Forcer le refetch des données utilisateur
    await refetch();

    // Attendre un peu pour que les données soient mises à jour
    await new Promise(resolve => setTimeout(resolve, 300));

    if (redirectTo === 'build-community') {
      console.log('📍 Redirection vers build-community');
      router.replace('/(build_community)');
    } else {
      console.log('📍 Redirection vers communities');
      router.replace('/(communities)');
    }
  };

  const handleInitialSubmit = async () => {
    // Validation côté client
    if (!email || !email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }
    if (!password || password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsRequestingCode(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🚀 [SIGNIN] Tentative de connexion...');
      const result = await loginAction({
        email: email.trim(),
        password,
        remember_me: true
      });

      if (result.success) {
        console.log('✅ [SIGNIN] Connexion réussie');
        setSuccessMessage('✅ Connexion réussie!');
        // Le login est géré automatiquement par le stockage des tokens
        await handleSuccessfulLogin();
      } else {
        console.log('❌ [SIGNIN] Erreur de connexion:', result.error);
        setError(result.error || "Identifiants incorrects");
      }
    } catch (error: any) {
      console.error('💥 [SIGNIN] Exception lors de la connexion:', error);
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    } finally {
      setIsRequestingCode(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      console.log('🔐 [SIGNIN] Starting Google Sign-In');

      const result = await authenticateWithGoogle();

      if (result.success && result.user) {
        console.log('✅ [SIGNIN] Google Sign-In successful');

        // Refetch user data to update auth state
        await refetch();

        // Navigate based on redirect parameter or default to communities
        if (redirectTo) {
          router.replace(redirectTo as any);
        } else {
          router.replace('/(communities)');
        }

      } else {
        console.log('❌ [SIGNIN] Google Sign-In failed:', result.error);
        setError(result.error || 'Google Sign-In failed');
      }

    } catch (error: any) {
      console.error('💥 [SIGNIN] Google Sign-In error:', error);
      setError('An error occurred during Google Sign-In');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== MODE TEST STATIQUE =====
  // Fonction pour remplir automatiquement les identifiants (optionnel)
  const handleSelectTestCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setSuccessMessage('✅ Identifiants de test chargés - Cliquez sur Se connecter');
  };
  // ===== FIN MODE TEST STATIQUE =====


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AdaptiveStatusBar />
      <AdaptiveBackground style={styles.background} resizeMode="cover">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header
            showTwoFactor={false}
            email={email}
            styles={styles}
          />

          <BlurView
            intensity={colors.isDark ? 40 : 20}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            {/* ===== MODE TEST STATIQUE ===== */}
            {/* Décommentez les lignes suivantes pour afficher l'aide aux identifiants de test */}
            {/* {!showTwoFactor && (
              <TestCredentialsHelper onSelectCredentials={handleSelectTestCredentials} />
            )} */}
            {/* ===== FIN MODE TEST STATIQUE ===== */}


            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isRequestingCode={isRequestingCode}
              error={error}
              successMessage={successMessage}
              onSubmit={handleInitialSubmit}
              onGoogleLogin={handleGoogleLogin}
              styles={styles}
            />

            <FooterLinks styles={styles} />
          </BlurView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Chabaqa. Build the future of communities.</Text>
          </View>
        </ScrollView>
      </AdaptiveBackground>
    </KeyboardAvoidingView>
  );
}
