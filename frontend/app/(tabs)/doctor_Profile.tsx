// doctor_Profile.tsx (Doctor Profile)
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

// Palette (Unified Soft Medical)
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#F1F5F9';

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

  const initials = dentist ? `${(dentist.first_name || '').charAt(0)}${(dentist.last_name || '').charAt(0)}`.toUpperCase() : 'DR';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Identity Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>Dr. {form.first_name} {form.last_name}</Text>
        <Text style={styles.userRole}>{form.specialty || 'General Dentist'}</Text>
      </View>

      {/* Clinical Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Professional Details</Text>
          <View style={styles.cardIconBox}><Text style={{ fontSize: 16 }}>🩺</Text></View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput style={styles.input} value={form.first_name} onChangeText={(t) => setForm({ ...form, first_name: t })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput style={styles.input} value={form.last_name} onChangeText={(t) => setForm({ ...form, last_name: t })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Specialty / Title</Text>
          <TextInput style={styles.input} value={form.specialty} onChangeText={(t) => setForm({ ...form, specialty: t })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Work Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Update Portal Identity</Text>
        </TouchableOpacity>
      </View>

      {/* Password Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Security & Access</Text>
          <View style={[styles.cardIconBox, { backgroundColor: '#FFF7ED' }]}><Text style={{ fontSize: 16 }}>🔐</Text></View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <TouchableOpacity style={[styles.passwordBtn, loadingPass && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={loadingPass}>
          <Text style={styles.passwordBtnText}>{loadingPass ? 'UPDATING...' : 'CHANGE PASSWORD'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLOR_PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLOR_TEXT,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLOR_CARD,
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 54,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLOR_TEXT,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: COLOR_PRIMARY,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLOR_PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  passwordBtn: {
    backgroundColor: '#2E8BC0',
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordBtnText: {
    color: '#ffffffff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
});
