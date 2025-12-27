// AppointmentManagement.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { getAppointments, deleteAppointment, updateAppointment } from '@/src/api/appointments';
import { getPatients } from '@/src/api/patients';
import { getDentists } from '@/src/api/dentists';
import { Image } from 'expo-image';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

// Theme Constants
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#F1F5F9';

export default function AppointmentManagement() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientMap, setPatientMap] = useState<Record<number, string>>({});
  const [dentistMap, setDentistMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const [allAppts, patients, dentists] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDentists(),
      ]);

      // Create maps for quick lookup
      const pMap: Record<number, string> = {};
      patients.forEach((p: any) => pMap[p.id] = `${p.first_name} ${p.last_name}`);

      const dMap: Record<number, string> = {};
      dentists.forEach((d: any) => dMap[d.id] = `Dr. ${d.last_name}`);

      setPatientMap(pMap);
      setDentistMap(dMap);
      setAppointments(allAppts);
    } catch (err) {
      console.log('Global Appointment Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await deleteAppointment(id);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'upcoming': return '#3B82F6';
      case 'completed': return '#6366F1';
      case 'cancelled': return '#EF4444';
      default: return COLOR_SUBTEXT;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
        <Text style={styles.loadingText}>Loading Global Schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Global Schedule</Text>
          <Text style={styles.headerSub}>Master Log • All Doctors & Patients</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchGlobalData}
        >
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No appointments found in the system.</Text>
          </View>
        ) : (
          appointments.map((a) => (
            <View key={a.id} style={styles.appointmentCard}>
              {/* Status Ribbon */}
              <View style={[styles.statusRibbon, { backgroundColor: getStatusColor(a.status) }]} />

              <View style={styles.cardMain}>
                <View style={styles.cardHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patientMap[a.patient] || 'Unknown Patient'}</Text>
                    <Text style={styles.serviceText}>{a.notes || 'General Checkup'}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: getStatusColor(a.status) }]}>
                      {(a.status || 'Scheduled').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ASSIGNED DOCTOR</Text>
                    <Text style={styles.detailValue}>{dentistMap[a.dentist] || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>DATE & TIME</Text>
                    <Text style={styles.detailValue}>{a.appointment_date} • {a.appointment_time || 'TBD'}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => alert('Editing restricted to management flow.')}
                  >
                    <Text style={styles.editBtnText}>Manage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => handleDelete(a.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_BG,
  },
  loadingText: {
    marginTop: 12,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
    marginTop: 2,
  },
  refreshBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  scrollContent: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: COLOR_CARD,
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  statusRibbon: {
    width: 6,
    height: '100%',
  },
  cardMain: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 13,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  detailGrid: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLOR_SUBTEXT,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLOR_TEXT,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
  },
  editBtnText: {
    color: COLOR_TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: COLOR_SUBTEXT,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
