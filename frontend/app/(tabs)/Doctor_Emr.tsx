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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your stack param types
type RootStackParamList = {
  Doctor_Emr: undefined;
  Prescription: undefined; // add params here if needed
};

// Define navigation prop type
type DoctorEmrNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Doctor_Emr'>;

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
  test: string;
  result: string;
  date: string;
}

interface MedicalHistory {
  diagnoses: string[];
  surgeries: string[];
  allergies: string[];
  chronicConditions: string[];
}

const Doctor_Emr = () => {
  const navigation = useNavigation<DoctorEmrNavigationProp>();

  const [patient, setPatient] = useState<PatientInfo>({
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    contact: '123-456-7890',
    patientId: 'P-00123',
  });

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    diagnoses: ['Hypertension'],
    surgeries: ['Appendectomy'],
    allergies: ['Penicillin'],
    chronicConditions: ['Diabetes'],
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: '1', medicine: 'Metformin', dosage: '500mg', duration: '30 days', notes: 'Take after meals' },
  ]);

  const [labResults, setLabResults] = useState<LabResult[]>([
    { id: '1', test: 'Blood Sugar', result: '110 mg/dL', date: '2025-12-10' },
  ]);

  // Modal states
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [labModalVisible, setLabModalVisible] = useState(false);

  // Temp states for editing
  const [editHistory, setEditHistory] = useState<MedicalHistory>({ ...medicalHistory });
  const [newLab, setNewLab] = useState<LabResult>({ id: '', test: '', result: '', date: '' });

  // Doctor notes
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // Animations
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Handlers
  const handleUpdateHistory = () => setHistoryModalVisible(true);
  const handleAddLabResult = () => setLabModalVisible(true);
  const handleSaveHistory = () => {
    setMedicalHistory(editHistory);
    setHistoryModalVisible(false);
  };
  const handleSaveLabResult = () => {
    setLabResults([...labResults, { ...newLab, id: (labResults.length + 1).toString() }]);
    setNewLab({ id: '', test: '', result: '', date: '' });
    setLabModalVisible(false);
  };

  const handleAddPrescription = () => {
    navigation.navigate('Prescription'); // ✅ Typed navigation
  };

  const handleSaveNotes = () => {
    // Save doctor notes (currently just alerts; connect to backend if needed)
    console.log('Doctor Notes Saved:', doctorNotes);
    alert('Doctor notes saved successfully!');
  };

  const AnimatedSection = ({ children }: { children: React.ReactNode }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Patient Info */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <Text style={styles.textItem}>Name: {patient.name}</Text>
          <Text style={styles.textItem}>Age: {patient.age}</Text>
          <Text style={styles.textItem}>Gender: {patient.gender}</Text>
          <Text style={styles.textItem}>Contact: {patient.contact}</Text>
          <Text style={styles.textItem}>Patient ID: {patient.patientId}</Text>
        </View>
      </AnimatedSection>

      {/* Medical History */}
      <AnimatedSection>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <Text style={styles.textItem}>Diagnoses: {medicalHistory.diagnoses.join(', ')}</Text>
          <Text style={styles.textItem}>Surgeries: {medicalHistory.surgeries.join(', ')}</Text>
          <Text style={styles.textItem}>Allergies: {medicalHistory.allergies.join(', ')}</Text>
          <Text style={styles.textItem}>Chronic Conditions: {medicalHistory.chronicConditions.join(', ')}</Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdateHistory} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Update Medical History</Text>
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
                <Text style={styles.textItem}>Medicine: {item.medicine}</Text>
                <Text style={styles.textItem}>Dosage: {item.dosage}</Text>
                <Text style={styles.textItem}>Duration: {item.duration}</Text>
                <Text style={styles.textItem}>Notes: {item.notes}</Text>
              </View>
            )}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddPrescription} activeOpacity={0.8}>
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
                <Text style={styles.textItem}>Test: {item.test}</Text>
                <Text style={styles.textItem}>Result: {item.result}</Text>
                <Text style={styles.textItem}>Date: {item.date}</Text>
              </View>
            )}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddLabResult} activeOpacity={0.8}>
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
            placeholderTextColor="#888"
            value={doctorNotes}
            onChangeText={setDoctorNotes}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveNotes} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* Modals */}
      <Modal visible={historyModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Edit Medical History</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Diagnoses (comma separated)"
              value={editHistory.diagnoses.join(', ')}
              onChangeText={(text) =>
                setEditHistory({ ...editHistory, diagnoses: text.split(',').map((t) => t.trim()) })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Surgeries (comma separated)"
              value={editHistory.surgeries.join(', ')}
              onChangeText={(text) =>
                setEditHistory({ ...editHistory, surgeries: text.split(',').map((t) => t.trim()) })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Allergies (comma separated)"
              value={editHistory.allergies.join(', ')}
              onChangeText={(text) =>
                setEditHistory({ ...editHistory, allergies: text.split(',').map((t) => t.trim()) })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Chronic Conditions (comma separated)"
              value={editHistory.chronicConditions.join(', ')}
              onChangeText={(text) =>
                setEditHistory({ ...editHistory, chronicConditions: text.split(',').map((t) => t.trim()) })
              }
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity style={[styles.button, { flex: 0.45 }]} onPress={handleSaveHistory}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 0.45, backgroundColor: '#f44336' }]}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={labModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Add Lab Result</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Test"
              value={newLab.test}
              onChangeText={(text) => setNewLab({ ...newLab, test: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Result"
              value={newLab.result}
              onChangeText={(text) => setNewLab({ ...newLab, result: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Date (YYYY-MM-DD)"
              value={newLab.date}
              onChangeText={(text) => setNewLab({ ...newLab, date: text })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity style={[styles.button, { flex: 0.45 }]} onPress={handleSaveLabResult}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 0.45, backgroundColor: '#f44336' }]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb', padding: 10 },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#333' },
  textItem: { fontSize: 16, marginBottom: 5, color: '#555' },
  button: {
    marginTop: 15,
    backgroundColor: '#4e91fc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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
});
