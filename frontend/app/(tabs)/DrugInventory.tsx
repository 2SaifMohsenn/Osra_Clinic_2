import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

const INITIAL_DRUGS = [
  { id: 1, name: 'Amoxicillin', dosage: '500mg', price: '$10', stock: 100 },
  { id: 2, name: 'Ibuprofen', dosage: '200mg', price: '$5', stock: 200 },
  { id: 3, name: 'Paracetamol', dosage: '500mg', price: '$8', stock: 150 },
];

export default function DrugInventory() {
  const router = useRouter();
  const [drugs, setDrugs] = useState(INITIAL_DRUGS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', dosage: '', price: '', stock: '' });

  const handleSave = () => {
    if (!form.name || !form.dosage || !form.price || !form.stock) return;

    if (editingId) {
      setDrugs(
        drugs.map((d) =>
          d.id === editingId ? { ...d, ...form, stock: Number(form.stock) } : d
        )
      );
      setEditingId(null);
    } else {
      setDrugs([
        ...drugs,
        { id: Date.now(), ...form, stock: Number(form.stock) },
      ]);
    }

    setForm({ name: '', dosage: '', price: '', stock: '' });
    setShowForm(false);
  };

  const handleEdit = (drug: any) => {
    setForm(drug);
    setEditingId(drug.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDrugs(drugs.filter((d) => d.id !== id));
  };

  const handleUpdateStock = (id: number, change: number) => {
    setDrugs(
      drugs.map((d) =>
        d.id === id ? { ...d, stock: d.stock + change } : d
      )
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Drug Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form ✖' : '➕ Add Drug'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Add/Edit Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              {editingId ? '✏️ Edit Drug' : '➕ Add New Drug'}
            </Text>
            <TextInput
              placeholder="Drug Name"
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              placeholder="Dosage (e.g. 500mg)"
              style={styles.input}
              value={form.dosage}
              onChangeText={(text) => setForm({ ...form, dosage: text })}
            />
            <TextInput
              placeholder="Price (e.g. $10)"
              style={styles.input}
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
            />
            <TextInput
              placeholder="Stock Quantity"
              style={styles.input}
              keyboardType="numeric"
              value={String(form.stock)}
              onChangeText={(text) => setForm({ ...form, stock: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? '💾 Update Drug' : '💾 Save Drug'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Table of Drugs */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Available Drugs</Text>

          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>Drug Name</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Dosage</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Price</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Stock</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {drugs.map((d) => (
            <View key={d.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{d.name}</Text>
              <Text style={styles.tableCell}>{d.dosage}</Text>
              <Text style={styles.tableCell}>{d.price}</Text>
              <Text style={styles.tableCell}>{d.stock}</Text>
              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
                  onPress={() => handleEdit(d)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FCA5A5' }]}
                  onPress={() => handleDelete(d.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                  onPress={() => handleUpdateStock(d.id, +10)}
                >
                  <Text style={styles.actionText}>+10</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FDE68A' }]}
                  onPress={() => handleUpdateStock(d.id, -10)}
                >
                  <Text style={styles.actionText}>-10</Text>
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
