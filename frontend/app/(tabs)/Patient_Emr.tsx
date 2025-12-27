import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { getUser } from "../../src/utils/session";
import { getPatient } from "../../src/api/patients";
import { getMedicalRecords } from "../../src/api/medicalRecords";

const PatientEmr = () => {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [latestRecord, setLatestRecord] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = getUser();
        if (user && user.role === 'patient') {
          const patientId = user.id;

          // Fetch full patient data (for chronic history and DOB)
          const p = await getPatient(patientId);
          setPatientData(p);

          // Fetch latest medical record
          const records = await getMedicalRecords({ patient: patientId });
          if (records && records.length > 0) {
            setLatestRecord(records[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching EMR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2E8BC0" />
      </View>
    );
  }

  if (!patientData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No patient data found. Please log in.</Text>
      </View>
    );
  }

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <Section title="Profile">
        <Info label="Name" value={`${patientData.first_name} ${patientData.last_name}`} />
        <Info label="Age" value={calculateAge(patientData.date_of_birth)} />
        <Info label="Gender" value={patientData.gender} />
        <Info label="Phone" value={patientData.phone} />
      </Section>

      {/* Medical History (Chronic) */}
      <Section title="Chronic Medical History">
        <Info label="Diseases" value={patientData.diseases || "None"} />
        <Info label="Allergies" value={patientData.allergies || "None"} />
        <Info label="Medications" value={patientData.medications || "None"} />
      </Section>

      {/* Latest Visit Details */}
      {latestRecord ? (
        <>
          <Section title="Latest Diagnosis & Notes">
            <Info label="Date" value={new Date(latestRecord.record_date).toLocaleDateString()} />
            <Info label="Diagnosis" value={latestRecord.diagnosis} />
            <Info label="Clinical Notes" value={latestRecord.treatment_notes} />
          </Section>

          <Section title="Dental & Treatment">
            <Info label="Dental Issues" value={latestRecord.dental_issues || "None reported"} />
            <Info label="Treatment Plan" value={latestRecord.treatment_plan || "None specified"} />
          </Section>

          <Section title="Prescriptions">
            <Info label="Prescribed Drugs" value={latestRecord.prescribed_drugs || "None"} />
          </Section>
        </>
      ) : (
        <Section title="Visit History">
          <Text style={styles.noData}>No recent medical records found.</Text>
        </Section>
      )}
    </ScrollView>
  );
};

// Reusable Components
const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Info = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default PatientEmr;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8BC0",
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  noData: {
    color: "#666",
    fontStyle: "italic",
  },
});
