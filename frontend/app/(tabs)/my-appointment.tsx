import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';
import { Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
const MUTED = '#64748B';
import { Alert, ActivityIndicator } from 'react-native';
import { getAppointments, updateAppointment, deleteAppointment } from '@/src/api/appointments';

type Appointment = {
  id: string;
  date: string;
  dentist: string;
  treatment: string;
  status: 'upcoming' | 'completed' | 'canceled';
};

export default function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const session = (await import('@/src/utils/session')).getUser();
      if (!session || session.role !== 'patient') return;

      const pId = session.patient?.id || session.id;
      const all = await getAppointments({ patient: pId });

      // Dentist names are now handled by the enhanced Serializer (dentist_name)
      setAppointments(all);
    } catch (e) {
      console.log('load my appointments', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id: number | string) => {
    console.log("[MyAppointment] handleCancel triggered for ID:", id);
    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to permanently delete this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          onPress: async () => {
            try {
              console.log("[MyAppointment] Proceeding with deletion for ID:", id);
              await deleteAppointment(Number(id));
              console.log("[MyAppointment] Deletion successful");
              Alert.alert("Success", "Appointment removed");
              loadData();
            } catch (e: any) {
              console.error("[MyAppointment] Deletion error:", e?.response?.data || e.message);
              Alert.alert("Error", "Could not remove appointment. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 18 }}>
      <Text style={styles.pageTitle}>My Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color={'#2E8BC0'} style={{ marginTop: 50 }} />
      ) : appointments.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={appointments}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <AppointmentRow
              item={item}
              onCancel={() => handleCancel(item.id)}
              onView={() => handleViewDetails(item)}
              onReschedule={() => router.push({ pathname: '/book-appointment', params: { rescheduleId: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>📅</Text>
          <Text style={styles.emptyText}>You don't have any appointments scheduled yet.</Text>
          <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push('/book-appointment')}>
            <Text style={styles.bookNowText}>Book Your First Session</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 100 }} />

      {/* Modern Details Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Insights</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close-circle" size={30} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.modalBody}>
                <DetailRow label="Procedure" value={selectedItem.notes || 'Dental Session'} icon="medical-outline" />
                <DetailRow label="Dentist" value={selectedItem.dentist_name || '—'} icon="person-outline" />
                <DetailRow label="Date" value={selectedItem.appointment_date} icon="calendar-outline" />
                <DetailRow label="Time" value={selectedItem.appointment_time} icon="time-outline" />
                <DetailRow label="Status" value={selectedItem.status} icon="checkbox-outline" isStatus />

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function AppointmentRow({
  item,
  onCancel,
  onView,
  onReschedule
}: {
  item: any,
  onCancel: () => void,
  onView: () => void,
  onReschedule: () => void
}) {
  const dentistName = item.dentist_name || '—';
  const isCanceled = item.status?.toLowerCase() === 'canceled';

  return (
    <View style={[styles.card, CARD_SHADOW, isCanceled && { opacity: 0.6 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.rowTitle}>{item.notes || 'Dental Session'}</Text>
        <View style={[styles.statusTag, { backgroundColor: isCanceled ? '#FEE2E2' : '#EFF6FF' }]}>
          <Text style={[styles.statusTagText, { color: isCanceled ? '#B91C1C' : '#1D4ED8' }]}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.rowSub}>Date: {item.appointment_date}</Text>
      <Text style={styles.rowSub}>Time: {item.appointment_time}</Text>
      <Text style={styles.rowSub}>Dentist: {dentistName}</Text>

      {!isCanceled && (
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
          <TouchableOpacity style={styles.rescheduleBtn} onPress={onReschedule}>
            <Text style={styles.buttonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewBtn} onPress={onView}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {isCanceled && (
        <TouchableOpacity style={[styles.viewBtn, { alignSelf: 'flex-start', marginTop: 12 }]} onPress={onView}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DetailRow({ label, value, icon, isStatus }: { label: string, value: string, icon: any, isStatus?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconBox}>
        <Ionicons name={icon} size={20} color="#2E8BC0" />
      </View>
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isStatus && { textTransform: 'capitalize', color: value.toLowerCase() === 'completed' ? '#059669' : '#2E8BC0' }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rowTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  rowSub: { fontSize: 14, color: MUTED, marginTop: 4, fontWeight: '500' },
  rescheduleBtn: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  cancelBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  viewBtn: { backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  buttonText: { fontWeight: '700', color: '#1e293b', fontSize: 13 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', color: MUTED, fontSize: 16, fontWeight: '500', lineHeight: 24 },
  bookNowBtn: { backgroundColor: '#2E8BC0', marginTop: 24, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  bookNowText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  /* Modal Styles */
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 30, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  modalBody: { gap: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  detailIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 1 },
  closeBtn: { backgroundColor: '#1e293b', height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});


