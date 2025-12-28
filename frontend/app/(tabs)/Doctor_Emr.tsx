import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated as RNAnimated,
  Easing,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { processOCR, processACR, processNLP } from '../../services';
import VoiceDictationModal from '../../components/VoiceDictationModal';
import { DiseaseSearchModal } from '../../components/DiseaseSearchModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPatients, updatePatient } from '../../src/api/patients';
import { createMedicalRecord, getMedicalRecords } from '../../src/api/medicalRecords';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing as REasing
} from 'react-native-reanimated';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

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

/* ================= Constant Colors ================= */
const COLORS = {
  primary: '#4e91fc',
  primaryDark: '#3b7de5',
  bg: '#f8fafc',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  text: '#1e293b',
  subText: '#64748b',
  success: '#22c55e',
};

/* ================= Sub-Components ================= */
const GlassCard = ({ children, title, icon, style }: { children: React.ReactNode; title?: string; icon?: any; style?: any }) => (
  <View style={[styles.glassCardContainer, style]}>
    {Platform.OS !== 'android' && (
      <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
    )}
    <View style={styles.glassCardContent}>
      {title && (
        <View style={styles.cardHeader}>
          {icon && <Ionicons name={icon} size={22} color={COLORS.primary} style={{ marginRight: 10 }} />}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  </View>
);

const AnimatedSection = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 600, easing: REasing.out(REasing.exp) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const Doctor_Emr = () => {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();

  /* ================= State ================= */
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [nlpInput, setNlpInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);

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

  /* ================= Patient Selection Logic ================= */
  const handleSelectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    setMedicalHistory({
      diseases: p.diseases || '',
      allergies: p.allergies || '',
      medications: p.medications || '',
    });

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
        setDiagnosis(''); setPrescription(''); setNotes(''); setDentalIssues(''); setTreatmentPlan('');
      }
    } catch (e) {
      console.log("Error fetching latest record", e);
    }
  };

  useEffect(() => {
    if (patientId && patients.length > 0) {
      if (!selectedPatient || selectedPatient.id !== String(patientId)) {
        const target = patients.find(p => p.id === String(patientId));
        if (target) handleSelectPatient(target);
      }
    }
  }, [patientId, patients, selectedPatient]);

  /* ================= AI Actions ================= */
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'audio/*'],
    });
    if (!result.canceled) setSelectedFile(result.assets[0]);
  };

  const runOCR = async () => {
    if (!selectedFile) return alert('Choose a file first');
    setProcessing(true);
    try {
      const res = await processOCR(selectedFile);
      if (res?.text) setNlpInput(res.text);
    } catch (e: any) { alert('OCR Error: ' + (e.message || e)); }
    finally { setProcessing(false); }
  };

  const runACR = async () => {
    setShowVoiceModal(true);
  };

  const handleVoiceTranscription = async (text: string) => {
    setProcessing(true);
    try {
      const res = await processACR(text);
      if (res?.found && res.found.length > 0) {
        const medsStr = res.found.map((m: any) => `${m.medication}: ${m.dosage}`).join('\n');
        setPrescription(prev => prev ? `${prev}\n${medsStr}` : medsStr);
        alert('Medications extracted and added to prescription');
      } else {
        alert('No medications detected in your dictation');
      }
    } catch (e: any) { alert('Voice ACR Error: ' + (e.message || e)); }
    finally { setProcessing(false); }
  };

  const runNLP = async () => {
    if (!nlpInput.trim()) return alert('Enter text first');
    setProcessing(true);
    try {
      const res = await processNLP(nlpInput);
      if (res?.extracted) {
        const { diagnosis: diag, history: hist, notes: nts } = res.extracted;
        if (diag) setDiagnosis(prev => prev ? `${prev}\n${diag}` : diag);
        if (hist) setMedicalHistory(prev => ({ ...prev, diseases: prev.diseases ? `${prev.diseases}\n${hist}` : hist }));
        if (nts) setNotes(prev => prev ? `${prev}\n${nts}` : nts);
        alert('AI Analysis Complete: Form fields updated.');
      }
    } catch (e: any) { alert('NLP Error: ' + (e.message || e)); }
    finally { setProcessing(false); }
  };

  /* ================= Background Animations ================= */
  const orb1Anim = useSharedValue(0);
  const orb2Anim = useSharedValue(0);

  useEffect(() => {
    orb1Anim.value = withRepeat(withTiming(1, { duration: 10000, easing: REasing.linear }), -1, true);
    orb2Anim.value = withRepeat(withTiming(1, { duration: 12000, easing: REasing.linear }), -1, true);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: RNAnimated.multiply(orb1Anim.value, 50) as any },
      { translateY: RNAnimated.multiply(orb1Anim.value, 30) as any },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: RNAnimated.multiply(orb2Anim.value, -40) as any },
      { translateY: RNAnimated.multiply(orb2Anim.value, -60) as any },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background Decoration */}
      <View style={styles.bgDecoration}>
        <Animated.View style={[styles.orb1, orb1Style]} />
        <Animated.View style={[styles.orb2, orb2Style]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSpacer} />

        {/* Patient Selection or Header */}
        {!selectedPatient ? (
          <AnimatedSection index={0}>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Clinical Records</Text>
              <Text style={styles.heroSubtitle}>Select a patient to begin documentation</Text>
            </View>
            <GlassCard title="Recent Patients" icon="people-outline">
              {loadingPatients ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 20 }} />
              ) : (
                patients.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.patientCard}
                    onPress={() => handleSelectPatient(p)}
                  >
                    <View style={styles.patientAvatar}>
                      <Text style={styles.avatarText}>{p.name[0]}</Text>
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{p.name}</Text>
                      <Text style={styles.patientSub}>{p.gender} • {p.contact}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                ))
              )}
            </GlassCard>
          </AnimatedSection>
        ) : (
          <AnimatedSection index={0}>
            <View style={styles.activeHeader}>
              <View style={styles.activePatientBox}>
                <View style={styles.activeAvatar}>
                  <Text style={styles.activeAvatarText}>{selectedPatient.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.activeLabel}>PATIENT UNDER REVIEW</Text>
                  <Text style={styles.activeName}>{selectedPatient.name}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.changeBtn} onPress={() => setSelectedPatient(null)}>
                <Text style={styles.changeBtnText}>Switch</Text>
              </TouchableOpacity>
            </View>
          </AnimatedSection>
        )}

        {selectedPatient && (
          <View style={styles.formContainer}>
            {/* Medical History */}
            <AnimatedSection index={1}>
              <GlassCard title="Medical Background" icon="medical-outline">
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Chronic Diseases</Text>
                  <TextInput
                    style={styles.glassInput}
                    placeholder="e.g., Hypertension, Diabetes"
                    value={medicalHistory.diseases}
                    onChangeText={(t) => setMedicalHistory({ ...medicalHistory, diseases: t })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Allergies</Text>
                  <TextInput
                    style={styles.glassInput}
                    placeholder="e.g., Penicillin, Latex"
                    value={medicalHistory.allergies}
                    onChangeText={(t) => setMedicalHistory({ ...medicalHistory, allergies: t })}
                  />
                </View>
              </GlassCard>
            </AnimatedSection>

            {/* Diagnosis & Notes */}
            <AnimatedSection index={2}>
              <GlassCard title="Observations & Diagnosis" icon="document-text-outline">
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Primary Diagnosis</Text>
                  <TextInput
                    style={styles.glassInput}
                    placeholder="Enter diagnosis"
                    value={diagnosis}
                    onChangeText={setDiagnosis}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Clinical Notes</Text>
                  <TextInput
                    style={[styles.glassInput, styles.textArea]}
                    multiline
                    placeholder="Detailed observations..."
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              </GlassCard>
            </AnimatedSection>

            {/* AI Assistance Section */}
            <AnimatedSection index={3}>
              <View style={styles.aiSection}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.aiTitle}>AI Intelligence Suite</Text>
                </View>
                <View style={styles.aiActionsGrid}>
                  <TouchableOpacity style={styles.aiActionBtn} onPress={pickFile}>
                    <Ionicons name="attach" size={20} color="#fff" />
                    <Text style={styles.aiActionText}>Attach File</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.aiActionBtn} onPress={runOCR}>
                    <Ionicons name="eye" size={20} color="#fff" />
                    <Text style={styles.aiActionText}>Run OCR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.aiActionBtn, styles.acrBtn]} onPress={runACR}>
                    <Ionicons name="mic" size={20} color="#fff" />
                    <Text style={styles.aiActionText}>Voice ACR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.aiActionBtn, { backgroundColor: '#3B82F6' }]} onPress={() => setShowDiseaseModal(true)}>
                    <Ionicons name="search" size={20} color="#fff" />
                    <Text style={styles.aiActionText}>Disease Search</Text>
                  </TouchableOpacity>
                </View>
                {selectedFile && (
                  <View style={styles.fileBadge}>
                    <Ionicons name="document-attach" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.fileBadgeText} numberOfLines={1}>{selectedFile.name}</Text>
                  </View>
                )}
                <View style={[styles.inputGroup, { marginTop: 15 }]}>
                  <TextInput
                    style={[styles.glassInput, styles.aiInput, { height: 80 }]}
                    multiline
                    placeholder="AI extracted data will appear here or paste clinical notes..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={nlpInput}
                    onChangeText={setNlpInput}
                  />
                </View>
                <TouchableOpacity style={styles.nlpRunBtn} onPress={runNLP}>
                  <Text style={styles.nlpRunBtnText}>Process with AI NLP</Text>
                </TouchableOpacity>
              </View>
            </AnimatedSection>

            {/* Treatment & Prescription */}
            <AnimatedSection index={4}>
              <GlassCard title="Treatment & Rx" icon="medkit-outline">
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Treatment Plan</Text>
                  <TextInput
                    style={[styles.glassInput, { height: 60 }]}
                    multiline
                    placeholder="Procedures, follow-up..."
                    value={treatmentPlan}
                    onChangeText={setTreatmentPlan}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prescription</Text>
                  <View style={styles.prescriptionContainer}>
                    <TextInput
                      style={[styles.glassInput, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                      placeholder="Medications & dosage"
                      value={prescription}
                      onChangeText={setPrescription}
                    />
                    <TouchableOpacity style={styles.prescMicBtn} onPress={runACR}>
                      <Ionicons name="mic" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </AnimatedSection>

            {/* Save Button */}
            <AnimatedSection index={5}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={async () => {
                  if (!selectedPatient) return;
                  setProcessing(true);
                  try {
                    await updatePatient(Number(selectedPatient.id), {
                      diseases: medicalHistory.diseases,
                      allergies: medicalHistory.allergies,
                      medications: medicalHistory.medications,
                    });
                    await createMedicalRecord({
                      patient: Number(selectedPatient.id),
                      diagnosis: diagnosis,
                      prescribed_drugs: prescription,
                      treatment_notes: notes,
                      dental_issues: dentalIssues,
                      treatment_plan: treatmentPlan,
                    });
                    alert('Medical Record Finalized Successfully');
                  } catch (e: any) { alert('Error saving: ' + (e.message || e)); }
                  finally { setProcessing(false); }
                }}
              >
                {processing ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="cloud-upload" size={22} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.saveBtnText}>Finalize Medical Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </AnimatedSection>

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      <VoiceDictationModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscriptionComplete={handleVoiceTranscription}
      />

      <DiseaseSearchModal
        visible={showDiseaseModal}
        onClose={() => setShowDiseaseModal(false)}
        onSelect={(name, id) => {
          setDiagnosis(prev => prev ? `${prev}\n${name} (${id})` : `${name} (${id})`);
        }}
      />
    </View>
  );
};

