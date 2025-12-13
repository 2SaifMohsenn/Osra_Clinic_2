// DoctorDashboard.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = 260;

const logo = require('@/assets/images/logo_osra.png');

/* -------------------------
  Colors
--------------------------*/
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_SECONDARY = '#A1D9A6';
const COLOR_BG = '#FFFFFF';
const COLOR_PAGE_BG = '#F8F9FA';
const COLOR_TEXT = '#333333';
const MUTED = '#6B7280';

/* -------------------------
  Sample data
--------------------------*/
const STATS = [
  { id: 1, title: "Today's Appointments", value: '5', change: '+1 from yesterday', icon: '🗓️' },
  { id: 2, title: 'Total Patients', value: '28', change: '+3 new this week', icon: '👥' },
  { id: 3, title: 'Pending EMRs', value: '3', change: 'Needs update', icon: '🩺' },
];

const SCHEDULE = [
  { id: 1, time: '09:00 AM', name: 'Ahmed Ali', detail: 'Consultation' },
  { id: 2, time: '10:30 AM', name: 'Sara Mohamed', detail: 'Follow-up' },
  { id: 3, time: '12:00 PM', name: 'Omar Khaled', detail: 'Check-up' },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', path: '/DoctorDashboard' },
  { label: 'Appointments', icon: '🗓️', path: '/DentistAppointments' },
  { label: 'My Patients', icon: '🧍‍♂️', path: '/MyPatients' },
  { label: 'EMR', icon: '🗂️', path: '/Doctor_Emr' },
  { label: 'Prescription', icon: '🩺', path: '/Prescription' },
  { label: 'Treatments & Drugs', icon: '💊', path: '/TreatmentsDrugs' },
  { label: 'Reports', icon: '📊', path: '/Reports' },
  { label: 'Logout', icon: '🚪', path: '/login' },
];

/* -------------------------
  Main component
--------------------------*/
export default function DoctorDashboard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sidebarX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentAnim, { toValue: 1, duration: 520, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(sidebarX, {
      toValue: open ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const toggleSidebar = () => setOpen((v) => !v);
  const closeSidebar = () => setOpen(false);

  const handleNavigation = (path: string) => {
    closeSidebar();
    setTimeout(() => router.push(path as any), 260);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <View style={styles.sideInner}>
          {/* X Close Button */}
          <TouchableOpacity onPress={closeSidebar} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.brand}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.brandText}>Osra Clinic</Text>
          </View>

          <View style={{ marginTop: 12 }}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.path}
                onPress={() => handleNavigation(item.path)}
                style={styles.sideNavItem}
              >
                <Text style={styles.sideNavIcon}>{item.icon}</Text>
                <Text style={styles.sideNavText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hamburger + top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerBtn}>
            <View style={[styles.hamLine]} />
            <View style={[styles.hamLine]} />
            <View style={[styles.hamLine]} />
          </TouchableOpacity>

          <View style={styles.profileBox}>
            <Text style={styles.profileName}>Dr. Ahmed Hassan</Text>
            <Text style={styles.profileRole}>Dentist</Text>
          </View>
        </View>

        {/* Welcome */}
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.subText}>Daily summary and appointments</Text>

        {/* Stats Cards */}
        <View style={styles.cardsRow}>
          {STATS.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Text style={styles.cardChange}>{item.change}</Text>
            </View>
          ))}
        </View>

        {/* Schedule Section */}
        <View style={styles.largeCard}>
          <Text style={styles.sectionTitle}>Today's Schedule - Oct 29</Text>
          {SCHEDULE.map((item) => (
            <View key={item.id} style={styles.scheduleRow}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View>
                <Text style={styles.scheduleName}>{item.name}</Text>
                <Text style={styles.scheduleDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* -------------------------
  Styles
--------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR_PAGE_BG },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: COLOR_BG,
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
    zIndex: 30,
  },
  sideInner: { flex: 1, paddingTop: 36, paddingHorizontal: 14 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  closeText: { fontSize: 22, fontWeight: '700', color: COLOR_TEXT },
  brand: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 44, height: 44, marginRight: 12, borderRadius: 10 },
  brandText: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  sideNavIcon: { fontSize: 18, marginRight: 12 },
  sideNavText: { fontWeight: '700', color: COLOR_TEXT, fontSize: 15 },

  mainContent: { flex: 1, padding: 18 },
  content: { paddingBottom: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  hamburgerBtn: { width: 44, height: 44, justifyContent: 'center', gap: 4 },
  hamLine: { width: 22, height: 2.5, backgroundColor: COLOR_TEXT, borderRadius: 2 },

  profileBox: { alignItems: 'flex-end' },
  profileName: { fontWeight: '700', color: COLOR_TEXT },
  profileRole: { color: MUTED, fontSize: 13 },

  pageTitle: { fontSize: 26, fontWeight: '800', color: COLOR_TEXT, marginBottom: 6 },
  subText: { color: MUTED, marginBottom: 16 },

  cardsRow: {
    flexDirection: WINDOW_WIDTH > 900 ? 'row' : 'column',
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLOR_BG,
    borderRadius: 14,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardIcon: { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontWeight: '700', color: COLOR_TEXT },
  cardValue: { fontSize: 22, fontWeight: '800', marginVertical: 4 },
  cardChange: { fontSize: 13, color: COLOR_SECONDARY },

  largeCard: {
    backgroundColor: COLOR_BG,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  timeBadge: { backgroundColor: 'rgba(46,139,192,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timeText: { color: COLOR_PRIMARY, fontWeight: '700', fontSize: 12 },
  scheduleName: { fontWeight: '700', color: COLOR_TEXT },
  scheduleDetail: { color: MUTED, fontSize: 13 },
});
