import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

export default function Settings() {
  const [clinicName, setClinicName] = useState('Osra Dental Clinic');
  const [clinicAddress, setClinicAddress] = useState('123 Smile Street, Riyadh, KSA');
  const [clinicPhone, setClinicPhone] = useState('+966 555 123 456');
  const [openingHours, setOpeningHours] = useState('Sun - Thu: 9:00 AM - 8:00 PM');
  const [adminEmail, setAdminEmail] = useState('admin@osra.com');
  const [adminPassword, setAdminPassword] = useState('********');

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>⚙️ Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Clinic Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏥 Clinic Information</Text>
          <TextInput
            style={styles.input}
            value={clinicName}
            onChangeText={setClinicName}
            placeholder="Clinic Name"
          />
          <TextInput
            style={styles.input}
            value={clinicAddress}
            onChangeText={setClinicAddress}
            placeholder="Clinic Address"
          />
          <TextInput
            style={styles.input}
            value={clinicPhone}
            onChangeText={setClinicPhone}
            placeholder="Clinic Phone"
          />
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Clinic Info</Text>
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🕒 Working Hours</Text>
          <TextInput
            style={styles.input}
            value={openingHours}
            onChangeText={setOpeningHours}
            placeholder="Working Hours"
          />
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Working Hours</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Account Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Admin Account Settings</Text>
          <TextInput
            style={styles.input}
            value={adminEmail}
            onChangeText={setAdminEmail}
            placeholder="Admin Email"
          />
          <TextInput
            style={styles.input}
            value={adminPassword}
            onChangeText={setAdminPassword}
            secureTextEntry
            placeholder="Password"
          />
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Update Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
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

  content: { padding: 20, paddingBottom: 60 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' },

  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#0f172a',
  },

  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
