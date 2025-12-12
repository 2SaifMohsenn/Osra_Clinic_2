import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

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

const TREATMENTS = [
  { id: '1', name: 'Tooth Extraction', category: 'Surgical', cost: '$50', drugs: 'Painkillers - 2x/day' },
  { id: '2', name: 'Teeth Cleaning', category: 'Preventive', cost: '$30', drugs: 'None' },
  { id: '3', name: 'Root Canal', category: 'Therapeutic', cost: '$120', drugs: 'Antibiotics - 3x/day' },
];

export default function TreatmentsDrugs() {
  return (
    <View style={styles.page}>
      <Text style={styles.header}>Treatments & Drugs</Text>
      <Text style={styles.sub}>Reference available treatments and medications</Text>

      <FlatList
        data={TREATMENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>Category: {item.category}</Text>
            <Text style={styles.detail}>Cost: {item.cost}</Text>
            <Text style={styles.detail}>Associated Drugs: {item.drugs}</Text>
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
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    ...CARD_SHADOW,
  },
  name: { fontSize: 16, fontWeight: '700', color: PRIMARY, marginBottom: 6 },
  detail: { color: MUTED, fontSize: 13 },
});
