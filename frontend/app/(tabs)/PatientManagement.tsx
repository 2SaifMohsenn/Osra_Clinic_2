// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';

// const MUTED = '#64748B';



// // Dummy patient data
// const INITIAL_PATIENTS = [
//   { id: 1, name: 'John Smith', phone: '+1 234 567 890', email: 'john.smith@example.com' },
//   { id: 2, name: 'Emily Johnson', phone: '+1 987 654 321', email: 'emily.johnson@example.com' },
//   { id: 3, name: 'Michael Lee', phone: '+1 555 123 456', email: 'michael.lee@example.com' },
// ];

// export default function PatientManagement() {
//   const router = useRouter();
//   const [patients, setPatients] = useState(INITIAL_PATIENTS);
//   const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '' });
//   const [showForm, setShowForm] = useState(false);

//   const handleAddPatient = () => {
//     if (!newPatient.name || !newPatient.phone || !newPatient.email) return;
//     setPatients([...patients, { id: Date.now(), ...newPatient }]);
//     setNewPatient({ name: '', phone: '', email: '' });
//     setShowForm(false);
//   };

//   const handleDelete = (id: number) => {
//     setPatients(patients.filter((p) => p.id !== id));
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <Text style={styles.pageTitle}>Patients Management</Text>
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => setShowForm(!showForm)}
//         >
//           <Text style={styles.addButtonText}>
//             {showForm ? 'Close Form ✖' : '➕ Add New Patient'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.content}>
//         {showForm && (
//           <View style={styles.formCard}>
//             <Text style={styles.sectionTitle}>Add New Patient</Text>
//             <TextInput
//               placeholder="Full Name"
//               style={styles.input}
//               value={newPatient.name}
//               onChangeText={(text) => setNewPatient({ ...newPatient, name: text })}
//             />
//             <TextInput
//               placeholder="Phone Number"
//               style={styles.input}
//               value={newPatient.phone}
//               onChangeText={(text) => setNewPatient({ ...newPatient, phone: text })}
//             />
//             <TextInput
//               placeholder="Email Address"
//               style={styles.input}
//               value={newPatient.email}
//               onChangeText={(text) => setNewPatient({ ...newPatient, email: text })}
//             />
//             <TouchableOpacity style={styles.saveButton} onPress={handleAddPatient}>
//               <Text style={styles.saveButtonText}>💾 Save Patient</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={styles.tableCard}>
//           <Text style={styles.sectionTitle}>Patients List</Text>

//           {/* Table Header */}
//           <View style={[styles.tableRow, styles.tableHeader]}>
//             <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Name</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Phone</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Email</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
//           </View>

//           {/* Table Rows */}
//           {patients.map((p) => (
//             <View key={p.id} style={styles.tableRow}>
//               <Text style={[styles.tableCell, { flex: 2 }]}>{p.name}</Text>
//               <Text style={styles.tableCell}>{p.phone}</Text>
//               <Text style={styles.tableCell}>{p.email}</Text>
//               <View style={[styles.tableCell, styles.actionsCell]}>
//                 <TouchableOpacity
//                   style={[styles.actionBtn, { backgroundColor: '#BFDBFE' }]}
//                 >
//                   <Text style={styles.actionText}>View</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.actionBtn, { backgroundColor: '#FDE68A' }]}
//                 >
//                   <Text style={styles.actionText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.actionBtn, { backgroundColor: '#FCA5A5' }]}
//                   onPress={() => handleDelete(p.id)}
//                 >
//                   <Text style={styles.actionText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// /* ----- Styles ----- */

// const styles = StyleSheet.create({
//   topBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomColor: '#E5E7EB',
//     borderBottomWidth: 1,
//     ...CARD_SHADOW,
//   },
//   pageTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
//   addButton: {
//     backgroundColor: PRIMARY,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//   },
//   addButtonText: { color: '#fff', fontWeight: '700' },

//   content: { padding: 20 },

