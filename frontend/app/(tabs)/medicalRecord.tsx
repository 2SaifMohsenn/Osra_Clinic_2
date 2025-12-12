import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, MUTED, PRIMARY } from './PatientDashboard'; // Reuse constants

type RecordItem = {
  id: string;
  date: string;
  dentist: string;
  diagnosis: string;
  treatmentNotes: string;
  drugs: string;
  dosage: string;
};

const RECORDS: RecordItem[] = [
  {
    id: 'r1',
    date: 'Oct 15, 2023',
    dentist: 'Dr. Smith',
    diagnosis: 'Cavity in molar',
    treatmentNotes: 'Filled cavity using composite material.',
    drugs: 'Painkiller',
    dosage: '2x per day',
  },
  {
    id: 'r2',
    date: 'Jul 22, 2023',
    dentist: 'Dr. Jones',
    diagnosis: 'Routine Check-up',
    treatmentNotes: 'Teeth cleaned and fluoride applied.',
    drugs: 'None',
    dosage: 'N/A',
  },
];

export default function MedicalRecord() {
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Medical Records</Text>
        <Text style={styles.subText}>View your electronic medical records (EMR).</Text>

        <FlatList
          data={RECORDS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordRow item={item} onPress={() => setSelectedRecord(item)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal for detailed record view */}
      <Modal visible={!!selectedRecord} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecord && (
              <>
                <Text style={styles.recordTitle}>Date: {selectedRecord.date}</Text>
                <Text style={styles.recordSub}>Dentist: {selectedRecord.dentist}</Text>
                <Text style={styles.sectionTitle}>Diagnosis</Text>
                <Text style={styles.recordText}>{selectedRecord.diagnosis}</Text>
                <Text style={styles.sectionTitle}>Treatment Notes</Text>
                <Text style={styles.recordText}>{selectedRecord.treatmentNotes}</Text>
                <Text style={styles.sectionTitle}>Drugs</Text>
                <Text style={styles.recordText}>{selectedRecord.drugs}</Text>
                <Text style={styles.sectionTitle}>Dosage</Text>
                <Text style={styles.recordText}>{selectedRecord.dosage}</Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedRecord(null)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ----- Mini components ----- */

function RecordRow({ item, onPress }: { item: RecordItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { flexDirection: 'column', padding: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.rowTitle}>{item.date}</Text>
        <Text style={styles.rowSub}>{item.dentist}</Text>
      </View>
      <Text style={styles.rowSub}>Diagnosis: {item.diagnosis}</Text>
      <TouchableOpacity style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ----- Styles ----- */

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingVertical: 26, paddingHorizontal: 18 },

  pageTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subText: { color: MUTED, marginBottom: 18 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    ...CARD_SHADOW,
    minWidth: 260,
  },

  rowTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  rowSub: { fontSize: 13, color: MUTED, marginTop: 2 },

  viewBtn: {
    marginTop: 8,
    backgroundColor: '#ECFFF6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewBtnText: { color: '#10B981', fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 20,
    ...CARD_SHADOW,
  },

  recordTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  recordSub: { fontSize: 14, color: MUTED, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  recordText: { fontSize: 13, color: MUTED, marginTop: 2 },

  closeBtn: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '700' },
});