export default Doctor_Emr;

/* ================= Styles ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bgDecoration: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  orb1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(78, 145, 252, 0.2)',
  },
  orb2: {
    position: 'absolute',
    bottom: 100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  scrollContent: { padding: 16 },
  headerSpacer: { height: 40 },

  heroSection: { marginBottom: 24, paddingHorizontal: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: COLORS.subText, fontWeight: '500' },

  glassCardContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  glassCardContent: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  patientAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  patientSub: { fontSize: 12, color: COLORS.subText, marginTop: 2 },

  activeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  activePatientBox: { flexDirection: 'row', alignItems: 'center' },
  activeAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  activeAvatarText: { color: '#fff', fontWeight: '700' },
  activeLabel: { fontSize: 10, fontWeight: '800', color: COLORS.subText, letterSpacing: 1 },
  activeName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  changeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f1f5f9' },
  changeBtnText: { color: COLORS.subText, fontWeight: '600', fontSize: 12 },

  formContainer: { gap: 10 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.subText, marginBottom: 8, marginLeft: 4 },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  aiSection: {
    backgroundColor: COLORS.text,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 8,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginLeft: 10, textTransform: 'uppercase' },
  aiActionsGrid: { flexDirection: 'row', gap: 10 },
  aiActionBtn: {
    flex: 1, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  acrBtn: { backgroundColor: COLORS.primary },
  aiActionText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  fileBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 8, alignSelf: 'flex-start',
  },
  fileBadgeText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 6, maxWidth: 150 },
  aiInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' },
  nlpRunBtn: {
    backgroundColor: '#fff', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 15,
  },
  nlpRunBtnText: { color: COLORS.text, fontWeight: '800', fontSize: 14 },

  prescriptionContainer: { flexDirection: 'row' },
  prescMicBtn: {
    width: 48, backgroundColor: COLORS.primary, borderTopRightRadius: 16, borderBottomRightRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },

  saveBtn: {
    backgroundColor: COLORS.primary, height: 64, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 10, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
