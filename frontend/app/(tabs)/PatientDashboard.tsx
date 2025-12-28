// PatientDashboard.tsx

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const logo = require('@/assets/images/logo_osra.png'); // Updated to modern logo
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const SIDEBAR_WIDTH = 280;

/* -------------------------
  Color palette (Soft Medical)
--------------------------*/
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#E2E8F0';

/* -------------------------
  Data (kept consistent)
--------------------------*/
type Appointment = {
  id: string;
  title: string;
  doctor: string;
  datetime: string;
  status?: 'upcoming' | 'next' | 'in-progress' | 'completed';
};
type RecordItem = { id: string; title: string; date: string };

const APPOINTMENTS: Appointment[] = [
  { id: 'a1', title: 'Cleaning', doctor: 'Dr. Smith', datetime: 'Today, 10:00 AM', status: 'upcoming' },
  { id: 'a2', title: 'Consultation', doctor: 'Dr. Jones', datetime: 'Next Wed, 2:30 PM', status: 'upcoming' },
];

const RECORDS: RecordItem[] = [
  { id: 'r1', title: 'Routine Check-up', date: 'Oct 15, 2023' },
  { id: 'r2', title: 'Cavity Filling', date: 'Jul 22, 2023' },
];

export default function PatientDashboard() {
  const router = useRouter();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Content state
  const [patient, setPatient] = useState<any | null>(null);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Floating Stats Animations
  const floatStat1 = useSharedValue(0);
  const floatStat3 = useSharedValue(0);

  // Real Data State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [dentistCount, setDentistCount] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    // Load patient data and stats
    (async () => {
      try {
        setLoadingData(true);
        const { getUser } = await import('@/src/utils/session');
        const session = getUser();

        if (session && session.role === 'patient') {
          let pId = session.patient?.id || session.id;

          // Get Patient Details if not fully in session
          let pData = session.patient;
          if (!pData || !pData.id) {
            const { getPatient } = await import('@/src/api/patients');
            pData = await getPatient(pId);
          }
          setPatient(pData);

          // Fetch Appointments
          const { getAppointments } = await import('@/src/api/appointments');
          const allApps = await getAppointments({ patient: pId });
          // Sort by date (asc) for upcoming
          const sortedApps = allApps.sort((a: any, b: any) =>
            new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() -
            new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
          );
          setAppointments(sortedApps);

          // Fetch Medical Records
          const { getMedicalRecords } = await import('@/src/api/medicalRecords');
          const allRecords = await getMedicalRecords({ patient: pId });
          // Sort by date (desc) for recent
          const sortedRecords = allRecords.sort((a: any, b: any) =>
            new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
          );
          setMedicalRecords(sortedRecords);

          // Fetch Doctors Count
          const { getDentists } = await import('@/src/api/dentists');
          const allDentists = await getDentists();
          setDentistCount(allDentists.length);
        }
      } catch (e) {
        console.error("Dashboard Fetch Error:", e);
      } finally {
        setLoadingData(false);
      }
    })();

    // Entrance animation - Slower and Simpler
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) }));

    // Floating Stats
    const floatConfig = { duration: 2500, easing: Easing.inOut(Easing.sin) };
    floatStat1.value = withRepeat(withTiming(-10, floatConfig), -1, true);
    floatStat3.value = withDelay(800, withRepeat(withTiming(-8, floatConfig), -1, true));
  }, []);

  useEffect(() => {
    sidebarTranslateX.value = withTiming(isSidebarOpen ? 0 : -SIDEBAR_WIDTH, {
      duration: 500,
      easing: Easing.out(Easing.exp)
    });
    backdropOpacity.value = withTiming(isSidebarOpen ? 1 : 0, { duration: 500 });
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const floatStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: floatStat1.value }] }));
  const floatStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: floatStat3.value }] }));

  const initials = patient ? `${(patient.first_name || '').charAt(0)}${(patient.last_name || '').charAt(0)}`.toUpperCase() : 'JD';
  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';

  const navItems = [
    { label: 'Overview', icon: '🏠', route: '/PatientDashboard' },
    { label: 'Profile', icon: '👤', route: '/profile' },
    { label: 'My Records (EMR)', icon: '🗂️', route: '/Patient_Emr' },
    { label: 'Book Appointment', icon: '📅', route: '/book-appointment' },
    { label: 'Appointments', icon: '📅', route: '/my-appointment' },
    { label: 'Logout', icon: '🚪', route: '/login' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Background Shapes */}
      <View style={styles.bgDecoration}>
        <View style={styles.orb1} />
        <View style={styles.orb2} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <View style={styles.menuIconLine} />
          <View style={[styles.menuIconLine, { width: 16 }]} />
          <View style={styles.menuIconLine} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Osra Health</Text>

        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarButton}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[contentAnimatedStyle]}>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.welcomeText}>Hello, {fullName}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>

          {/* Quick Stats / Shortcuts */}
          <View style={styles.statsRow}>
            <Animated.View style={[styles.statCardGlass, floatStyle1]}>
              <View style={[styles.glassBackground, { backgroundColor: '#E0F2FE' + '60' }]} />
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Total Appts</Text>
            </Animated.View>
            <Animated.View style={[styles.statCardGlass, floatStyle3]}>
              <View style={[styles.glassBackground, { backgroundColor: '#F5F3FF' + '60' }]} />
              <Text style={styles.statIcon}>👨‍⚕️</Text>
              <Text style={styles.statValue}>{dentistCount}</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </Animated.View>
          </View>

          {/* Main Cards */}
          <View style={styles.cardsGrid}>

            {/* Appointments Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Upcoming Appointments</Text>
                <TouchableOpacity onPress={() => router.push('/my-appointment')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {loadingData ? (
                <ActivityIndicator size="small" color={COLOR_PRIMARY} />
              ) : appointments.length > 0 ? (
                appointments.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.appointmentRow}>
                    <View style={styles.iconBox}>
                      <Text style={{ fontSize: 20 }}>🗓️</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.rowTitle}>{item.notes || 'Dental Session'}</Text>
                      <Text style={styles.rowSub}>
                        {item.dentist_name || `Dr. Osra`} • {item.appointment_date} {item.appointment_time}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.status?.toLowerCase() === 'completed' ? '#DCFCE7' : '#FEF9C3' }]}>
                      <Text style={[styles.statusBadgeText, { color: item.status?.toLowerCase() === 'completed' ? '#166534' : '#854D0E' }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No upcoming appointments</Text>
              )}
            </View>

            {/* Records Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent Records</Text>
                <TouchableOpacity onPress={() => router.push('/Patient_Emr')}>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {loadingData ? (
                <ActivityIndicator size="small" color={COLOR_PRIMARY} />
              ) : medicalRecords.length > 0 ? (
                medicalRecords.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.recordRow}>
                    <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={{ fontSize: 20 }}>📄</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.diagnosis || 'Medical Record'}</Text>
                      <Text style={styles.rowSub}>{new Date(item.record_date).toLocaleDateString()}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No records found</Text>
              )}
            </View>

            {/* Up Next / Action Card */}
            {appointments.length > 0 && (
              <View style={[styles.card, styles.specialCard]}>
                <Text style={[styles.cardTitle, { color: '#fff' }]}>Next Step</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionMain}>{appointments[0].notes || 'Dental Session'}</Text>
                  <Text style={styles.actionSub}>{appointments[0].dentist_name || 'Dr. Osra'} • {appointments[0].appointment_date} {appointments[0].appointment_time}</Text>
                  <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/my-appointment')}>
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Sidebar & Backdrop */}
      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
        <View style={styles.sidebarInner}>
          <View style={styles.sidebarBrand}>
            <Image source={logo} style={styles.brandLogo} />
            <Text style={styles.brandName}>Osra Clinic</Text>
          </View>

          <View style={styles.navSection}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.navItem}
                onPress={() => {
                  closeSidebar();
                  router.push(item.route as any);
                }}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={styles.navText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  orb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#BAE6FD',
    opacity: 0.3,
  },
  orb2: {
    position: 'absolute',
    bottom: WINDOW_HEIGHT / 3,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#DDD6FE',
    opacity: 0.2,
  },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: COLOR_BG,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuIconLine: {
    width: 20,
    height: 2,
    backgroundColor: COLOR_TEXT,
    marginVertical: 2,
    borderRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  greetingSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLOR_TEXT,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  statCardGlass: {
    flex: 1,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  cardsGrid: {
    gap: 20,
  },
  card: {
    backgroundColor: COLOR_CARD,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  rowSub: {
    fontSize: 12,
    color: COLOR_SUBTEXT,
    fontWeight: '500',
    marginTop: 2,
  },
  specialCard: {
    backgroundColor: COLOR_PRIMARY,
  },
  actionContent: {
    marginTop: 10,
  },
  actionMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 18,
  },
  actionButton: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLOR_PRIMARY,
    fontWeight: '800',
    fontSize: 15,
  },

  /* Sidebar */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 99,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  sidebarInner: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  brandLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  navSection: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  navIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  navText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  sidebarFooter: {
    marginBottom: 40,
  },
  helpCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  helpSub: {
    fontSize: 13,
    color: COLOR_SUBTEXT,
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: COLOR_TEXT,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    textAlign: 'center',
    marginVertical: 10,
  },
});
