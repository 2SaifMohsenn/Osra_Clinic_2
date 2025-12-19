import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PRIMARY, CARD_SHADOW, BG as CARD_BG } from './theme';

export default function DoctorProfile() {
  const [dentist, setDentist] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ first_name: '', last_name: '', email: '', phone: '', specialty: '' });

  React.useEffect(() => {
    (async () => {
      try {
        const session = (await import('@/src/utils/session')).getUser();
        if (session && session.role === 'dentist') {
          if (session.dentist) {
            setDentist(session.dentist);
            setForm({
              first_name: session.dentist.first_name || '',
              last_name: session.dentist.last_name || '',
              email: session.dentist.email || '',
              phone: session.dentist.phone || '',
              specialty: session.dentist.specialty || '',
            });
          } else if (session.id) {
            const d = await (await import('@/src/api/dentists')).getDentist(session.id);
            setDentist(d);
            setForm({
              first_name: d.first_name || '',
              last_name: d.last_name || '',
              email: d.email || '',
              phone: d.phone || '',
              specialty: d.specialty || '',
            });
          }
        }
      } catch (e) {
        console.log('doctor profile load', e);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      if (dentist && dentist.id) {
        const api = await import('@/src/api/dentists');
        const updated = await api.updateDentist(dentist.id, form);
        const s = (await import('@/src/utils/session'));
        const cur = s.getUser();
        if (cur) {
          cur.dentist = updated;
          s.setUser(cur);
          setDentist(updated);
        }
        alert('Profile saved');
      }
    } catch (e) {
      console.log('save err', e);
      alert('Failed to save');
    }
  };

  // password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loadingPass, setLoadingPass] = React.useState(false);

  const handleChangePassword = async () => {
    if (!dentist || !dentist.id) return alert('No dentist loaded');
    if (!currentPassword || !newPassword || !confirmPassword) return alert('Please fill all password fields');
    if (newPassword !== confirmPassword) return alert('New passwords do not match');

    setLoadingPass(true);
    try {
      const api = await import('@/src/api/dentists');
      await api.changeDentistPassword(dentist.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 18 }}>
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <TextInput style={styles.input} placeholder="First Name" value={form.first_name} onChangeText={(t) => setForm({ ...form, first_name: t })} />
        <TextInput style={styles.input} placeholder="Last Name" value={form.last_name} onChangeText={(t) => setForm({ ...form, last_name: t })} />
        <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />
        <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
        <TextInput style={styles.input} placeholder="Specialty" value={form.specialty} onChangeText={(t) => setForm({ ...form, specialty: t })} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.cardTitle}>Password</Text>
        <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
        <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity style={[styles.saveBtn, loadingPass && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={loadingPass}>
          <Text style={styles.saveBtnText}>{loadingPass ? 'Updating…' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  card: { backgroundColor: CARD_BG, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: { backgroundColor: PRIMARY, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
