// PatientDashboard.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const logo = require('@/assets/images/logo_osra.png'); // kept for sidebar brand
const WINDOW_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = 280;

/* -------------------------
  Color palette (user provided)
--------------------------*/
const COLOR_PRIMARY = '#2E8BC0'; // medical blue
const COLOR_SECONDARY = '#A1D9A6'; // soft green
const COLOR_BG = '#FFFFFF'; // main white
const COLOR_PAGE_BG = '#F8F9FA'; // very light gray
const COLOR_TEXT = '#333333';
const MUTED = '#6B7280';

/* -------------------------
  Data (unchanged content)
--------------------------*/
type Appointment = {
  id: string;
  title: string;
  doctor: string;
  datetime: string;
  status?: 'upcoming' | 'next' | 'in-progress' | 'completed';
};
type RecordItem = { id: string; title: string; date: string };
type Invoice = { id: string; title: string; due: string; amount: string };

const APPOINTMENTS: Appointment[] = [
  { id: 'a1', title: 'Cleaning', doctor: 'Dr. Smith', datetime: 'Today, 10:00 AM', status: 'upcoming' },
  { id: 'a2', title: 'Consultation', doctor: 'Dr. Jones', datetime: 'Next Wed, 2:30 PM', status: 'upcoming' },
];

const RECORDS: RecordItem[] = [
  { id: 'r1', title: 'Routine Check-up', date: 'Oct 15, 2023' },
  { id: 'r2', title: 'Cavity Filling', date: 'Jul 22, 2023' },
];

const INVOICES: Invoice[] = [
  { id: 'i1', title: 'Invoice #2023-01', due: 'Due: Nov 30, 2023', amount: '$150.00' },
  { id: 'i2', title: 'Invoice #2023-02', due: 'Due: Oct 25, 2023', amount: '$275.00' },
];

/* -------------------------
  Main component
--------------------------*/
export default function PatientDashboard() {
  const router = useRouter();

  // navigation items (unchanged labels/routes/icons)
  const navItems = [
    { label: 'Profile', icon: '👤', route: '/profile' },
    { label: 'Book', icon: '📅', route: '/book-appointment' },
    { label: 'My Appointments', icon: '📝', route: '/my-appointment' },
    { label: 'Billing', icon: '💳', route: '/billing' },
    { label: 'My Prescription', icon: '🩺', route: '/my_prescription' },
    { label: 'Logout', icon: '🚪', route: '/login' },
  ];

  // Sidebar state + animated values
  const [open, setOpen] = useState(false);
  const sidebarX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Entrance animations for content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // entrance animation for the page content
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    // sidebar open/close
    Animated.parallel([
      Animated.timing(sidebarX, { toValue: open ? 0 : -SIDEBAR_WIDTH, duration: 300, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: open ? 0.45 : 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [open]);

  const toggleSidebar = () => setOpen((v) => !v);
  const closeSidebar = () => setOpen(false);

  return (
    <View style={styles.container}>
      {/* Background decorative shapes */}
      <View pointerEvents="none" style={styles.bgShapes}>
        <View style={styles.shapeTopRight} />
        <View style={styles.shapeBottomLeft} />
      </View>

      {/* Header (logo removed from header per request) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerBtn} activeOpacity={0.8}>
          <View style={[styles.hamLine, open && styles.hamTopActive]} />
          <View style={[styles.hamLine, open && styles.hamMidActive]} />
          <View style={[styles.hamLine, open && styles.hamBottomActive]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Patient Dashboard</Text>

        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
          <Text style={styles.profileInitials}>JD</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <Animated.ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
          <Text style={styles.welcomeTitle}>Welcome back, Jane Doe!</Text>
          <Text style={styles.subText}>Here's a summary of your account.</Text>

          {/* Two-column layout for the two cards */}
          <View style={styles.twoColRow}>
            <Card style={styles.colCard}>
              <Text style={styles.cardTitle}>Upcoming Appointments</Text>
              <FlatList
                data={APPOINTMENTS}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => <AppointmentRow item={item} router={router} />}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                scrollEnabled={false}
              />
              <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/my-appointment')}>
                <Text style={styles.linkText}>See All Appointments</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.colCard}>
              <Text style={styles.cardTitle}>Latest Medical Records</Text>
              <FlatList
                data={RECORDS}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => <RecordRow item={item} />}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                scrollEnabled={false}
              />
              <TouchableOpacity style={styles.linkRow}>
                <Text style={styles.linkText}>See All Medical Records</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Up Next panel (kept content identical) */}
          <Animated.View style={[styles.upNextCard, { marginTop: 18 }]}>
            <Text style={styles.upNextTitle}>Up Next</Text>
            <View style={styles.upNextContent}>
              <View style={styles.avatarBox}><Text style={styles.avatarText}>JD</Text></View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={styles.upNextName}>John Doe</Text>
                <Text style={styles.upNextSub}>9:00 AM · Annual Checkup</Text>
                <Text style={styles.noteTitle}>Notes</Text>
                <Text style={styles.noteBody}>
                  Patient reported sensitivity in upper right molar. Last X-rays were 12 months ago.
                </Text>

                <View style={styles.upNextButtons}>
                  <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Start Appointment</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.ghostBtn}><Text style={styles.ghostBtnText}>View Patient Chart</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 80 }} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Backdrop (animated) */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sidebar (overlay sliding) */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <View style={styles.sideInner}>
          <View style={styles.brand}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.brandText}>Osra Clinic</Text>
          </View>

          <View style={{ marginTop: 6 }}>
            {navItems.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => {
                  closeSidebar();
                  setTimeout(() => router.push(item.route), 260); // allow animation to finish
                }}
                style={({ pressed }) => [
                  styles.sideNavItem,
                  pressed && { backgroundColor: 'rgba(46,139,192,0.06)' },
                ]}
              >
                <Text style={styles.sideNavIcon}>{item.icon}</Text>
                <Text style={styles.sideNavText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          {/* Footer removed earlier (no profile duplicate) */}
        </View>
      </Animated.View>
    </View>
  );
}

