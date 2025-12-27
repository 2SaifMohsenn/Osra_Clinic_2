import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert
} from 'react-native';
import { getUser } from '@/src/utils/session';
import api from '@/src/api/api';

const { width } = Dimensions.get('window');

// Theme Constants
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#F1F5F9';

export default function AdminProfile() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const u = getUser();
        if (u && u.role === 'admin') {
            setAdmin(u);
        } else {
            router.replace('/login');
        }
        setLoading(false);
    }, []);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        setUpdating(true);
        try {
            const response = await api.post(`/admins/${admin.id}/change_password/`, {
                current_password: currentPassword,
                new_password: newPassword
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert(response.data?.message || 'Failed to update password');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Network error. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !admin) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR_PRIMARY} />
            </View>
        );
    }

    const initials = admin.firstName ? admin.firstName.substring(0, 2).toUpperCase() : 'AD';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </View>
                    <Text style={styles.adminName}>{admin.firstName || 'Administrator'}</Text>
                    <Text style={styles.adminRole}>System Superuser</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{admin.email || 'admin@osra.com'}</Text>
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Security & Password</Text>
                    <Text style={styles.sectionSub}>Update your administrative credentials</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="••••••••"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="••••••••"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.updateButton, updating && { opacity: 0.7 }]}
                        onPress={handleChangePassword}
                        disabled={updating}
                    >
                        {updating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* View Logs / System Info */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Administrative Access</Text>
                    <View style={styles.accessRow}>
                        <Text style={styles.accessLabel}>Full System Control</Text>
                        <Text style={styles.statusActive}>Active</Text>
                    </View>
                    <View style={styles.accessRow}>
                        <Text style={styles.accessLabel}>Database Management</Text>
                        <Text style={styles.statusActive}>Enabled</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => router.replace('/login')}
                >
                    <Text style={styles.logoutButtonText}>Sign Out Securely</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLOR_BORDER,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 20,
        color: COLOR_TEXT,
        fontWeight: '700',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLOR_TEXT,
    },
    scrollContent: {
        padding: 24,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#64748B',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
        borderWidth: 1,
        borderColor: COLOR_BORDER,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 35,
        backgroundColor: COLOR_TEXT,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLOR_TEXT,
        shadowOpacity: 0.2,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
    },
    adminName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLOR_TEXT,
        marginBottom: 4,
    },
    adminRole: {
        fontSize: 14,
        color: COLOR_PRIMARY,
        fontWeight: '700',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 24,
    },
    infoRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    infoLabel: {
        color: COLOR_SUBTEXT,
        fontWeight: '600',
    },
    infoValue: {
        color: COLOR_TEXT,
        fontWeight: '700',
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLOR_BORDER,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLOR_TEXT,
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 13,
        color: COLOR_SUBTEXT,
        fontWeight: '600',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLOR_TEXT,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 52,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: COLOR_TEXT,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    updateButton: {
        backgroundColor: COLOR_PRIMARY,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: COLOR_PRIMARY,
        shadowOpacity: 0.25,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    accessRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    accessLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_TEXT,
    },
    statusActive: {
        fontSize: 12,
        fontWeight: '800',
        color: '#10B981',
    },
    logoutButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    }
});
