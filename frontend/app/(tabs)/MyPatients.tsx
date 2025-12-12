import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

const PATIENTS = [
  {
    id: 'p1',
    name: 'John Doe',
    history: '3 Visits · Last: Sep 10, 2023',
  },
  {
    id: 'p2',
    name: 'Sarah Lee',
    history: '2 Visits · Last: Oct 2, 2023',
  },
  {
    id: 'p3',
    name: 'David Kim',
    history: '5 Visits · Last: Aug 28, 2023',
  },
];

export default function MyPatients() {
  const [query, setQuery] = useState('');

  const filtered = PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

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
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subText}>{item.history}</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Open EMR</Text>
            </TouchableOpacity>
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
