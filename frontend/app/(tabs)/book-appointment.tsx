import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

const DENTISTS = [
  { id: 'd1', name: 'Dr. Sarah Ahmed', specialty: 'Orthodontist' },
  { id: 'd2', name: 'Dr. John Smith', specialty: 'Pediatric Dentist' },
  { id: 'd3', name: 'Dr. Amira Nabil', specialty: 'Endodontist' },
];

const SERVICES = [
  'Teeth Cleaning',
  'Cavity Filling',
  'Root Canal',
  'Teeth Whitening',
  'Dental Implants',
];

const TIMESLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

export default function BookAppointment() {
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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
        {DENTISTS.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[
              styles.optionBtn,
              selectedDentist === d.id && styles.optionSelected,
            ]}
            onPress={() => setSelectedDentist(d.id)}
          >
            <Text style={styles.optionTitle}>{d.name}</Text>
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
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Confirm Appointment</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  content: { paddingVertical: 26, paddingHorizontal: 18 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 44, height: 44, marginRight: 10 },
  brandText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...CARD_SHADOW,
  },
  iconBtnText: { fontSize: 18 },

  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginTop: 6 },
  subText: { color: MUTED, marginTop: 6, marginBottom: 18 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },

  optionBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  optionSelected: { backgroundColor: PRIMARY },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  optionSub: { color: MUTED, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  timeBtn: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  timeSelected: { backgroundColor: PRIMARY },
  timeText: { color: '#0f172a', fontWeight: '600' },

  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
