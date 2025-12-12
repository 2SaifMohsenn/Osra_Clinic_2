import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

// Dummy dentist data
const INITIAL_DENTISTS = [
  { id: 1, name: 'Dr. Emily Carter', specialty: 'Orthodontist', contact: '+1 234 567 890' },
  { id: 2, name: 'Dr. James Chen', specialty: 'Pediatric Dentist', contact: '+1 555 222 333' },
  { id: 3, name: 'Dr. Ava Lee', specialty: 'Endodontist', contact: '+1 999 888 777' },
];

export default function DentistManagement() {
  const router = useRouter();
  const [dentists, setDentists] = useState(INITIAL_DENTISTS);
  const [showForm, setShowForm] = useState(false);
  const [newDentist, setNewDentist] = useState({
    name: '',
    specialty: '',
    contact: '',
  });

  const handleAddDentist = () => {
    if (!newDentist.name || !newDentist.specialty || !newDentist.contact) return;
    setDentists([...dentists, { id: Date.now(), ...newDentist }]);
    setNewDentist({ name: '', specialty: '', contact: '' });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setDentists(dentists.filter((d) => d.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Dentist Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form ✖' : '➕ Add New Dentist'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add New Dentist</Text>
            <TextInput
              placeholder="Dentist Name"
              style={styles.input}
              value={newDentist.name}
              onChangeText={(text) => setNewDentist({ ...newDentist, name: text })}
            />
            <TextInput
              placeholder="Specialty"
              style={styles.input}
              value={newDentist.specialty}
              onChangeText={(text) => setNewDentist({ ...newDentist, specialty: text })}
            />
            <TextInput
              placeholder="Contact Info"
              style={styles.input}
              value={newDentist.contact}
              onChangeText={(text) => setNewDentist({ ...newDentist, contact: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddDentist}>
              <Text style={styles.saveButtonText}>💾 Save Dentist</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Dentists List</Text>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Specialty</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Contact</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {dentists.map((d) => (
            <View key={d.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{d.name}</Text>
              <Text style={styles.tableCell}>{d.specialty}</Text>
              <Text style={styles.tableCell}>{d.contact}</Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                  onPress={() => alert(`Assign schedule for ${d.name}`)}
                >
                  <Text style={styles.actionText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FCA5A5' }]}
                  onPress={() => handleDelete(d.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
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
  addButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  content: { padding: 20 },

  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },

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
