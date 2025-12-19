import React, { useState, useEffect } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAppointments } from '../../src/api/appointments';
import { getPatients } from '../../src/api/patients';
import { getUser } from '../../src/utils/session';

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

export default function MyPatients() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const session = getUser();
        if (!session || session.role !== 'dentist') {
          setPatients([]);
          setLoading(false);
          return;
        }
        const dentistId = session.id;
        const appts = await getAppointments();
        const myAppts = appts.filter((a: any) => a.dentist === dentistId);
        const patientIds = Array.from(new Set(myAppts.map((a: any) => a.patient)));
        const allPatients = await getPatients();
        const myPatients = allPatients.filter((p: any) => patientIds.includes(p.id));

        // Map extra info such as last visit and visit count
        const mapped = myPatients.map((p: any) => {
          const related = myAppts.filter((a: any) => a.patient === p.id);
          const last = related.sort((x: any, y: any) => new Date(y.appointment_date).getTime() - new Date(x.appointment_date).getTime())[0];
          return {
            id: p.id,
            name: `${p.first_name} ${p.last_name}`,
            history: `${related.length} Visits · Last: ${last ? last.appointment_date : 'N/A'}`,
          };
        });

        setPatients(mapped);
      } catch (err) {
        console.warn('Failed to load patients', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.page}>
      <Text style={styles.header}>My Patients</Text>
      <Text style={styles.sub}>View patient list and history</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name or ID..."
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subText}>{item.history}</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push({ pathname: '/Doctor_Emr', params: { patientId: String(item.id) } })}>
              <Text style={styles.primaryBtnText}>Open EMR</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG, padding: 18 },
  header: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sub: { color: MUTED, marginBottom: 18 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 14,
  },
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
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});