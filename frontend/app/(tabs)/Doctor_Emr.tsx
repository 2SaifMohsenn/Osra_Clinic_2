import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { processOCR, processACR, processNLP } from '../../services';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPatients, updatePatient } from '../../src/api/patients';
import { createMedicalRecord, getMedicalRecords } from '../../src/api/medicalRecords';

/* ================= Interfaces ================= */
interface Patient {
  id: string;
  name: string;
  gender: string;
  contact: string;
  diseases?: string;
  allergies?: string;
  medications?: string;
}

interface MedicalHistory {
  diseases: string;
  allergies: string;
  medications: string;
}

interface DentalIssue {
  tooth: string;
  issue: string;
}

interface TreatmentPlanItem {
  tooth: string;
  procedure: string;
  status: 'Pending' | 'Completed';
}

/* ================= Sub-Components ================= */
const AnimatedSection = ({ children, slideAnim }: { children: React.ReactNode; slideAnim: Animated.Value }) => (
  <Animated.View
    style={{
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    }}
  >
    {children}
  </Animated.View>
);

/* ================= Component ================= */
const Doctor_Emr = () => {
  /* ================= Patients ================= */
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  /* ================= Fetch Patients ================= */
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const data = await getPatients();
        const mapped: Patient[] = data.map((p: any) => ({
          id: String(p.id),
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
          gender: p.gender || 'Unknown',
          contact: p.phone_number || 'N/A',
          diseases: p.diseases || '',
          allergies: p.allergies || '',
          medications: p.medications || '',
        }));
        setPatients(mapped);
      } catch (e) {
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  /* ================= EMR Data ================= */
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    diseases: '',
    allergies: '',
    medications: '',
  });

  const [dentalIssues, setDentalIssues] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  /* ================= Route Params ================= */
  const { patientId } = useLocalSearchParams();

  /* ================= Patient Selection Logic ================= */
  const handleSelectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    // Load his existing chronic history into state
    setMedicalHistory({
      diseases: p.diseases || '',
      allergies: p.allergies || '',
      medications: p.medications || '',
    });

    // Load his latest medical record if exists
    try {
      const records = await getMedicalRecords({ patient: p.id });
      if (records && records.length > 0) {
        const latest = records[0];
        setDiagnosis(latest.diagnosis || '');
        setPrescription(latest.prescribed_drugs || '');
        setNotes(latest.treatment_notes || '');
        setDentalIssues(latest.dental_issues || '');
        setTreatmentPlan(latest.treatment_plan || '');
      } else {
        setDiagnosis('');
        setPrescription('');
        setNotes('');
        setDentalIssues('');
        setTreatmentPlan('');
      }
    } catch (e) {
      console.log("Error fetching latest record", e);
    }
  };

  /* ================= Check for param-based selection ================= */
  useEffect(() => {
    if (patientId && patients.length > 0) {
      // Only auto-select if different from current or nothing selected
      if (!selectedPatient || selectedPatient.id !== String(patientId)) {
        const target = patients.find(p => p.id === String(patientId));
        if (target) {
          handleSelectPatient(target);
        }
      }
    }
  }, [patientId, patients, selectedPatient]);

  /* ================= AI ================= */
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [nlpInput, setNlpInput] = useState('');
  const [processing, setProcessing] = useState(false);

  /* ================= Animation ================= */
  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);


  /* ================= File Picker ================= */
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'audio/*'],
    });
    if (!result.canceled) setSelectedFile(result.assets[0]);
  };

  /* ================= AI Actions ================= */
  const runOCR = async () => {
    if (!selectedFile) return alert('Choose a file first');
    setProcessing(true);
    try {
      const res = await processOCR(selectedFile);
      if (res?.text) setNlpInput(res.text);
    } catch (e: any) {
      alert('OCR Error: ' + (e.message || e));
    } finally {
      setProcessing(false);
    }
  };

  const runACR = async () => {
    if (!selectedFile) return alert('Choose a file first');
    setProcessing(true);
    try {
      const res = await processACR(selectedFile);
      if (res?.found && res.found.length > 0) {
        const medsStr = res.found.map((m: any) => `${m.medication}: ${m.dosage}`).join('\n');
        setPrescription(prev => prev ? `${prev}\n${medsStr}` : medsStr);
        alert('Medications extracted and added to prescription');
      } else {
        alert('No medications detected in the document');
      }
    } catch (e: any) {
      alert('ACR Error: ' + (e.message || e));
    } finally {
      setProcessing(false);
    }
  };

  const runNLP = async () => {
    if (!nlpInput.trim()) return alert('Enter text first');
    setProcessing(true);
    try {
      const res = await processNLP(nlpInput);
      if (res?.extracted) {
        const { diagnosis: diag, history: hist, notes: nts } = res.extracted;

        if (diag) setDiagnosis(prev => prev ? `${prev}\n${diag}` : diag);
        if (hist) setMedicalHistory(prev => prev ? `${prev}\n${hist}` : hist);
        if (nts) setNotes(prev => prev ? `${prev}\n${nts}` : nts);

        if (diag || hist || nts) {
          alert('AI Analysis Complete: Form fields have been updated based on your text.');
        } else {
          alert('AI Analysis Complete: No specific clinical entities found.');
        }
      }
    } catch (e: any) {
      alert('NLP Error: ' + (e.message || e));
    } finally {
      setProcessing(false);
    }
  };

  /* ================= UI ================= */
  return (
    <ScrollView style={styles.container}>
      {/* Patient Selector */}
      {!selectedPatient ? (
        <AnimatedSection slideAnim={slideAnim}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Patient</Text>
            {loadingPatients ? (
              <ActivityIndicator size="large" color="#4e91fc" />
            ) : (
              patients.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.patientItem}
                  onPress={() => handleSelectPatient(p)}
                >
                  <Text style={styles.patientName}>{p.name}</Text>
                  <Text style={styles.patientInfo}>{p.gender} • {p.contact}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </AnimatedSection>
      ) : (
        <View style={styles.activePatientHeader}>
          <View>
            <Text style={styles.activePatientLabel}>Working on</Text>
            <Text style={styles.activePatientName}>{selectedPatient.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.changePatientBtn}
            onPress={() => setSelectedPatient(null)}
          >
            <Text style={styles.changePatientBtnText}>Change Patient</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedPatient && (
        <>
          {/* Medical History */}
          <AnimatedSection slideAnim={slideAnim}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical History</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Diseases"
                value={medicalHistory.diseases}
                onChangeText={(t) => setMedicalHistory({ ...medicalHistory, diseases: t })}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Allergies"
                value={medicalHistory.allergies}
                onChangeText={(t) => setMedicalHistory({ ...medicalHistory, allergies: t })}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Medications"
                value={medicalHistory.medications}
                onChangeText={(t) => setMedicalHistory({ ...medicalHistory, medications: t })}
              />
            </View>
          </AnimatedSection>

          {/* Dental & Diagnosis */}
          <AnimatedSection slideAnim={slideAnim}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diagnosis & Notes</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Diagnosis"
                value={diagnosis}
                onChangeText={setDiagnosis}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Dental Issues (e.g., Tooth 14: Caries)"
                value={dentalIssues}
                onChangeText={setDentalIssues}
              />
              <TextInput
                style={[styles.textInput, { height: 100 }]}
                multiline
                placeholder="Clinical Notes"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </AnimatedSection>

          {/* Treatment & Prescription */}
          <AnimatedSection slideAnim={slideAnim}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Treatment & Prescription</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                placeholder="Treatment Plan"
                value={treatmentPlan}
                onChangeText={setTreatmentPlan}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Prescription"
                value={prescription}
                onChangeText={setPrescription}
              />
            </View>
          </AnimatedSection>

          {/* OCR / ACR / NLP */}
          <AnimatedSection slideAnim={slideAnim}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OCR / ACR / NLP</Text>
              <TouchableOpacity style={styles.button} onPress={pickFile}>
                <Text style={styles.buttonText}>Choose File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={runOCR}>
                <Text style={styles.buttonText}>Run OCR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={runACR}>
                <Text style={styles.buttonText}>Run ACR</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { height: 100 }]}
                multiline
                placeholder="NLP Input"
                value={nlpInput}
                onChangeText={setNlpInput}
              />
              <TouchableOpacity style={styles.button} onPress={runNLP}>
                <Text style={styles.buttonText}>Run NLP</Text>
              </TouchableOpacity>
              {processing && <Text style={{ marginTop: 10 }}>Processing...</Text>}
            </View>
          </AnimatedSection>

          {/* Save Button */}
          <AnimatedSection slideAnim={slideAnim}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={async () => {
                if (!selectedPatient) return;
                setProcessing(true);
                try {
                  // 1. Update patient chronic history
                  await updatePatient(Number(selectedPatient.id), {
                    diseases: medicalHistory.diseases,
                    allergies: medicalHistory.allergies,
                    medications: medicalHistory.medications,
                  });

                  // 2. Create new Medical Record for this encounter
                  await createMedicalRecord({
                    patient: Number(selectedPatient.id),
                    diagnosis: diagnosis,
                    prescribed_drugs: prescription,
                    treatment_notes: notes,
                    dental_issues: dentalIssues,
                    treatment_plan: treatmentPlan,
                  });

                  alert('EMR Saved Successfully');
                } catch (e: any) {
                  alert('Error saving EMR: ' + (e.message || e));
                } finally {
                  setProcessing(false);
                }
              }}
            >
              <Text style={styles.buttonText}>Save Patient EMR</Text>
            </TouchableOpacity>
          </AnimatedSection>
          <View style={{ height: 40 }} />
        </>
      )}
    </ScrollView>
  );
};

export default Doctor_Emr;

/* ================= Styles ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb', padding: 10 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#4e91fc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  patientItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  patientSelected: { backgroundColor: '#e8f0ff', borderColor: '#4e91fc' },
  patientName: { fontWeight: '700', fontSize: 16 },
  patientInfo: { color: '#666', marginTop: 2 },
  saveButton: {
    backgroundColor: '#28a745',
    marginVertical: 20,
    height: 60,
    justifyContent: 'center',
  },
  activePatientHeader: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activePatientLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  activePatientName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  changePatientBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  changePatientBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
});
