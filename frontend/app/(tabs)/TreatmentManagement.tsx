import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';


const INITIAL_TREATMENTS = [
  { id: 1, name: 'Teeth Whitening', category: 'Cosmetic', cost: '$120', description: 'Removes stains for a bright smile.' },
  { id: 2, name: 'Root Canal', category: 'Endodontic', cost: '$300', description: 'Treats infected tooth pulp.' },
  { id: 3, name: 'Braces', category: 'Orthodontic', cost: '$1500', description: 'Aligns and straightens teeth.' },
];

export default function TreatmentManagement() {
  const router = useRouter();
  const [treatments, setTreatments] = useState(INITIAL_TREATMENTS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', category: '', cost: '', description: '' });

  const handleSave = () => {
    if (!form.name || !form.category || !form.cost || !form.description) return;

    if (editingId) {
      setTreatments(
        treatments.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      );
      setEditingId(null);
    } else {
      setTreatments([...treatments, { id: Date.now(), ...form }]);
    }

    setForm({ name: '', category: '', cost: '', description: '' });
    setShowForm(false);
  };

  const handleEdit = (treatment: any) => {
    setForm(treatment);
    setEditingId(treatment.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setTreatments(treatments.filter((t) => t.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Treatment Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form ✖' : '➕ Add Treatment'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Add/Edit Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              {editingId ? '✏️ Edit Treatment' : '➕ Add New Treatment'}
            </Text>
            <TextInput
              placeholder="Treatment Name"
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              placeholder="Category"
              style={styles.input}
              value={form.category}
              onChangeText={(text) => setForm({ ...form, category: text })}
            />
            <TextInput
              placeholder="Cost"
              style={styles.input}
              value={form.cost}
              onChangeText={(text) => setForm({ ...form, cost: text })}
            />
            <TextInput
              placeholder="Description"
              style={[styles.input, { height: 80 }]}
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? '💾 Update Treatment' : '💾 Save Treatment'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Table of Treatments */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Available Treatments</Text>

          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Category</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Cost</Text>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {treatments.map((t) => (
            <View key={t.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{t.name}</Text>
              <Text style={styles.tableCell}>{t.category}</Text>
              <Text style={styles.tableCell}>{t.cost}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                {t.description}
              </Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                  onPress={() => handleEdit(t)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FCA5A5' }]}
                  onPress={() => handleDelete(t.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ----- Styles ----- */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    ...CARD_SHADOW,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  addButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  content: { padding: 20 },
  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  tableCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    ...CARD_SHADOW,
  },
  tableHeader: {
    backgroundColor: '#E0F2FE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tableCell: { flex: 1, color: '#0f172a' },
  headerCell: { fontWeight: '700', color: PRIMARY },
  actionsCell: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#111827' },
});
