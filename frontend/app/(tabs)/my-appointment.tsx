import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';
const MUTED = '#64748B';

type Appointment = {
  id: string;
  date: string;
  dentist: string;
  treatment: string;
  status: 'upcoming' | 'completed' | 'canceled';
};

const APPOINTMENTS: Appointment[] = [
  { id: 'a1', date: 'Nov 5, 2025', dentist: 'Dr. Smith', treatment: 'Cleaning', status: 'upcoming' },
  { id: 'a2', date: 'Nov 1, 2025', dentist: 'Dr. Jones', treatment: 'Cavity Filling', status: 'completed' },
];

export default function MyAppointments() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 18 }}>
      <Text style={styles.pageTitle}>My Appointments</Text>
      <FlatList
        data={APPOINTMENTS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <AppointmentRow item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function AppointmentRow({ item }: { item: Appointment }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <Text style={styles.rowTitle}>{item.treatment}</Text>
      <Text style={styles.rowSub}>Date: {item.date}</Text>
      <Text style={styles.rowSub}>Dentist: {item.dentist}</Text>
      <Text style={styles.rowSub}>Status: {item.status}</Text>
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
        <TouchableOpacity style={styles.rescheduleBtn}>
          <Text style={styles.buttonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  rowSub: { fontSize: 14, color: MUTED, marginTop: 4 },
  rescheduleBtn: { backgroundColor: '#E6F4FF', padding: 10, borderRadius: 10 },
  cancelBtn: { backgroundColor: '#FFEDD5', padding: 10, borderRadius: 10 },
  viewBtn: { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 10 },
  buttonText: { fontWeight: '700', color: '#0f172a' },
});


