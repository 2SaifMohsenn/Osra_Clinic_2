import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { getDentists } from '@/src/api/dentists';
import { createAppointment } from '@/src/api/appointments';
import { getUser } from '@/src/utils/session';

const logo = require('@/assets/images/logo_osra.png');
const PRIMARY = '#0EA5E9';
const BG = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const MUTED = '#6B7280';
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};
const WINDOW_WIDTH = Dimensions.get('window').width;

const SERVICES = [
  'Teeth Cleaning',
  'Cavity Filling',
  'Root Canal',
  'Teeth Whitening',
  'Dental Implants',
];

function to24Hour(timeStr: string) {
  // e.g. "9:00 AM" => "09:00"
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return timeStr;
  let h = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${mm}`;
}

const TIMESLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

export default function BookAppointment({ navigation }: any) {
  const [dentists, setDentists] = useState<any[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const list = await getDentists();
        setDentists(list);
      } catch (e) {
        console.log('failed to load dentists', e);
      }
    })();
  }, []);

  const handleConfirm = async () => {
    if (!selectedDentist) return alert('Please select a dentist');
    if (!selectedService) return alert('Please select a service');
    if (!selectedDate) return alert('Please enter a date (YYYY-MM-DD)');
    if (!selectedTime) return alert('Please select a time');

    const session = getUser();
    if (!session || session.role !== 'patient') return alert('You must be logged in as a patient');

    const patientId = session.id;
    const appointment_time = to24Hour(selectedTime!);

    setLoading(true);
    try {
      await createAppointment({
        patient: patientId,
        dentist: selectedDentist,
        appointment_date: selectedDate,
        appointment_time,
        status: 'upcoming',
        notes: selectedService,
      });

      alert('Appointment created');
      // go to my appointments
      router.push('/my-appointment');
    } catch (e) {
      console.log('create appointment err', e);
      alert('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.brand}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.brandText}>Osra Clinic</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>📅</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.subText}>Schedule a new visit with our trusted dentists.</Text>

      {/* Dentist Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Dentist</Text>
        {dentists.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[
              styles.optionBtn,
              selectedDentist === d.id && styles.optionSelected,
            ]}
            onPress={() => setSelectedDentist(d.id)}
          >
            <Text style={styles.optionTitle}>{`Dr. ${d.first_name} ${d.last_name}`}</Text>
            <Text style={styles.optionSub}>{d.specialty}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Service Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Service / Treatment</Text>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.optionBtn,
              selectedService === s && styles.optionSelected,
            ]}
            onPress={() => setSelectedService(s)}
          >
            <Text style={styles.optionTitle}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date and Time */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Choose Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Select Time</Text>
        <View style={styles.timeGrid}>
          {TIMESLOTS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.timeBtn,
                selectedTime === t && styles.timeSelected,
              ]}
              onPress={() => setSelectedTime(t)}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === t && { color: '#fff' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleConfirm} disabled={loading}>
        <Text style={styles.primaryBtnText}>{loading ? 'Booking…' : 'Confirm Appointment'}</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingVertical: 40, paddingHorizontal: 20 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, marginRight: 12 },
  brandText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20 },

  title: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 8, letterSpacing: -0.5 },
  subText: { fontSize: 16, color: '#64748B', marginBottom: 32, lineHeight: 24 },

  card: {
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },

  optionBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: PRIMARY,
  },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  optionSub: { color: '#64748B', fontSize: 14, marginTop: 2 },

  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    fontSize: 16,
    color: '#1E293B',
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  timeBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  timeText: { color: '#64748B', fontWeight: '600', fontSize: 14 },

  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
