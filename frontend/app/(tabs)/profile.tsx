import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

export default function Profile() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 18 }}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Personal Info Card */}
      <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <TextInput style={styles.input} placeholder="Full Name" defaultValue="Jane Doe" />
        <TextInput style={styles.input} placeholder="Contact Info" defaultValue="jane@example.com" />
        <TextInput style={styles.input} placeholder="Address" defaultValue="123 Street, City" />
      </View>

      {/* Medical Info Card */}
      {/* <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.cardTitle}>Medical Info</Text>
        <TextInput style={styles.input} placeholder="Medical History" defaultValue="None" />
        <TextInput style={styles.input} placeholder="Allergies" defaultValue="Peanuts" />
        <TextInput style={styles.input} placeholder="Current Medications" defaultValue="Vitamin D" />
      </View> */}

      {/* Password Update */}
      <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.cardTitle}>Password</Text>
        <TextInput style={styles.input} placeholder="New Password" secureTextEntry />
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  card: { backgroundColor: CARD_BG, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: { backgroundColor: PRIMARY, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
