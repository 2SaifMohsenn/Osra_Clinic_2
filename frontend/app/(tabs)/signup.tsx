import { signupPatient, signupDentist } from "@/src/api/auth";
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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

  const router = useRouter();

  /* -------------------- ANIMATION -------------------- */
  const orb1Pos = useSharedValue({ x: -20, y: -20 });
  const orb2Pos = useSharedValue({ x: width - 100, y: height / 2 });
  const orb3Pos = useSharedValue({ x: 50, y: height - 100 });

  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 600 });

    const animateOrb = (sharedValue: any, range: number) => {
      sharedValue.value = withRepeat(
        withSequence(
          withTiming({ x: sharedValue.value.x + range, y: sharedValue.value.y - range }, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
          withTiming({ x: sharedValue.value.x - range, y: sharedValue.value.y + range }, { duration: 6000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    };

    animateOrb(orb1Pos, 40);
    animateOrb(orb2Pos, 60);
    animateOrb(orb3Pos, 30);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1Pos.value.x }, { translateY: orb1Pos.value.y }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2Pos.value.x }, { translateY: orb2Pos.value.y }],
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb3Pos.value.x }, { translateY: orb3Pos.value.y }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  /* -------------------- HANDLERS -------------------- */
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async () => {
    if (!selectedRole) {
      alert('Please select your role');
      return;
    }

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
      };

      if (selectedRole === 'Patient') {
        await signupPatient(payload);
      } else {
        await signupDentist(payload);
      }

      alert('Account created successfully!');
      router.push('/login');
    } catch (error) {
      console.log(error);
      alert('Signup failed');
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Image source={require('@/assets/images/logo_osra.png')} style={styles.logo} />

          <Text style={styles.title}>Join Osra Clinic</Text>
          <Text style={styles.subtitle}> </Text>

          {/* -------- Role Dropdown -------- */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>select your role</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity style={styles.dropdown} onPress={() => setRoleOpen(!roleOpen)}>
                <Text style={styles.dropdownText}>{selectedRole || 'Choose Role'}</Text>
              </TouchableOpacity>

              {roleOpen && (
                <View style={styles.dropdownMenu}>
                  {['Patient', 'Dentist'].map((role) => (
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
          </View>

          {/* -------- Names Row -------- */}
          <View style={styles.row}>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#94A3B8"
                  value={formData.firstName}
                  onChangeText={(t) => handleInputChange('firstName', t)}
                />
              </View>
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#94A3B8"
                  value={formData.lastName}
                  onChangeText={(t) => handleInputChange('lastName', t)}
                />
              </View>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="+20 123 456 7890"
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
                value={formData.phone}
                onChangeText={(t) => handleInputChange('phone', t)}
              />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                value={formData.email}
                onChangeText={(t) => handleInputChange('email', t)}
              />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor="#94A3B8"
                value={formData.password}
                onChangeText={(t) => handleInputChange('password', t)}
              />
            </View>
          </View>

          {/* -------- Patient Fields -------- */}
          {selectedRole === 'Patient' && (
            <>
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Mailing Address</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="123 Street Name, City"
                    placeholderTextColor="#94A3B8"
                    value={formData.address}
                    onChangeText={(t) => handleInputChange('address', t)}
                  />
                </View>
              </View>

              {/* -------- Date of Birth -------- */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  <View style={styles.inputSmallContainer}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="DD"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={2}
                      value={dobDay}
                      onChangeText={(v) => {
                        setDobDay(v);
                        handleInputChange('dateOfBirth', `${dobYear}-${dobMonth}-${v}`);
                      }}
                    />
                  </View>
                  <View style={styles.inputSmallContainer}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="MM"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={2}
                      value={dobMonth}
                      onChangeText={(v) => {
                        setDobMonth(v);
                        handleInputChange('dateOfBirth', `${dobYear}-${v}-${dobDay}`);
                      }}
                    />
                  </View>
                  <View style={styles.inputSmallContainer}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="YYYY"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={4}
                      value={dobYear}
                      onChangeText={(v) => {
                        setDobYear(v);
                        handleInputChange('dateOfBirth', `${v}-${dobMonth}-${dobDay}`);
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity style={styles.dropdown} onPress={() => setGenderOpen(!genderOpen)}>
                    <Text style={styles.dropdownText}>{formData.gender || 'Choose Gender'}</Text>
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
              </View>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Complete Registration</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login">
              <Text style={styles.link}>Login here</Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  orb: {
    position: 'absolute',
    borderRadius: 150,
  },
  orb1: {
    width: 250,
    height: 250,
    backgroundColor: '#BAE6FD',
    top: -50,
    left: -50,
    opacity: 0.5,
  },
  orb2: {
    width: 220,
    height: 220,
    backgroundColor: '#DDD6FE',
    bottom: height / 3,
    right: -80,
    opacity: 0.4,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#BBF7D0',
    bottom: 20,
    left: 40,
    opacity: 0.3,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  inputSmallContainer: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputSmall: {
    color: '#0F172A',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdown: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2E8BC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#2E8BC0',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  footerText: {
    color: '#64748B',
    fontSize: 15,
  },
  link: {
    color: '#2E8BC0',
    fontWeight: '700',
    fontSize: 15,
  },
});
