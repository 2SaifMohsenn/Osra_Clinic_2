import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, MUTED, PRIMARY } from './PatientDashboard'; // Reuse constants

type RecordItem = {
  id: string;
  date: string;
  dentist: string;
  diagnosis: string;
  treatmentNotes: string;
  drugs: { name: string; dosage: string }[];
  followUpDate: string;
};

const RECORDS: RecordItem[] = [
  {
    id: 'r1',
    date: 'Oct 15, 2023',
    dentist: 'Dr. Smith',
    diagnosis: 'Cavity in molar',
    treatmentNotes: 'Filled cavity using composite material.',
    drugs: [{ name: 'Painkiller', dosage: '2x per day' }],
    followUpDate: '2023-11-01',
  },
  {
    id: 'r2',
    date: 'Jul 22, 2023',
    dentist: 'Dr. Jones',
    diagnosis: 'Routine Check-up',
    treatmentNotes: 'Teeth cleaned and fluoride applied.',
    drugs: [],
    followUpDate: '2023-08-01',
  },
];

export default function MyPrescription() {
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>My Prescriptions</Text>
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
      <Modal visible={!!selectedRecord} animationType="slide" transparent={false}>
        <View style={styles.modalContent}>
          {selectedRecord && (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Top-right X button */}
              <TouchableOpacity
                style={styles.closeXBtn}
                onPress={() => setSelectedRecord(null)}
              >
                <Text style={styles.closeXText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.recordTitle}>Date: {selectedRecord.date}</Text>
              <Text style={styles.recordSub}>Dentist: {selectedRecord.dentist}</Text>

              <Text style={styles.sectionTitle}>Diagnosis</Text>
              <Text style={styles.recordText}>{selectedRecord.diagnosis}</Text>

              <Text style={styles.sectionTitle}>Treatment Notes</Text>
              <Text style={styles.recordText}>{selectedRecord.treatmentNotes}</Text>

              <Text style={styles.sectionTitle}>Prescribed Drugs</Text>
              {selectedRecord.drugs.length > 0 ? (
                selectedRecord.drugs.map((drug, index) => (
                  <Text key={index} style={styles.recordText}>
                    {drug.name} - {drug.dosage}
                  </Text>
                ))
              ) : (
                <Text style={styles.recordText}>None</Text>
              )}

              <Text style={styles.sectionTitle}>Follow-up Date</Text>
              <Text style={styles.recordText}>{selectedRecord.followUpDate}</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedRecord(null)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ----- Mini components ----- */

function RecordRow({ item, onPress }: { item: RecordItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.card, { flexDirection: 'column', padding: 16 }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.rowTitle}>{item.date}</Text>
        <Text style={styles.rowSub}>{item.dentist}</Text>
      </View>
      <Text style={styles.rowSub}>Diagnosis: {item.diagnosis}</Text>
      <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
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
  modalContent: {
    flex: 1,
    backgroundColor: CARD_BG,
  },

  closeXBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#E5E7EB',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeXText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
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
