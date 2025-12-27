// AdminDashboard.tsx
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { getPatients } from '@/src/api/patients';
import { getDentists } from '@/src/api/dentists';
import { getAppointments } from '@/src/api/appointments';
import { getUser } from '@/src/utils/session';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const logo = require('@/assets/images/logo_osra.png');

// Colors (Soft Medical Style)
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#F1F5F9';

export default function AdminDashboard() {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<any | null>(null);

  // Stats
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Patients', value: '0', icon: '👥', bgColor: '#E0F2FE', path: '/PatientManagement' },
    { id: 2, title: 'Total Dentists', value: '0', icon: '🦷', bgColor: '#F0FDF4', path: '/DentistManagement' },
    { id: 3, title: 'Appointments (Total)', value: '0', icon: '📅', bgColor: '#F5F3FF', path: '/AppointmentManagement' },
  ]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  // Animation Shared Values
  const sidebarTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Floating Stats Animations
  const floatStat1 = useSharedValue(0);
  const floatStat2 = useSharedValue(0);
  const floatStat3 = useSharedValue(0);

  useEffect(() => {
    // Entrance Animations
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) }));

    // Floating Loops
    const floatConfig = { duration: 2500, easing: Easing.inOut(Easing.sin) };
    floatStat1.value = withRepeat(withTiming(-10, floatConfig), -1, true);
    floatStat2.value = withDelay(400, withRepeat(withTiming(-12, floatConfig), -1, true));
    floatStat3.value = withDelay(800, withRepeat(withTiming(-8, floatConfig), -1, true));

    const fetchData = async () => {
      try {
        const u = getUser();
        setAdmin(u);

        const [patients, dentists, allAppts] = await Promise.all([
          getPatients(),
          getDentists(),
          getAppointments(),
        ]);

        setStats([
          { id: 1, title: 'Total Patients', value: String(patients.length), icon: '👥', bgColor: '#E0F2FE', path: '/PatientManagement' },
          { id: 2, title: 'Total Dentists', value: String(dentists.length), icon: '🦷', bgColor: '#F0FDF4', path: '/DentistManagement' },
          { id: 3, title: 'Appointments (Total)', value: String(allAppts.length), icon: '📅', bgColor: '#F5F3FF', path: '/AppointmentManagement' },
        ]);

        // Map dentist names
        const dentistMap: Record<number, string> = {};
        dentists.forEach((d: any) => dentistMap[d.id] = `Dr. ${d.last_name}`);

        // Map patient names
        const patientMap: Record<number, string> = {};
        patients.forEach((p: any) => patientMap[p.id] = `${p.first_name} ${p.last_name}`);

        // Get upcoming or today's appointments (better than just 'today' if none for today)
        const todayStr = new Date().toISOString().slice(0, 10);

        // Use a more robust filter and sort
        const upcomingAppts = [...allAppts]
          .sort((a: any, b: any) => {
            const dateCmp = (a.appointment_date || '').localeCompare(b.appointment_date || '');
            if (dateCmp !== 0) return dateCmp;
            return (a.appointment_time || '').localeCompare(b.appointment_time || '');
          })
          .filter((a: any) => (a.appointment_date || '') >= todayStr)
          .slice(0, 5);

        const mappedSchedule = upcomingAppts.map((a: any) => {
          // Robust ID extraction in case serialized as objects
          const pID = typeof a.patient === 'object' ? a.patient.id : a.patient;
          const dID = typeof a.dentist === 'object' ? a.dentist.id : a.dentist;

          return {
            id: a.id,
            time: a.appointment_time || 'TBD',
            date: a.appointment_date,
            name: patientMap[pID] || (typeof a.patient === 'object' ? `${a.patient.first_name} ${a.patient.last_name}` : 'Unknown Patient'),
            detail: dentistMap[dID] || (typeof a.dentist === 'object' ? `Dr. ${a.dentist.last_name}` : 'Unassigned'),
          };
        });

        setTodaySchedule(mappedSchedule);

      } catch (err) {
        console.log('Admin Dashboard Fetch Error:', err);
      }
    };

    fetchData();
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

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const floatStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: floatStat1.value }] }));
  const floatStyle2 = useAnimatedStyle(() => ({ transform: [{ translateY: floatStat2.value }] }));
  const floatStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: floatStat3.value }] }));

  const NAV_ITEMS = [
    { label: 'Admin Panel', icon: '🏠', path: '/AdminDashboard' },
    { label: 'Manage Patients', icon: '🧑‍⚕️', path: '/PatientManagement' },
    { label: 'Manage Dentists', icon: '🦷', path: '/DentistManagement' },
    { label: 'Global Schedule', icon: '📅', path: '/AppointmentManagement' },
    { label: 'Reports & Stats', icon: '📊', path: '/Reports' },
    { label: 'Profile', icon: '👤', path: '/AdminProfile' },
    { label: 'System Settings', icon: '⚙️', path: '/Settings' },
    { label: 'Logout', icon: '🚪', path: '/login' },
  ];

  return (
    <View style={styles.container}>
      {/* Background Orbs */}
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

        <Text style={styles.headerTitle}>Clinic Administration</Text>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => router.push('/AdminProfile')}
        >
          <Text style={styles.profileText}>
            {admin?.firstName ? admin.firstName.substring(0, 2).toUpperCase() : 'AD'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[contentStyle]}>
          <View style={styles.greetingHeader}>
            <Text style={styles.welcomeText}>Welcome, Administrator</Text>
            <Text style={styles.subText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((item, idx) => {
              const floatStyle = idx === 0 ? floatStyle1 : idx === 1 ? floatStyle2 : floatStyle3;
              return (
                <AnimatedTouchableOpacity
                  key={item.id}
                  style={[styles.statCardGlass, floatStyle]}
                  onPress={() => item.path && router.push(item.path as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.glassBackground, { backgroundColor: item.bgColor + '40' }]} />
                  <Text style={styles.statIcon}>{item.icon}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.title}</Text>
                </AnimatedTouchableOpacity>
              );
            })}
          </View>

          {/* Today's Schedule Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Appointments Preview</Text>
              <TouchableOpacity onPress={() => router.push('/AppointmentManagement')}>
                <Text style={styles.seeAllAction}>Full Schedule</Text>
              </TouchableOpacity>
            </View>

            {todaySchedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming appointments scheduled.</Text>
              </View>
            ) : (
              todaySchedule.map((item) => (
                <View key={item.id} style={styles.scheduleRow}>
                  <View style={styles.timeLabel}>
                    <Text style={styles.timeValue}>{item.time}</Text>
                    <Text style={styles.dateSmall}>{item.date}</Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.patientName}>{item.name}</Text>
                    <Text style={styles.doctorDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* System Overview Card */}
          <View style={[styles.mainCard, { backgroundColor: COLOR_PRIMARY }]}>
            <Text style={styles.specialTitle}>System Integrity Profile</Text>
            <Text style={styles.specialSub}>Database is synchronized. All clinical endpoints operational.</Text>
            <TouchableOpacity
              style={styles.whiteActionBtn}
              onPress={() => router.push('/Reports')}
            >
              <Text style={styles.whiteActionBtnText}>View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        <View style={styles.sidebarInner}>
          <View style={styles.sidebarHeader}>
            <Image source={logo} style={styles.brandLogo} />
            <View>
              <Text style={styles.brandName}>Osra Admin</Text>
              <Text style={styles.brandDomain}>Management Command</Text>
            </View>
          </View>

          <View style={styles.navContainer}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => {
                    closeSidebar();
                    setTimeout(() => router.push(item.path as any), 300);
                  }}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
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
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  orb1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#BAE6FD',
    opacity: 0.4,
  },
  orb2: {
    position: 'absolute',
    bottom: WINDOW_HEIGHT / 4,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#DDD6FE',
    opacity: 0.3,
  },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginRight: WINDOW_WIDTH > 600 ? 50 : 0,
    marginBottom: WINDOW_WIDTH > 600 ? 0 : 20,
  },
  statCardGlass: {
    flex: 1,
    height: 140,
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
    marginVertical: 2.5,
    borderRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  greetingHeader: {
    marginTop: 20,
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLOR_TEXT,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  mainCard: {
    backgroundColor: COLOR_CARD,
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  seeAllAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  emptyState: {
    paddingVertical: 10,
  },
  emptyText: {
    color: COLOR_SUBTEXT,
    fontSize: 14,
    fontStyle: 'italic',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  timeLabel: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    width: 85,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  dateSmall: {
    fontSize: 9,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
    marginTop: 2,
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  doctorDetail: {
    fontSize: 12,
    color: COLOR_SUBTEXT,
    marginTop: 2,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  specialSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  whiteActionBtn: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteActionBtnText: {
    color: COLOR_PRIMARY,
    fontWeight: '800',
    fontSize: 14,
  },

  /* Sidebar */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
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
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  brandLogo: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  brandDomain: {
    fontSize: 11,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
    marginTop: -2,
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: '#F1F5F9',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  navText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  navTextActive: {
    color: COLOR_PRIMARY,
  },
});
