// DoctorDashboard.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
} from 'react-native-reanimated';
import { getAppointments } from '@/src/api/appointments';
import { getPatients } from '@/src/api/patients';
import { getUser } from '@/src/utils/session';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

const logo = require('@/assets/images/logo_osra.png');

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
  Main component
--------------------------*/
export default function DoctorDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared values for animations
  const sidebarTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Floating Stats Animations
  const floatStat1 = useSharedValue(0);
  const floatStat2 = useSharedValue(0);
  const floatStat3 = useSharedValue(0);

  // Dentist data
  const [dentist, setDentist] = useState<any | null>(null);
  const [stats, setStats] = useState([
    { id: 1, title: "Today's Appts", value: '0', change: '', icon: '🗓️', color: '#E0F2FE' },
    { id: 2, title: 'Total Patients', value: '0', change: '', icon: '👥', color: '#F0FDF4' },
    { id: 3, title: 'Pending EMRs', value: '0', change: '', icon: '🩺', color: '#F5F3FF' },
  ]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    // Entrance animations - Slower and Simpler
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) }));

    // Floating Loops
    const floatConfig = { duration: 2500, easing: Easing.inOut(Easing.sin) };
    floatStat1.value = withRepeat(withTiming(-10, floatConfig), -1, true);
    floatStat2.value = withDelay(400, withRepeat(withTiming(-12, floatConfig), -1, true));
    floatStat3.value = withDelay(800, withRepeat(withTiming(-8, floatConfig), -1, true));

    (async () => {
      try {
        const s = getUser();
        if (!s || s.role !== 'dentist') return;

        let d: any = null;
        if (s.dentist) d = s.dentist;
        else if (s.id) {
          const { getDentist } = await import('@/src/api/dentists');
          d = await getDentist(s.id);
        }
        setDentist(d);

        const allAppts = await getAppointments();
        const myAppts = allAppts.filter((a: any) => Number(a.dentist) === Number(s.id));

        const patients = await getPatients();
        const map: Record<number, string> = {};
        for (const p of patients) map[p.id] = `${p.first_name} ${p.last_name}`;

        // Compute stats
        const today = new Date().toISOString().slice(0, 10);
        const todayCount = myAppts.filter((a: any) => a.appointment_date === today).length;
        const uniquePatients = new Set(myAppts.map((a: any) => Number(a.patient))).size;
        const pendingEmrs = myAppts.filter((a: any) => String(a.status).toLowerCase() !== 'completed').length;

        setStats([
          { id: 1, title: "Today's Appts", value: String(todayCount), change: '', icon: '🗓️', color: '#E0F2FE' },
          { id: 2, title: 'Total Patients', value: String(uniquePatients), change: '', icon: '👥', color: '#4343432c' },
          { id: 3, title: 'EMRs', value: String(pendingEmrs), change: '', icon: '🩺', color: '#F5F3FF' },
        ]);

        const appts = myAppts.filter((a: any) => a.appointment_date === today)
          .sort((x: any, y: any) => (x.appointment_time || '').localeCompare(y.appointment_time || ''))
          .map((a: any) => ({ ...a, patient_name: map[a.patient] || 'Unknown' }));

        setTodaySchedule(appts);
      } catch (e) {
        console.log('doctor dashboard err', e);
      }
    })();
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
    { label: 'Overview', icon: '🏠', path: '/DoctorDashboard' },
    { label: 'Profile', icon: '👤', path: '/doctor_Profile' },
    { label: 'My Patients', icon: '👥', path: '/MyPatients' },
    { label: 'Schedule', icon: '🗓️', path: '/DentistAppointments' },
    { label: 'EMRs', icon: '🗂️', path: '/Doctor_Emr' },
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

        <Text style={styles.headerTitle}>Doctor Dashboard</Text>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => router.push('/doctor_Profile')}
        >
          <Text style={styles.profileInitials}>
            {dentist ? `${dentist.first_name[0]}${dentist.last_name[0]}` : 'DR'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[contentStyle]}>

          <View style={styles.greetingHeader}>
            <Text style={styles.welcomeText}>Good Day, Dr. {dentist ? dentist.first_name : 'Hassan'}</Text>
            <Text style={styles.subText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsGrid}>
            {stats.map((s, idx) => {
              const floatStyle = idx === 0 ? floatStyle1 : idx === 1 ? floatStyle2 : floatStyle3;
              return (
                <Animated.View key={s.id} style={[styles.statCardGlass, floatStyle]}>
                  <View style={[styles.glassBackground, { backgroundColor: s.color + '40' }]} />
                  <Text style={styles.statIconBadge}>{s.icon}</Text>
                  <Text style={styles.statValueText}>{s.value}</Text>
                  <Text style={styles.statLabelText}>{s.title}</Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Schedule Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Appointments</Text>
              <TouchableOpacity onPress={() => router.push('/DentistAppointments')}>
                <Text style={styles.seeAllAction}>View Full Schedule</Text>
              </TouchableOpacity>
            </View>

            {todaySchedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
              </View>
            ) : (
              todaySchedule.map((item) => (
                <View key={item.id} style={styles.scheduleRow}>
                  <View style={styles.timeLabel}>
                    <Text style={styles.timeValue}>{item.appointment_time}</Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.patientName}>{item.patient_name}</Text>
                    <Text style={styles.patientDetail} numberOfLines={1}>{item.notes || 'Routine Follow-up'}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/Doctor_Emr', params: { patientId: item.patient } })}
                    style={styles.emrButton}
                  >
                    <Text style={styles.emrButtonText}>EMR</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Quick Actions Card */}
          <View style={[styles.mainCard, styles.specialCard]}>
            <Text style={styles.specialTitle}>Quick Diagnostics</Text>
            <Text style={styles.specialSub}>Access patient history and treatments instantly.</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => router.push('/Doctor_Emr')}
                style={styles.whiteActionBtn}
              >
                <Text style={styles.whiteActionBtnText}>Launch EMR Tool</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.brandName}>Osra Clinic</Text>
              <Text style={styles.brandDomain}>Care & Clinical Quality</Text>
            </View>
          </View>

          <View style={styles.navContainer}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.navItem}
                onPress={() => {
                  closeSidebar();
                  setTimeout(() => router.push(item.path as any), 300);
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
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    marginBottom: 25,
  },
  statIconBadge: {
    fontSize: 22,
    marginBottom: 8,
  },
  statValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
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
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    width: 75,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_PRIMARY,
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
  patientDetail: {
    fontSize: 12,
    color: COLOR_SUBTEXT,
    marginTop: 2,
  },
  emrButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emrButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  specialCard: {
    backgroundColor: COLOR_PRIMARY,
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
  actionsRow: {
    flexDirection: 'row',
  },
  whiteActionBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
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
    borderRadius: 12,
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
    height: 52,
    marginBottom: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
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
  sidebarFooter: {
    marginBottom: 40,
  },
  helpWidget: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLOR_TEXT,
    marginBottom: 2,
  },
  helpText: {
    fontSize: 12,
    color: COLOR_SUBTEXT,
    marginBottom: 12,
  },
  supportButton: {
    backgroundColor: COLOR_TEXT,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
