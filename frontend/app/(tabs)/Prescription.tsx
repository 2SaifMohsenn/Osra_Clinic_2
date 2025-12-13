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
  const [drugInput, setDrugInput] = useState('');
  const [drugs, setDrugs] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const addDrug = () => {
    if (drugInput.trim() !== '') {
      setDrugs([...drugs, drugInput.trim()]);
      setDrugInput('');
    }
  };

  const removeDrug = (index: number) => {
    const updatedDrugs = [...drugs];
    updatedDrugs.splice(index, 1);
    setDrugs(updatedDrugs);
  };

  const handleSave = () => {
    Alert.alert(
      '✅ EMR Saved',
      'The record has been added/updated successfully.'
    );
    setDiagnosis('');
    setNotes('');
    setDrugs([]);
    setDrugInput('');
    setFollowUpDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.header}>Prescription</Text>
      <Text style={styles.sub}>-------------------------------------</Text>

      {/* Patient Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Patient Info</Text>
        <Text style={styles.value}>John Doe</Text>
        <Text style={styles.value}>Age: 32</Text>
        <Text style={styles.value}>Gender: Male</Text>
        <Text style={styles.value}>Contact: +201234567890</Text>
      </View>

      {/* Diagnosis and Notes */}
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
      </View>

      {/* Prescription */}
      <View style={styles.card}>
        <Text style={styles.label}>Prescribed Drugs</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Enter drug and dosage..."
            value={drugInput}
            onChangeText={setDrugInput}
          />
          <TouchableOpacity
            style={[styles.saveBtn, { paddingHorizontal: 12 }]}
            onPress={addDrug}
          >
            <Text style={styles.saveText}>Add</Text>
          </TouchableOpacity>
        </View>
        {drugs.map((drug, index) => (
          <View key={index} style={styles.drugItem}>
            <Text>{drug}</Text>
            <TouchableOpacity onPress={() => removeDrug(index)}>
              <Text style={{ color: 'red', fontWeight: '700' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Follow-up Date */}
      <View style={styles.card}>
        <Text style={styles.label}>Follow-up Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={followUpDate}
          onChangeText={setFollowUpDate}
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
  value: { color: MUTED, marginBottom: 6 },
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
  drugItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
});
