import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(40)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating logo loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Soft background glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: riseAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: logoFloat }] }}>
          <Image
            source={require('@/assets/images/logo_osra.png')}
            style={styles.logo}
          />
        </Animated.View>

        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <ThemedText style={styles.loginButtonText}>Login</ThemedText>
        </TouchableOpacity>

        {/* Links – kept EXACTLY the same */}
        <ThemedText style={styles.footerText}>
          Don’t have an account?{' '}
          <Link href="/signup">
            <ThemedText type="link" style={styles.link}>
              Sign Up
            </ThemedText>
          </Link>
        </ThemedText>

        <ThemedText style={styles.footerText}>
          go to the dashboard{' '}
          <Link href="/PatientDashboard">
            <ThemedText type="link" style={styles.link}>
              Patient Dashboard
            </ThemedText>
          </Link>
        </ThemedText>

        <ThemedText style={styles.footerText}>
          go to the dashboard{' '}
          <Link href="/DoctorDashboard">
            <ThemedText type="link" style={styles.link}>
              Doctor Dashboard
            </ThemedText>
          </Link>
        </ThemedText>

        <ThemedText style={styles.footerText}>
          go to the dashboard{' '}
          <Link href="/AdminDashboard">
            <ThemedText type="link" style={styles.link}>
              Admin Dashboard
            </ThemedText>
          </Link>
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Decorative glows
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#bfdbfe',
    opacity: 0.35,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: '#93c5fd',
    opacity: 0.25,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffffee',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',

    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,

    elevation: 6,
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },

  title: {
    marginBottom: 24,
    fontSize: 27,
    fontWeight: '700',
    color: '#1e40af',
  },

  input: {
    width: '100%',
    height: 52,
    borderRadius: 50,
    paddingHorizontal: 20,

    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',

    marginBottom: 16,
    fontSize: 15,
    color: '#0f172a',
  },

  loginButton: {
    width: '100%',
    height: 54,
    borderRadius: 50,
    marginTop: 14,

    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563eb',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,

    elevation: 6,
  },

  loginButtonText: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
    color: '#ffffff',
  },

  footerText: {
    marginTop: 18,
    fontSize: 14,
    color: '#64748b',
  },

  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
