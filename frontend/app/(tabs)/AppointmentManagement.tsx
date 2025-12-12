import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

const INITIAL_APPOINTMENTS = [
  { id: 1, patient: 'Ava Martinez', dentist: 'Dr. Lee', date: '2025-11-05', status: 'Scheduled' },
  { id: 2, patient: 'James Garcia', dentist: 'Dr. Chen', date: '2025-11-06', status: 'Completed' },
  { id: 3, patient: 'Sophia Rodriguez', dentist: 'Dr. Carter', date: '2025-11-07', status: 'Pending' },
];

export default function AppointmentManagement() {
  const router = useRouter();
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [showForm, setShowForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    dentist: '',
    date: '',
    status: 'Scheduled',
  });

  const handleAddAppointment = () => {
    if (!newAppointment.patient || !newAppointment.dentist || !newAppointment.date) return;
    setAppointments([...appointments, { id: Date.now(), ...newAppointment }]);
    setNewAppointment({ patient: '', dentist: '', date: '', status: 'Scheduled' });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const handleEdit = (id: number) => {
    alert(`Editing appointment ID: ${id}`);
  };

  const handleReschedule = (id: number) => {
    alert(`Rescheduling appointment ID: ${id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Appointment Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form ✖' : '➕ Add Appointment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add New Appointment</Text>
            <TextInput
              placeholder="Patient Name"
              style={styles.input}
              value={newAppointment.patient}
              onChangeText={(text) => setNewAppointment({ ...newAppointment, patient: text })}
            />
            <TextInput
              placeholder="Dentist Name"
              style={styles.input}
              value={newAppointment.dentist}
              onChangeText={(text) => setNewAppointment({ ...newAppointment, dentist: text })}
            />
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              style={styles.input}
              value={newAppointment.date}
              onChangeText={(text) => setNewAppointment({ ...newAppointment, date: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddAppointment}>
              <Text style={styles.saveButtonText}>💾 Save Appointment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Appointment Table */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Appointments List</Text>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Patient</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Dentist</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Status</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {appointments.map((a) => (
            <View key={a.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{a.patient}</Text>
              <Text style={styles.tableCell}>{a.dentist}</Text>
              <Text style={styles.tableCell}>{a.date}</Text>
              <Text
                style={[
                  styles.tableCell,
                  { color: a.status === 'Completed' ? '#16a34a' : a.status === 'Pending' ? '#ca8a04' : '#2563eb' },
                ]}
              >
                {a.status}
              </Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                  onPress={() => handleEdit(a.id)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FCD34D' }]}
                  onPress={() => handleReschedule(a.id)}
                >
                  <Text style={styles.actionText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FCA5A5' }]}
                  onPress={() => handleDelete(a.id)}
                >
                  <Text style={styles.actionText}>Cancel</Text>
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