/* -------------------------
  Mini components (content unchanged)
--------------------------*/
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function AppointmentRow({ item, router }: { item: Appointment; router: any }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.eventIcon, { backgroundColor: 'rgba(46,139,192,0.08)' }]}><Text style={{ fontSize: 18 }}>📅</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowSub}>{item.doctor} · {item.datetime}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => router.push('/my-appointment')}
      >
        <Text style={styles.detailBtnText}>Details</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecordRow({ item }: { item: RecordItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.recordIcon, { backgroundColor: 'rgba(161,217,166,0.12)' }]}><Text style={{ fontSize: 18 }}>📄</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowSub}>{item.date}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

function InvoiceRow({ item }: { item: Invoice }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.invoiceIcon, { backgroundColor: 'rgba(255,237,213,0.9)' }]}><Text style={{ fontSize: 18 }}>🧾</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowSub}>{item.due} · {item.amount}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.payBtn}>
        <Text style={styles.payBtnText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

/* -------------------------
  Styles (full redesigned look)
--------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR_PAGE_BG },
  page: { flex: 1 },
  content: { paddingVertical: 20, paddingHorizontal: 18 },

  /* Header */
  header: {
    height: 72,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  hamburgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamLine: {
    width: 22,
    height: 2.5,
    backgroundColor: COLOR_TEXT,
    marginVertical: 2,
    borderRadius: 2,
    opacity: 0.9,
  },
  hamTopActive: { transform: [{ translateY: 6 }, { rotate: '45deg' }] },
  hamMidActive: { opacity: 0 },
  hamBottomActive: { transform: [{ translateY: -6 }, { rotate: '-45deg' }] },

  headerTitle: { fontSize: 18, fontWeight: '700', color: COLOR_TEXT },

  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { color: COLOR_TEXT, fontWeight: '800' },

  /* subtle abstract background shapes */
  bgShapes: { position: 'absolute', width: '100%', height: '100%' },
  shapeTopRight: {
    position: 'absolute',
    right: -60,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: 'rgba(46,139,192,0.06)',
    transform: [{ rotate: '20deg' }],
  },
  shapeBottomLeft: {
    position: 'absolute',
    left: -90,
    bottom: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(161,217,166,0.04)',
    transform: [{ rotate: '20deg' }],
  },

  /* welcome */
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: COLOR_TEXT, marginTop: 6 },
  subText: { color: MUTED, marginTop: 6, marginBottom: 14 },

  /* two-column row for the two main cards */
  twoColRow: {
    flexDirection: WINDOW_WIDTH > 820 ? 'row' : 'column',
    gap: 16,
    justifyContent: 'space-between',
  },
  colCard: {
    flex: 1,
    marginRight: WINDOW_WIDTH > 820 ? 12 : 0,
    marginLeft: WINDOW_WIDTH > 820 ? 0 : 0,
  },

  card: {
    backgroundColor: COLOR_BG,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    minWidth: 260,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, color: COLOR_TEXT },

  /* row item */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EEF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  recordIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ECFFF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowTitle: { fontSize: 15, fontWeight: '700', color: COLOR_TEXT },
  rowSub: { fontSize: 13, color: MUTED, marginTop: 3 },

  detailBtn: { backgroundColor: 'rgba(46,139,192,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 12 },
  detailBtnText: { color: COLOR_PRIMARY, fontWeight: '700' },

  viewBtn: { backgroundColor: 'rgba(16,185,129,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 12 },
  viewBtnText: { color: COLOR_SECONDARY, fontWeight: '700' },

  payBtn: { backgroundColor: 'rgba(245,158,11,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 12 },
  payBtnText: { color: '#F59E0B', fontWeight: '700' },

  linkRow: { marginTop: 14, alignItems: 'flex-start' },
  linkText: { color: COLOR_PRIMARY, fontWeight: '700' },

  /* upNext */
  upNextCard: {
    backgroundColor: COLOR_BG,
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  upNextTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, color: COLOR_TEXT },
  upNextContent: { flexDirection: 'row' },
  avatarBox: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', color: COLOR_TEXT, fontSize: 20 },

  upNextName: { fontSize: 15, fontWeight: '800' },
  upNextSub: { color: MUTED, marginTop: 6, marginBottom: 8 },

  noteTitle: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  noteBody: { color: MUTED, marginTop: 6, lineHeight: 18 },

  upNextButtons: { flexDirection: 'row', marginTop: 12 },
  primaryBtn: {
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  ghostBtn: { backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginLeft: 10 },
  ghostBtnText: { color: '#374151', fontWeight: '700' },

  /* backdrop */
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 72,
    bottom: 0,
    backgroundColor: '#000',
  },
  backdropTouchable: { flex: 1 },

  /* sidebar */
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 72,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: COLOR_BG,
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 6, height: 0 },
    elevation: 6,
    zIndex: 30,
  },
  sideInner: { flex: 1, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 18 },

  brand: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 46, height: 46, marginRight: 12, borderRadius: 10 },
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

  sidebarFooter: { marginTop: 18, alignItems: 'flex-start' },
  footerText: { color: MUTED, fontSize: 12, marginBottom: 10 },
  footerBtn: { backgroundColor: COLOR_PRIMARY, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  footerBtnText: { color: '#fff', fontWeight: '700' },

  /* helpers */
  mutedSmall: { color: MUTED, fontSize: 12 },
});
