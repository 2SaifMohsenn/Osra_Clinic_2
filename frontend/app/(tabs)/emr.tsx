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

export default function EMR() {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [drugs, setDrugs] = useState('');

  const handleSave = () => {
    Alert.alert('✅ EMR Saved', 'The record has been added/updated successfully.');
    setDiagnosis('');
    setNotes('');
    setDrugs('');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.header}>Medical Record (EMR)</Text>
      <Text style={styles.sub}>Add or edit electronic medical record.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Patient Info</Text>
        <Text style={styles.value}>John Doe (Auto-filled)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Diagnosis</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter diagnosis..."
          value={diagnosis}
          onChangeText={setDiagnosis}
        />
        <Text style={styles.label}>Treatment Notes</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Enter treatment notes..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <Text style={styles.label}>Prescribed Drugs</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter drugs and dosage..."
          value={drugs}
          onChangeText={setDrugs}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Record</Text>
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
  value: { color: MUTED, marginBottom: 10 },
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
