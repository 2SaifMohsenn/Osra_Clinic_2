import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { processOCR, processACR, processNLP } from '../../services';
import { getPatient } from '../../src/api/patients';
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord } from '../../src/api/medicalRecords';
import { getAppointments } from '../../src/api/appointments';
import { getPatients } from '../../src/api/patients';
import { getUser } from '../../src/utils/session';

// ================= Navigation Types =================

// ================= Interfaces =================
interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  contact: string;
  patientId: string;
}

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
}

interface LabResult {
  id: string;
  fileName: string;
  fileUri: string;
  fileType: string;
}

interface MedicalHistory {
  diagnoses: string[];
  surgeries: string[];
  allergies: string[];
  chronicConditions: string[];
}

// ================= Component =================
const Doctor_Emr = () => {
  const router = useRouter();
  const params: any = useLocalSearchParams();
  // ================= States =================
  const routePatientId = params?.patientId ? Number(params.patientId) : null;

  const [patient, setPatient] = useState<any | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<any | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [prescribedDrugs, setPrescribedDrugs] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');

  // Patient selection for doctors
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(routePatientId ?? null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // keep legacy local UI states
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    diagnoses: [],
    surgeries: [],
    allergies: [],
    chronicConditions: [],
  });

  const [prescriptions] = useState<Prescription[]>([]);

  const [labResults, setLabResults] = useState<LabResult[]>([]);

  const [doctorNotes, setDoctorNotes] = useState('');
  // Processing (OCR/ACR/NLP)
  const [processingFile, setProcessingFile] = useState<LabResult | null>(null);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [acrResult, setAcrResult] = useState<any | null>(null);
  const [nlpInput, setNlpInput] = useState<string>('');
  const [nlpResult, setNlpResult] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  // ================= Modals =================
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [labModalVisible, setLabModalVisible] = useState(false);

  const [editHistory, setEditHistory] = useState<MedicalHistory>({
    ...medicalHistory,
  });

  const [newLab, setNewLab] = useState<LabResult>({
    id: '',
    fileName: '',
    fileUri: '',
    fileType: '',
  });

  // ================= Animation =================
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch patient and their medical record when selectedPatientId changes
  useEffect(() => {
    const load = async () => {
      if (!selectedPatientId) return;
      try {
        const p = await getPatient(Number(selectedPatientId));
        setPatient(p);
        // fetch medical records for this patient (latest first)
        const recs = await getMedicalRecords({ patient: Number(selectedPatientId) });
        if (Array.isArray(recs) && recs.length > 0) {
          const r = recs[0];
          setMedicalRecord(r);
          setDiagnosis(r.diagnosis || '');
          setPrescribedDrugs(r.prescribed_drugs || '');
          setTreatmentNotes(r.treatment_notes || '');
        } else {
          setMedicalRecord(null);
          setDiagnosis('');
          setPrescribedDrugs('');
          setTreatmentNotes('');
        }
      } catch (err) {
        console.warn('Failed to load patient or records', err);
      }
    };

    load();
  }, [selectedPatientId]);

  // If logged in as dentist, fetch their patients (appointments -> unique patients)
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const session = getUser();
        if (!session || session.role !== 'dentist') return;
        setLoadingPatients(true);
        const appts = await (await import('../../src/api/appointments')).getAppointments();
        const myAppts = appts.filter((a: any) => a.dentist === session.id);
        const patientIds = Array.from(new Set(myAppts.map((a: any) => a.patient)));
        const allPatients = await (await import('../../src/api/patients')).getPatients();
        const myPatients = allPatients.filter((p: any) => patientIds.includes(p.id));
        setAvailablePatients(myPatients);
      } catch (err) {
        console.warn('Failed to load available patients', err);
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  // ================= Handlers =================
  const handleAddPrescription = () => {
    router.push('/Prescription');
  };

  const handleSaveHistory = () => {
    setMedicalHistory(editHistory);
    setHistoryModalVisible(false);
  };

  const handleSaveNotes = () => {
    console.log('Doctor Notes:', doctorNotes);
    alert('Doctor notes saved successfully');
  };

  const handleSaveRecord = async () => {
    if (!patient) {
      alert('Please select a patient to save the record for');
      return;
    }
    try {
      if (medicalRecord && medicalRecord.id) {
        const updated = await updateMedicalRecord(medicalRecord.id, {
          diagnosis,
          prescribed_drugs: prescribedDrugs,
          treatment_notes: treatmentNotes,
          patient: patient.id,
        });
        setMedicalRecord(updated);
        alert('Medical record updated');
      } else {
        const created = await createMedicalRecord({
          patient: patient.id,
          diagnosis,
          prescribed_drugs: prescribedDrugs,
          treatment_notes: treatmentNotes,
        });
        setMedicalRecord(created);
        alert('Medical record created');
      }
    } catch (err) {
      console.warn('Failed to save medical record', err);
      alert('Failed to save medical record');
    }
  };

  // ================= File Picker =================
  const pickLabFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      setNewLab({
        ...newLab,
        fileName: file.name,
        fileUri: file.uri,
        fileType: file.mimeType || 'unknown',
      });
    }
  };

  const pickProcessingFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'audio/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const picked: LabResult = {
        id: '',
        fileName: file.name,
        fileUri: file.uri,
        fileType: file.mimeType || 'unknown',
      };
      setProcessingFile(picked);
    }
  };

  const handleRunOCR = async () => {
    if (!processingFile?.fileUri) {
      alert('Please choose a file to process for OCR');
      return;
    }
    try {
      setProcessing(true);
      const res = await processOCR(processingFile);
      setOcrResult(res);
      // Optionally populate NLP input with extracted text
      if (res?.text) setNlpInput(typeof res.text === 'string' ? res.text : JSON.stringify(res.text));
    } catch (err) {
      console.warn('OCR failed', err);
      const errMsg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : String(err);
      alert(`OCR failed: ${errMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRunACR = async () => {
    if (!processingFile?.fileUri) {
      alert('Please choose a file to process for ACR');
      return;
    }
    try {
      setProcessing(true);
      const res = await processACR(processingFile);
      setAcrResult(res);
    } catch (err) {
      console.warn('ACR failed', err);
      const errMsg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : String(err);
      alert(`ACR failed: ${errMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRunNLP = async () => {
    if (!nlpInput || nlpInput.trim().length === 0) {
      alert('Please provide text to analyze with NLP');
      return;
    }
    try {
      setProcessing(true);
      const res = await processNLP(nlpInput);
      setNlpResult(res);
    } catch (err) {
      console.warn('NLP failed', err);
      const errMsg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : String(err);
      alert(`NLP failed: ${errMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveLabResult = () => {
    if (!newLab.fileUri) {
      alert('Please upload a lab file');
      return;
    }

    setLabResults([
      ...labResults,
      { ...newLab, id: (labResults.length + 1).toString() },
    ]);

    setNewLab({ id: '', fileName: '', fileUri: '', fileType: '' });
    setLabModalVisible(false);
  };

  // ================= Animated Section =================
  const AnimatedSection = ({ children }: { children: React.ReactNode }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
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

  // ================= UI =================
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Patient Selector (when dentist hasn't navigated with a patient) */}
      {!selectedPatientId ? (
        <AnimatedSection>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Patient to edit EMR</Text>
            {loadingPatients ? (
              <Text style={{ color: '#666' }}>Loading patients...</Text>
            ) : availablePatients.length === 0 ? (
              <Text style={{ color: '#666' }}>No patients found for your account.</Text>
            ) : (
              availablePatients.map((p) => (
                <TouchableOpacity key={p.id} style={{ paddingVertical: 10 }} onPress={() => setSelectedPatientId(p.id)}>
                  <Text style={{ fontWeight: '700' }}>{p.first_name} {p.last_name}</Text>
                  <Text style={{ color: '#666' }}>{p.email ?? p.phone}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </AnimatedSection>
      ) : null}

      {/* Patient Info */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <Text style={styles.textItem}>Name: {patient ? `${patient.first_name || ''} ${patient.last_name || ''}` : '—'}</Text>
          <Text style={styles.textItem}>Gender: {patient?.gender ?? '—'}</Text>
          <Text style={styles.textItem}>Contact: {patient?.phone ?? patient?.contact ?? '—'}</Text>
          <Text style={styles.textItem}>Patient ID: {patient?.id ?? '—'}</Text>
        </View>
      </AnimatedSection>

      {/* Medical History */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <Text style={styles.textItem}>
            Diagnoses: {medicalHistory.diagnoses.join(', ')}
          </Text>
          <Text style={styles.textItem}>
            Surgeries: {medicalHistory.surgeries.join(', ')}
          </Text>
          <Text style={styles.textItem}>
            Allergies: {medicalHistory.allergies.join(', ')}
          </Text>
          <Text style={styles.textItem}>
            Chronic Conditions:{' '}
            {medicalHistory.chronicConditions.join(', ')}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.buttonText}>Update Medical History</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* Medical Record Editor */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Record</Text>
          {medicalRecord && medicalRecord.record_date ? (
            <Text style={{ color: '#666', marginBottom: 8 }}>Last: {new Date(medicalRecord.record_date).toLocaleString()}</Text>
          ) : null}

          <Text style={styles.textItem}>Diagnosis</Text>
          <TextInput
            style={[styles.textInput, { height: 100 }]}
            multiline
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Enter diagnosis..."
          />

          <Text style={styles.textItem}>Prescribed Drugs</Text>
          <TextInput
            style={[styles.textInput, { height: 80 }]}
            multiline
            value={prescribedDrugs}
            onChangeText={setPrescribedDrugs}
            placeholder="List prescribed drugs..."
          />

          <Text style={styles.textItem}>Treatment Notes</Text>
          <TextInput
            style={[styles.textInput, { height: 120 }]}
            multiline
            value={treatmentNotes}
            onChangeText={setTreatmentNotes}
            placeholder="Notes about treatment..."
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveRecord}>
            <Text style={styles.buttonText}>{medicalRecord ? 'Update Record' : 'Create Record'}</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* Prescriptions */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescriptions</Text>
          <FlatList
            data={prescriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.textItem}>
                  Medicine: {item.medicine}
                </Text>
                <Text style={styles.textItem}>Dosage: {item.dosage}</Text>
                <Text style={styles.textItem}>
                  Duration: {item.duration}
                </Text>
                <Text style={styles.textItem}>Notes: {item.notes}</Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAddPrescription}
          >
            <Text style={styles.buttonText}>Add Prescription</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* Lab Results */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lab Results</Text>

          <FlatList
            data={labResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.textItem}>
                  File: {item.fileName}
                </Text>
                <Text style={styles.textItem}>
                  Type: {item.fileType}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => setLabModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add Lab Result</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* Doctor Notes */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor's Notes</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your notes here..."
            value={doctorNotes}
            onChangeText={setDoctorNotes}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveNotes}>
            <Text style={styles.buttonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* OCR / ACR / NLP Section */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OCR / ACR / NLP</Text>

          <View style={{ marginBottom: 8 }}>
            <TouchableOpacity style={styles.button} onPress={pickProcessingFile}>
              <Text style={styles.buttonText}>Choose File for OCR/ACR</Text>
            </TouchableOpacity>
            {processingFile?.fileName ? (
              <Text style={{ marginTop: 8, color: '#555' }}>Selected: {processingFile.fileName}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.flex]} onPress={handleRunOCR}>
              <Text style={styles.buttonText}>Run OCR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.flex]} onPress={handleRunACR}>
              <Text style={styles.buttonText}>Run ACR</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.textItem}>NLP Input (use extracted OCR text or paste your own):</Text>
            <TextInput
              style={[styles.textInput, { height: 120 }]}
              multiline
              value={nlpInput}
              onChangeText={setNlpInput}
              placeholder="Paste text or use OCR result..."
            />
            <TouchableOpacity style={styles.button} onPress={handleRunNLP}>
              <Text style={styles.buttonText}>Run NLP</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 8 }}>
            {processing ? <Text style={{ color: '#666' }}>Processing...</Text> : null}

            {ocrResult ? (
              <View style={[styles.card, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>OCR Result</Text>
                <Text style={{ color: '#555' }}>{typeof ocrResult === 'string' ? ocrResult : (ocrResult?.text ?? JSON.stringify(ocrResult, null, 2))}</Text>
              </View>
            ) : null}

            {acrResult ? (
              <View style={[styles.card, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>ACR Result</Text>
                {/* Display medication list nicely */}
                {Array.isArray(acrResult?.found) && acrResult.found.length > 0 ? (
                  acrResult.found.map((m: any, i: number) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ color: '#333', fontWeight: '700' }}>{m.medication}</Text>
                      <Text style={{ color: '#555' }}>{m.dosage}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#555' }}>No medications found</Text>
                )}
              </View>
            ) : null}

            {nlpResult ? (
              <View style={[styles.card, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>NLP Result</Text>
                <Text style={{ color: '#555' }}>{JSON.stringify(nlpResult, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedSection>

      {/* ===== Medical History Modal ===== */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Edit Medical History</Text>

            {(['diagnoses', 'surgeries', 'allergies', 'chronicConditions'] as const).map(
              (field) => (
                <TextInput
                  key={field}
                  style={styles.textInput}
                  placeholder={field}
                  value={editHistory[field].join(', ')}
                  onChangeText={(text) =>
                    setEditHistory({
                      ...editHistory,
                      [field]: text.split(',').map((t) => t.trim()),
                    })
                  }
                />
              )
            )}

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.flex]}
                onPress={handleSaveHistory}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Lab Upload Modal ===== */}
      <Modal visible={labModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Upload Lab Result</Text>

            <TouchableOpacity style={styles.button} onPress={pickLabFile}>
              <Text style={styles.buttonText}>Choose File</Text>
            </TouchableOpacity>

            {newLab.fileName ? (
              <Text style={{ marginTop: 10, color: '#555' }}>
                Selected: {newLab.fileName}
              </Text>
            ) : null}

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.flex]}
                onPress={handleSaveLabResult}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => setLabModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Doctor_Emr;

// ================= Styles =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    padding: 10,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  textItem: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#4e91fc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    padding: 15,
    backgroundColor: '#f0f3ff',
    borderRadius: 12,
    marginVertical: 5,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#fafafa',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  flex: {
    flex: 0.45,
  },
  cancel: {
    flex: 0.45,
    backgroundColor: '#f44336',
  },
});