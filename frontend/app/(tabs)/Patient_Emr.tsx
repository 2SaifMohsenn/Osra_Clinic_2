// Patient_Emr.tsx
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { getMedicalRecords } from '../../src/api/medicalRecords';
import { getUser } from '../../src/utils/session';
import { getPatient } from '../../src/api/patients';

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
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [medicalSummary, setMedicalSummary] = useState<any>({ diagnoses: [], allergies: [], chronicConditions: [] });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const session = getUser();
      if (!session || session.role !== 'patient') return;
      try {
        const p = await getPatient(session.id);
        setPatient({ name: `${p.first_name} ${p.last_name}`, age: 0, gender: p.gender, contact: p.phone });
        const recs = await getMedicalRecords({ patient: session.id });
        if (Array.isArray(recs) && recs.length > 0) {
          const r = recs[0];
          // Simple parsing of fields
          setMedicalSummary({ diagnoses: r.diagnosis ? [r.diagnosis] : [], allergies: [], chronicConditions: [] });
          setDoctorNotes([r.treatment_notes || '']);
          // parse prescribed_drugs into list if it is comma-separated
          if (r.prescribed_drugs) {
            setPrescriptions([
              { id: '1', medicine: r.prescribed_drugs, dosage: '', startDate: '', endDate: '' },
            ]);
          }
        }
      } catch (err) {
        console.warn('Failed to load patient or medical records', err);
      }
    };

    load();
  }, []);

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
        {patient ? (
          <>
            <Text>Name: {patient.name}</Text>
            <Text>Age: {patient.age}</Text>
            <Text>Gender: {patient.gender}</Text>
            <Text>Contact: {patient.contact}</Text>
          </>
        ) : (
          <Text style={{ color: '#666' }}>No patient loaded. If you're a patient, ensure you are logged in. Otherwise choose a patient from your doctor's list.</Text>
        )}
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