//   formCard: {
//     backgroundColor: CARD_BG,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     ...CARD_SHADOW,
//   },
//   sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   saveButton: {
//     backgroundColor: PRIMARY,
//     borderRadius: 10,
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   saveButtonText: { color: '#fff', fontWeight: '700' },

//   tableCard: {
//     backgroundColor: CARD_BG,
//     borderRadius: 12,
//     padding: 16,
//     ...CARD_SHADOW,
//   },
//   tableHeader: {
//     backgroundColor: '#E0F2FE',
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderBottomColor: '#E5E7EB',
//     borderBottomWidth: 1,
//     paddingVertical: 10,
//   },
//   tableCell: { flex: 1, color: '#0f172a' },
//   headerCell: { fontWeight: '700', color: PRIMARY },
//   actionsCell: { flexDirection: 'row', gap: 6 },
//   actionBtn: {
//     borderRadius: 6,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   actionText: { fontSize: 13, fontWeight: '700', color: '#111827' },
// });
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from "./theme";

// Simple local API helpers — replace API_BASE with your backend URL if needed
const API_BASE = "http://localhost:8000/api";

async function getPatients(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/patients/`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

async function createPatient(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/patients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create patient");
  return res.json();
}

async function deletePatient(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/patients/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete patient");
  return;
}

const MUTED = "#64748B";

export default function PatientManagement() {
  const router = useRouter();

  // Patients loaded from backend
  const [patients, setPatients] = useState<any[]>([]);

  // New patient form state (matches Django model)
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const [showForm, setShowForm] = useState(false);

  // Load patients when screen opens
  useEffect(() => {
    loadPatients();
  }, []);

  // Fetch patients from backend
  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.log("Error loading patients", error);
    }
  };

  // Add patient to backend
  const handleAddPatient = async () => {
    if (
      !newPatient.first_name ||
      !newPatient.last_name ||
      !newPatient.phone ||
      !newPatient.email
    )
      return;

    try {
      await createPatient(newPatient);
      setNewPatient({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
      });
      setShowForm(false);
      loadPatients();
    } catch (error) {
      console.log("Error adding patient", error);
    }
  };

  // Delete patient from backend
  const handleDelete = async (id: number) => {
    try {
      await deletePatient(id);
      loadPatients();
    } catch (error) {
      console.log("Error deleting patient", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Patients Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? "Close Form ✖" : "➕ Add New Patient"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Add Patient Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add New Patient</Text>

            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={newPatient.first_name}
              onChangeText={(text) =>
                setNewPatient({ ...newPatient, first_name: text })
              }
            />

            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={newPatient.last_name}
              onChangeText={(text) =>
                setNewPatient({ ...newPatient, last_name: text })
              }
            />

            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              value={newPatient.phone}
              onChangeText={(text) =>
                setNewPatient({ ...newPatient, phone: text })
              }
            />

            <TextInput
              placeholder="Email Address"
              style={styles.input}
              value={newPatient.email}
              onChangeText={(text) =>
                setNewPatient({ ...newPatient, email: text })
              }
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddPatient}>
              <Text style={styles.saveButtonText}>💾 Save Patient</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Patients Table */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Patients List</Text>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>
              Name
            </Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Phone</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Email</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {patients.map((p) => (
            <View key={p.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {p.first_name} {p.last_name}
              </Text>
              <Text style={styles.tableCell}>{p.phone}</Text>
              <Text style={styles.tableCell}>{p.email}</Text>

              <View style={[styles.tableCell, styles.actionsCell]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#FCA5A5" }]}
                  onPress={() => handleDelete(p.id)}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    ...CARD_SHADOW,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  addButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },

  content: { padding: 20 },

  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },

  tableCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    ...CARD_SHADOW,
  },
  tableHeader: {
    backgroundColor: "#E0F2FE",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tableCell: { flex: 1, color: "#0f172a" },
  headerCell: { fontWeight: "700", color: PRIMARY },
  actionsCell: { flexDirection: "row", gap: 6 },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 13, fontWeight: "700", color: "#111827" },
});
