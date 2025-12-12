import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, MUTED, PRIMARY } from './PatientDashboard'; // Reuse styling constants

type Invoice = {
  id: string;
  appointmentDate: string;
  total: string;
  status: 'Paid' | 'UnPaid';
};

const INVOICES: Invoice[] = [
  { id: 'INV-001', appointmentDate: 'Oct 15, 2023', total: '$150.00', status: 'Paid' },
  { id: 'INV-002', appointmentDate: 'Oct 22, 2023', total: '$275.00', status: 'Paid' },
  { id: 'INV-003', appointmentDate: 'Nov 01, 2023', total: '$320.00', status: 'Paid' },
];

export default function Billing() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Billing</Text>
      <Text style={styles.subText}>Track your financial records and download invoices.</Text>

      <FlatList
        data={INVOICES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InvoiceRow item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ----- Mini Components ----- */

function InvoiceRow({ item }: { item: Invoice }) {
  const isPaid = item.status === 'Paid';
  return (
    <View style={[styles.card, { flexDirection: 'column', padding: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={styles.rowTitle}>Invoice ID: {item.id}</Text>
        <Text style={{ color: isPaid ? '#10B981' : '#F59E0B', fontWeight: '700' }}>{item.status}</Text>
      </View>
      <Text style={styles.rowSub}>Appointment Date: {item.appointmentDate}</Text>
      <Text style={styles.rowSub}>Total: {item.total}</Text>

      <TouchableOpacity style={styles.downloadBtn}>
        <Text style={styles.downloadBtnText}>Print Invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----- Styles ----- */

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingVertical: 26, paddingHorizontal: 18 },

  pageTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subText: { color: MUTED, marginBottom: 18 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    ...CARD_SHADOW,
    minWidth: 260,
  },

  rowTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  rowSub: { fontSize: 13, color: MUTED, marginTop: 2 },

  downloadBtn: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadBtnText: { color: '#fff', fontWeight: '700' },
});
