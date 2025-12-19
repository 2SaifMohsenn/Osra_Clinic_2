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

export default function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [dentistsMap, setDentistsMap] = React.useState<Record<number,string>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const session = (await import('@/src/utils/session')).getUser();
        if (!session || session.role !== 'patient') return;

        const apis = await import('@/src/api/appointments');
        const all = await apis.getAppointments();

        const patients = all.filter((a: any) => a.patient === session.id);

        const ds = await (await import('@/src/api/dentists')).getDentists();
        const map: Record<number,string> = {};
        for (const d of ds) map[d.id] = `${d.first_name} ${d.last_name}`;

        setDentistsMap(map);
        setAppointments(patients);
      } catch (e) {
        console.log('load my appointments', e);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 18 }}>
      <Text style={styles.pageTitle}>My Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <AppointmentRow item={item} dentistsMap={dentistsMap} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function AppointmentRow({ item, dentistsMap }: { item: any, dentistsMap?: Record<number,string> }) {
  const dentistName = dentistsMap ? dentistsMap[item.dentist] : (item.dentist_name || '—');
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <Text style={styles.rowTitle}>{item.notes || 'Appointment'}</Text>
      <Text style={styles.rowSub}>Date: {item.appointment_date}</Text>
      <Text style={styles.rowSub}>Time: {item.appointment_time}</Text>
      <Text style={styles.rowSub}>Dentist: {dentistName}</Text>
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


