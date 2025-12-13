import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';


const INITIAL_INVOICES = [
  { id: 1, invoiceId: 'INV-001', patient: 'John Doe', date: '2025-10-10', amount: '$200', status: 'Paid' },
  { id: 2, invoiceId: 'INV-002', patient: 'Jane Smith', date: '2025-10-15', amount: '$350', status: 'Paid' },
  { id: 3, invoiceId: 'INV-003', patient: 'Adam Brown', date: '2025-10-20', amount: '$180', status: 'Paid' },
  { id: 4, invoiceId: 'INV-004', patient: 'Mary Lee', date: '2025-10-25', amount: '$220', status: 'Paid' },
];

export default function InvoicesAndPayments() {
  const router = useRouter();
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredInvoices = invoices.filter((i) => {
    const matchesStatus = filterStatus ? i.status === filterStatus : true;
    const matchesDate = filterDate ? i.date.includes(filterDate) : true;
    return matchesStatus && matchesDate;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Invoices & Payments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.sectionTitle}>Filter Records</Text>
          <View style={styles.filterRow}>
            <TextInput
              placeholder="Filter by Date (YYYY-MM-DD)"
              style={styles.input}
              value={filterDate}
              onChangeText={setFilterDate}
            />
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'Paid' && styles.activeFilter,
              ]}
              onPress={() =>
                setFilterStatus(filterStatus === 'Paid' ? '' : 'Paid')
              }
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === 'Paid' && styles.activeFilterText,
                ]}
              >
                Paid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'Pending' && styles.activeFilter,
              ]}
              onPress={() =>
                setFilterStatus(filterStatus === 'Pending' ? '' : 'Pending')
              }
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === 'Pending' && styles.activeFilterText,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resetButton]}
              onPress={() => {
                setFilterStatus('');
                setFilterDate('');
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Invoice Table */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Invoice & Payment Records</Text>

          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>Invoice ID</Text>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>Patient</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Amount</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Status</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {filteredInvoices.map((i) => (
            <View key={i.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{i.invoiceId}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{i.patient}</Text>
              <Text style={styles.tableCell}>{i.date}</Text>
              <Text style={styles.tableCell}>{i.amount}</Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    color:
                      i.status === 'Paid' ? '#10B981' : '#F59E0B',
                    fontWeight: '700',
                  },
                ]}
              >
                {i.status}
              </Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                >
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                >
                  <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ----- Styles ----- */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    ...CARD_SHADOW,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  content: { padding: 20 },

  filterCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    flex: 1,
    minWidth: 180,
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeFilter: { backgroundColor: PRIMARY },
  filterButtonText: { color: '#374151', fontWeight: '600' },
  activeFilterText: { color: '#fff' },
  resetButton: {
    backgroundColor: '#FCA5A5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resetButtonText: { color: '#fff', fontWeight: '700' },

  tableCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    ...CARD_SHADOW,
  },
  tableHeader: {
    backgroundColor: '#E0F2FE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tableCell: { flex: 1, color: '#0f172a' },
  headerCell: { fontWeight: '700', color: PRIMARY },
  actionsCell: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#111827' },
});
