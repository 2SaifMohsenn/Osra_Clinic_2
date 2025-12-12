import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function DentistProfile() {
  const [name, setName] = useState('Dr. Ahmed Ali');
  const [specialty, setSpecialty] = useState('Orthodontist');
  const [contact, setContact] = useState('ahmed.ali@clinic.com');
  const [password, setPassword] = useState('');
  const [hours, setHours] = useState('9 AM - 5 PM');

  const handleUpdate = () => {
    Alert.alert('✅ Profile Updated', 'Your information has been successfully updated.');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.sub}>Manage your details and working hours</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Specialty</Text>
        <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} />

        <Text style={styles.label}>Contact Info</Text>
        <TextInput style={styles.input} value={contact} onChangeText={setContact} />

        <Text style={styles.label}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Working Hours</Text>
        <TextInput style={styles.input} value={hours} onChangeText={setHours} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  header: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sub: { color: MUTED, marginBottom: 18 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  label: { fontWeight: '700', marginBottom: 4, color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
