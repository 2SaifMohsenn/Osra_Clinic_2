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
  /* -------------------- STATE -------------------- */
  const [selectedRole, setSelectedRole] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });

  /* -------------------- ANIMATION -------------------- */
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

  /* -------------------- HANDLERS -------------------- */
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = () => {
    if (!selectedRole) {
      alert('Please select your role');
      return;
    }

    console.log('Signup Data:', {
      role: selectedRole,
      ...formData,
    });

    alert('Account created successfully!');
  };

  /* -------------------- UI -------------------- */
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Background glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: riseAnim }] }]}>
        {/* Logo */}
        <Animated.View style={{ transform: [{ translateY: logoFloat }] }}>
          <Image source={require('@/assets/images/logo_osra.png')} style={styles.logo} />
        </Animated.View>

        <Text style={styles.title}>Create an Account</Text>

        {/* -------- Role Dropdown -------- */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity style={styles.dropdown} onPress={() => setRoleOpen(!roleOpen)}>
            <Text style={styles.dropdownText}>{selectedRole || 'Select Role'}</Text>
          </TouchableOpacity>

          {roleOpen && (
            <View style={styles.dropdownMenu}>
              {['Patient', 'Doctor'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedRole(role);
                    setRoleOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* -------- Common Fields -------- */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#94a3b8"
          value={formData.firstName}
          onChangeText={(t) => handleInputChange('firstName', t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#94a3b8"
          value={formData.lastName}
          onChangeText={(t) => handleInputChange('lastName', t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          placeholderTextColor="#94a3b8"
          value={formData.phone}
          onChangeText={(t) => handleInputChange('phone', t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#94a3b8"
          value={formData.email}
          onChangeText={(t) => handleInputChange('email', t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
          value={formData.password}
          onChangeText={(t) => handleInputChange('password', t)}
        />

        {/* -------- Patient Fields -------- */}
        {selectedRole === 'Patient' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#94a3b8"
              value={formData.address}
              onChangeText={(t) => handleInputChange('address', t)}
            />

            {/* -------- Date of Birth Simple Dropdown -------- */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              {/* Day */}
              <View style={styles.dropdownContainerSmall}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{dobDay || 'Day'}</Text>
                </TouchableOpacity>
                <View style={styles.dropdownMenu}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDobDay(String(d));
                        handleInputChange(
                          'dateOfBirth',
                          `${dobYear || 'YYYY'}-${dobMonth || 'MM'}-${d}`
                        );
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month */}
              <View style={styles.dropdownContainerSmall}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{dobMonth || 'Month'}</Text>
                </TouchableOpacity>
                <View style={styles.dropdownMenu}>
                  {[
                    '01','02','03','04','05','06','07','08','09','10','11','12'
                  ].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDobMonth(m);
                        handleInputChange(
                          'dateOfBirth',
                          `${dobYear || 'YYYY'}-${m}-${dobDay || 'DD'}`
                        );
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Year */}
              <View style={styles.dropdownContainerSmall}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{dobYear || 'Year'}</Text>
                </TouchableOpacity>
                <View style={styles.dropdownMenu}>
                  {Array.from({ length: 100 }, (_, i) => 2025 - i).map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDobYear(String(y));
                        handleInputChange(
                          'dateOfBirth',
                          `${y}-${dobMonth || 'MM'}-${dobDay || 'DD'}`
                        );
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* -------- Gender Dropdown -------- */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity style={styles.dropdown} onPress={() => setGenderOpen(!genderOpen)}>
                <Text style={styles.dropdownText}>{formData.gender || 'Select Gender'}</Text>
              </TouchableOpacity>

              {genderOpen && (
                <View style={styles.dropdownMenu}>
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('gender', g);
                        setGenderOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* -------- Submit -------- */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

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

/* -------------------- STYLES -------------------- */
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

  logo: { width: 90, height: 90, marginBottom: 8 },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 18,
  },

  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 50,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 14,
    justifyContent: 'center',
  },

  dropdownContainer: {
    width: '100%',
    marginBottom: 14,
  },

  dropdownContainerSmall: {
    flex: 1,
  },

  dropdown: {
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 50,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },

  dropdownText: {
    fontSize: 15,
    color: '#0f172a',
  },

  dropdownMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 140,
    overflow: 'scroll',
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  dropdownItemText: {
    fontSize: 15,
    color: '#1f2937',
  },

  button: {
    width: '100%',
    height: 54,
    borderRadius: 50,
    marginTop: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
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
