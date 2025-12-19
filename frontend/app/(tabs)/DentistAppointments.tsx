import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useRouter } from 'expo-router';

const PRIMARY = '#0EA5E9';
const CARD_BG = '#FFFFFF';
const BG = '#F8FAFC';
const MUTED = '#6B7280';
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export default function DentistAppointments() {
  const [filter, setFilter] = useState('All');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<number,string>>({});
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      try {
        const session = (await import('@/src/utils/session')).getUser();
        if (!session || session.role !== 'dentist') return;

        const apis = await import('@/src/api/appointments');
        const all = await apis.getAppointments();
        const my = all.filter((a: any) => a.dentist === session.id);

        const ps = await (await import('@/src/api/patients')).getPatients();
        const map: Record<number,string> = {};
        for (const p of ps) map[p.id] = `${p.first_name} ${p.last_name}`;

        setPatientsMap(map);
        setAppointments(my);
      } catch (e) {
        console.log('load dentist appointments', e);
      }
    })();
  }, []);

  const filtered = appointments.filter(
    (a) => filter === 'All' || a.status === filter || (filter === 'In Progress' && a.status === 'In Progress'),
  );

  return (
    <View style={styles.page}>
      <Text style={styles.header}>Appointments</Text>
      <Text style={styles.sub}>Manage today’s schedule</Text>

      {/* Filters */}
      <View style={styles.filters}>
        {['All', 'Upcoming', 'In Progress', 'Completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && { backgroundColor: PRIMARY },
            ]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && { color: '#fff' },
              ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{patientsMap[item.patient] || 'Unknown'}</Text>
              <Text style={styles.subText}>
                {item.appointment_time} · {item.status}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push({ pathname: '/Doctor_Emr', params: { patientId: String(item.patient) } })}>
                <Text style={styles.ghostBtnText}>Open EMR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noteBtn}>
                <Text style={styles.noteBtnText}>Add Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG, padding: 18 },
  header: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sub: { color: MUTED, marginBottom: 18 },
  filters: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  filterText: { color: '#374151', fontWeight: '600' },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  subText: { fontSize: 13, color: MUTED },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  ghostBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ghostBtnText: { color: '#374151', fontWeight: '700' },
  noteBtn: {
    backgroundColor: '#FFF7ED',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  noteBtnText: { color: '#F59E0B', fontWeight: '700' },
});
