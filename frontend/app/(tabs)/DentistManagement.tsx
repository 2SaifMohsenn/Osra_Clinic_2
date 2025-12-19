import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';
import API_HOST from '../../services/config';

// Using backend API to load/create/delete dentists
const API_BASE = `${API_HOST}/api`;

async function getDentists(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/dentists/`);
  if (!res.ok) throw new Error('Failed to fetch dentists');
  return res.json();
}

async function createDentist(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/dentists/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create dentist');
  return res.json();
}

async function deleteDentist(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/dentists/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete dentist');
  return;
}

export default function DentistManagement() {
  const router = useRouter();

  const [dentists, setDentists] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDentist, setNewDentist] = useState({
    first_name: '',
    last_name: '',
    specialty: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadDentists();
  }, []);

  const loadDentists = async () => {
    try {
      const data = await getDentists();
      setDentists(data);
    } catch (error) {
      console.log('Error loading dentists', error);
    }
  };

  const handleAddDentist = async () => {
    if (!newDentist.first_name || !newDentist.last_name || !newDentist.specialty || !newDentist.phone) return;
    try {
      await createDentist(newDentist);
      setNewDentist({ first_name: '', last_name: '', specialty: '', phone: '', email: '', password: '' });
      setShowForm(false);
      loadDentists();
    } catch (error) {
      console.log('Error adding dentist', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDentist(id);
      loadDentists();
    } catch (error) {
      console.log('Error deleting dentist', error);
    }
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
              placeholder="First Name"
              style={styles.input}
              value={newDentist.first_name}
              onChangeText={(text) => setNewDentist({ ...newDentist, first_name: text })}
            />

            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={newDentist.last_name}
              onChangeText={(text) => setNewDentist({ ...newDentist, last_name: text })}
            />

            <TextInput
              placeholder="Specialty"
              style={styles.input}
              value={newDentist.specialty}
              onChangeText={(text) => setNewDentist({ ...newDentist, specialty: text })}
            />

            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={newDentist.phone}
              onChangeText={(text) => setNewDentist({ ...newDentist, phone: text })}
            />

            <TextInput
              placeholder="Email (optional)"
              style={styles.input}
              value={newDentist.email}
              onChangeText={(text) => setNewDentist({ ...newDentist, email: text })}
            />

            <TextInput
              placeholder="Password (optional)"
              style={styles.input}
              secureTextEntry
              value={newDentist.password}
              onChangeText={(text) => setNewDentist({ ...newDentist, password: text })}
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
            <Text style={[styles.tableCell, styles.headerCell]}>Phone</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Email</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {dentists.map((d) => (
            <View key={d.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{d.first_name} {d.last_name}</Text>
              <Text style={styles.tableCell}>{d.specialty}</Text>
              <Text style={styles.tableCell}>{d.phone}</Text>
              <Text style={styles.tableCell}>{d.email}</Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                  onPress={() => alert(`Assign schedule for ${d.first_name} ${d.last_name}`)}
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
