import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { login } from '@/src/api/auth';
import { getPatient } from '@/src/api/patients';
import { getDentist } from '@/src/api/dentists';
import { setUser } from '@/src/utils/session';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  Text,
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Floating Orbs Shared Values (Pastel medical tones)
  const orb1Pos = useSharedValue({ x: -20, y: -20 });
  const orb2Pos = useSharedValue({ x: width - 100, y: height / 2 });
  const orb3Pos = useSharedValue({ x: 50, y: height - 100 });

  // Entrance Shared Values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const contentTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);

  // Logo Float Animation
  const logoFloat = useSharedValue(0);

  useEffect(() => {
    // Entrance Animations
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 600 });
    formTranslateY.value = withSpring(0, { damping: 12 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) }));

    // Floating Orb Animations
    const animateOrb = (sharedValue: any, range: number) => {
      sharedValue.value = withRepeat(
        withSequence(
          withTiming({ x: sharedValue.value.x + range, y: sharedValue.value.y - range }, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming({ x: sharedValue.value.x - range, y: sharedValue.value.y + range }, { duration: 5000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    };

    animateOrb(orb1Pos, 40);
    animateOrb(orb2Pos, 60);
    animateOrb(orb3Pos, 30);

    // Logo Floating Loop
    logoFloat.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // Infinite
      false
    );
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
    transform: [
      { scale: cardScale.value },
      { translateY: formTranslateY.value }
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoFloat.value }],
  }));

  const handleLogin = async () => {
    try {
      const res = await login({ email, password });

      if (res.role === 'patient') {
        const patient = await getPatient(res.id);
        setUser({ role: 'patient', id: res.id, patient });
        router.push('/PatientDashboard');
        return;
      }

      if (res.role === 'dentist') {
        const dentist = await getDentist(res.id);
        setUser({ role: 'dentist', id: res.id, dentist });
        router.push('/DoctorDashboard');
        return;
      }

      if (res.role === 'admin') {
        setUser({ role: 'admin', id: res.id, firstName: res.first_name });
        router.push('/AdminDashboard');
        return;
      }

      alert('Login successful');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Soft Background Layer */}
      <View style={styles.backgroundFallback} />

      {/* Decorative Pastel Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

      <ThemedView style={styles.innerContainer}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Animated.View style={[styles.logoBadge, logoAnimatedStyle]}>
            <View style={styles.logoInner}>
              <Image
                source={require('@/assets/images/logo_osra.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}></Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="...."
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/signup">
              <Text style={styles.link}>Create Account</Text>
            </Link>
          </View>

          {/* Development Quick-Links */}
          <View style={styles.devLinks}>
            <Link href="/PatientDashboard" style={styles.devLink}><Text style={styles.devLinkText}>Patient View</Text></Link>
            <Link href="/DoctorDashboard" style={styles.devLink}><Text style={styles.devLinkText}>Doctor View</Text></Link>
            <Link href="/AdminDashboard" style={styles.devLink}><Text style={styles.devLinkText}>Admin View</Text></Link>
          </View>
        </Animated.View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light medical background
  },
  backgroundFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  orb: {
    position: 'absolute',
    borderRadius: 150,
  },
  orb1: {
    width: 250,
    height: 250,
    backgroundColor: '#BAE6FD', // Pastel sky blue
    top: -40,
    left: -40,
    opacity: 0.6,
  },
  orb2: {
    width: 220,
    height: 220,
    backgroundColor: '#DDD6FE', // Pastel purple
    bottom: height / 4,
    right: -60,
    opacity: 0.5,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: '#BBF7D0', // Pastel mint
    bottom: -30,
    left: 60,
    opacity: 0.4,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 28,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',

    // Premium soft elevation
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 12, // Modern clinic "accent" corner
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // Premium Clinical Shadow
    shadowColor: '#2E8BC0',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoInner: {
    width: 74,
    height: 74,
    borderRadius: 37, // Perfect circle to clip square edges
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,139,192,0.1)',
    overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A', // Deep slate
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B', // Muted slate
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2E8BC0', // Medical Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2E8BC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
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
  devLinks: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  devLink: {
    padding: 6,
  },
  devLinkText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
