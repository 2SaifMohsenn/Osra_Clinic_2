import Checkbox from 'expo-checkbox';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',   // ✅ ADDED
    address: '',
    dateOfBirth: '',
    gender: '',
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = () => {
    if (!selectedRole) {
      alert('Please select your role');
      return;
    }

    console.log('Signup Data:', { role: selectedRole, ...formData });
    alert(`${selectedRole} registered successfully!`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Background glow */}
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
        {/* Logo */}
        <Animated.View style={{ transform: [{ translateY: logoFloat }] }}>
          <Image
            source={require('@/assets/images/logo_osra.png')}
            style={styles.logo}
          />
        </Animated.View>

        <Text style={styles.title}>Create an Account</Text>

        {/* Role Selection */}
        <View style={styles.checkboxContainer}>
          {['Patient', 'Doctor', 'Admin'].map((role) => (
            <View key={role} style={styles.checkboxRow}>
              <Checkbox
                value={selectedRole === role}
                onValueChange={() => setSelectedRole(role)}
                color={selectedRole === role ? '#2563eb' : undefined}
              />
              <Text style={styles.checkboxLabel}>{role}</Text>
            </View>
          ))}
        </View>

        {/* Common Fields */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#94a3b8"
          value={formData.firstName}
          onChangeText={(text) =>
            handleInputChange('firstName', text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#94a3b8"
          value={formData.lastName}
          onChangeText={(text) =>
            handleInputChange('lastName', text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) =>
            handleInputChange('phone', text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) =>
            handleInputChange('email', text)
          }
        />

        {/* ✅ PASSWORD FIELD (ADDED) */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) =>
            handleInputChange('password', text)
          }
        />

        {/* Role-Specific Fields */}
        {selectedRole === 'Patient' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#94a3b8"
              value={formData.address}
              onChangeText={(text) =>
                handleInputChange('address', text)
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Date of Birth"
              placeholderTextColor="#94a3b8"
              value={formData.dateOfBirth}
              onChangeText={(text) =>
                handleInputChange('dateOfBirth', text)
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Gender"
              placeholderTextColor="#94a3b8"
              value={formData.gender}
              onChangeText={(text) =>
                handleInputChange('gender', text)
              }
            />
          </>
        )}

        {/* Signup Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login link */}
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Link href="/login" style={styles.loginLink}>
            Login
          </Link>
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fbff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

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
    padding: 30,
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
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 18,
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 18,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  checkboxLabel: {
    fontSize: 15,
    color: '#1f2933',
  },

  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 50,
    paddingHorizontal: 20,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 14,
  },

  button: {
    width: '100%',
    height: 54,
    borderRadius: 50,
    marginTop: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563eb',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  loginText: {
    marginTop: 18,
    color: '#64748b',
    fontSize: 14,
  },

  loginLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
