// Patient_Emr.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  contact: string;
}

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  startDate: string;
  endDate: string;
}

interface LabResult {
  id: string;
  test: string;
  result: string;
  date: string;
}

interface Appointment {
  id: string;
  date: string;
  doctor: string;
  status: string;
}

const Patient_Emr = () => {
  // Dummy data
  const [patient] = useState<PatientInfo>({
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    contact: '123-456-7890',
  });

  const [medicalSummary] = useState({
    diagnoses: ['Hypertension'],
    allergies: ['Penicillin'],
    chronicConditions: ['Diabetes'],
  });

  const [prescriptions] = useState<Prescription[]>([
    { id: '1', medicine: 'Metformin', dosage: '500mg', startDate: '2025-12-01', endDate: '2025-12-30' },
  ]);

  const [labResults] = useState<LabResult[]>([
    { id: '1', test: 'Blood Sugar', result: '110 mg/dL', date: '2025-12-10' },
  ]);

  const [appointments] = useState<Appointment[]>([
    { id: '1', date: '2025-12-12', doctor: 'Dr. Smith', status: 'Completed' },
    { id: '2', date: '2025-12-20', doctor: 'Dr. Lee', status: 'Upcoming' },
  ]);

  const [doctorNotes] = useState<string[]>([
    'Take medication after meals.',
    'Monitor blood sugar daily.',
  ]);

  const handleDownloadEMR = () => {
    // Implement download functionality here
    console.log('Download EMR clicked');
  };

  const handleShareEMR = () => {
    // Implement share functionality here
    console.log('Share EMR clicked');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text>Name: {patient.name}</Text>
        <Text>Age: {patient.age}</Text>
        <Text>Gender: {patient.gender}</Text>
        <Text>Contact: {patient.contact}</Text>
      </View>

      {/* Medical Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Summary</Text>
        <Text>Diagnoses: {medicalSummary.diagnoses.join(', ')}</Text>
        <Text>Allergies: {medicalSummary.allergies.join(', ')}</Text>
        <Text>Chronic Conditions: {medicalSummary.chronicConditions.join(', ')}</Text>
      </View>

      {/* Prescriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescriptions</Text>
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Medicine: {item.medicine}</Text>
              <Text>Dosage: {item.dosage}</Text>
              <Text>Start Date: {item.startDate}</Text>
              <Text>End Date: {item.endDate}</Text>
              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Lab Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Results</Text>
        <FlatList
          data={labResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Test: {item.test}</Text>
              <Text>Result: {item.result}</Text>
              <Text>Date: {item.date}</Text>
            </View>
          )}
        />
      </View>

      {/* Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointments</Text>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Date: {item.date}</Text>
              <Text>Doctor: {item.doctor}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      </View>

      {/* Doctor's Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctor's Notes</Text>
        {doctorNotes.map((note, index) => (
          <View key={index} style={styles.noteCard}>
            <Text>{note}</Text>
          </View>
        ))}
      </View>

      {/* Optional Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleDownloadEMR}>
          <Text style={styles.buttonText}>Download EMR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleShareEMR}>
          <Text style={styles.buttonText}>Share EMR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Patient_Emr;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  section: { marginBottom: 20, backgroundColor: '#fff', padding: 15, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 10, backgroundColor: '#eef2f5', borderRadius: 8, marginVertical: 5 },
  noteCard: { padding: 10, backgroundColor: '#dff0d8', borderRadius: 8, marginVertical: 5 },
  detailButton: { marginTop: 5, backgroundColor: '#2196F3', padding: 5, borderRadius: 5, alignItems: 'center' },
  detailButtonText: { color: '#fff', fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, flex: 0.48, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
