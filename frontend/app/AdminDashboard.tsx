// AdminDashboard.tsx
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = 260;

const logo = require('@/assets/images/logo_osra.png');

const COLOR_PRIMARY = '#2E8BC0';
const COLOR_SECONDARY = '#A1D9A6';
const COLOR_BG = '#FFFFFF';
const COLOR_PAGE_BG = '#F8F9FA';
const COLOR_TEXT = '#333333';
const MUTED = '#6B7280';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', path: '/AdminDashboard' },
  { label: 'Patients', icon: '🧑‍⚕️', path: '/PatientManagement' },
  { label: 'Dentists', icon: '🦷', path: '/DentistManagement' },
  { label: 'Appointments', icon: '📅', path: '/AppointmentManagement' },
  { label: 'Treatments', icon: '💉', path: '/TreatmentManagement' },
  { label: 'Drugs Inventory', icon: '💊', path: '/DrugInventory' },
  { label: 'Invoices & Payments', icon: '💰', path: '/Invoices&Payments' },
  { label: 'Reports', icon: '📊', path: '/Reports' },
  { label: 'Settings', icon: '⚙️', path: '/Settings' },
  { label: 'Logout', icon: '🚪', path: '/login' },
];

const STATS = [
  { id: 1, title: 'Total Patients', value: '1,204', change: '+2.5% this month', icon: '👥' },
  { id: 2, title: 'Total Dentists', value: '8', change: 'No change', icon: '🦷' },
  { id: 3, title: 'Appointments (This Month)', value: '256', change: '+8.2% this month', icon: '📅' },
];

const SCHEDULE = [
  { id: 1, time: '09:00 AM', name: 'Ava Martinez', detail: 'Check-up w/ Dr. Lee' },
  { id: 2, time: '10:30 AM', name: 'James Garcia', detail: 'Cleaning w/ Dr. Chen' },
  { id: 3, time: '01:00 PM', name: 'Sophia Rodriguez', detail: 'Root Canal w/ Dr. Carter' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

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
      {/* Sidebar Backdrop */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: open ? 0.45 : 0 }]}
      >
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <View style={styles.sideInner}>
          {/* X Close Button */}
          <TouchableOpacity onPress={closeSidebar} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.brandText}>Osra Clinic</Text>
          </View>

          <View style={styles.navSection}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavigation(item.path)}
                >
                  <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerBtn}>
            <View style={[styles.hamLine]} />
            <View style={[styles.hamLine]} />
            <View style={[styles.hamLine]} />
          </TouchableOpacity>

          <View style={styles.profileBox}>
            <Text style={styles.profileName}>Dr. Emily Carter</Text>
            <Text style={styles.profileRole}>Admin</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.subText}>Overall system summary and schedule.</Text>

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

          <View style={styles.rowSection}>
            <View style={[styles.largeCard, { flex: 2 }]}>
              <Text style={styles.sectionTitle}>Income Overview</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={{ color: MUTED }}>📈 (Graph Placeholder)</Text>
              </View>
            </View>

            <View style={[styles.largeCard, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Today's Schedule - Oct 31</Text>
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
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </View>
  );
}

/* ----- Styles ----- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR_PAGE_BG },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 20 },
  backdropTouchable: { flex: 1 },

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
  logoSection: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 40, height: 40, marginBottom: 6 },
  brandText: { fontSize: 18, fontWeight: '800', color: COLOR_TEXT },
  navSection: { gap: 10, paddingHorizontal: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  navItemActive: { backgroundColor: 'rgba(46,139,192,0.08)' },
  navIcon: { fontSize: 18, marginRight: 8, color: MUTED },
  navLabel: { fontSize: 15, color: COLOR_TEXT },
  navIconActive: { color: COLOR_PRIMARY },
  navLabelActive: { color: COLOR_PRIMARY, fontWeight: '700' },

  mainContent: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLOR_BG, borderBottomColor: '#E5E7EB', borderBottomWidth: 1 },
  hamburgerBtn: { width: 44, height: 44, justifyContent: 'center', gap: 4 },
  hamLine: { width: 22, height: 2.5, backgroundColor: COLOR_TEXT, borderRadius: 2 },
  profileBox: { alignItems: 'flex-end' },
  profileName: { fontWeight: '700', color: COLOR_TEXT },
  profileRole: { color: MUTED, fontSize: 13 },

  content: { padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: COLOR_TEXT },
  subText: { color: MUTED, marginBottom: 18 },

  cardsRow: { flexDirection: WINDOW_WIDTH > 900 ? 'row' : 'column', gap: 16, marginBottom: 20 },
  card: { backgroundColor: COLOR_BG, borderRadius: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  cardIcon: { fontSize: 24, marginBottom: 6 },
  cardTitle: { color: COLOR_TEXT, fontWeight: '700' },
  cardValue: { fontSize: 24, fontWeight: '800', marginVertical: 4 },
  cardChange: { fontSize: 13, color: COLOR_SECONDARY },

  rowSection: { flexDirection: WINDOW_WIDTH > 900 ? 'row' : 'column', gap: 16 },
  largeCard: { backgroundColor: COLOR_BG, borderRadius: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  chartPlaceholder: { backgroundColor: '#F9FAFB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 180 },

  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  timeBadge: { backgroundColor: 'rgba(46,139,192,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timeText: { color: COLOR_PRIMARY, fontWeight: '700', fontSize: 12 },
  scheduleName: { fontWeight: '700', color: COLOR_TEXT },
  scheduleDetail: { color: MUTED, fontSize: 13 },
});
