import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing
} from 'react-native-reanimated';

interface VoiceDictationModalProps {
    visible: boolean;
    onClose: () => void;
    onTranscriptionComplete: (text: string) => void;
}

const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
    visible,
    onClose,
    onTranscriptionComplete,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [language, setLanguage] = useState<'en-US' | 'ar-SA'>('en-US');
    const [error, setError] = useState<string | null>(null);

    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        if (isListening) {
            pulseAnim.value = withRepeat(
                withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        } else {
            pulseAnim.value = withTiming(1);
        }
    }, [isListening]);

    const animatedMicStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
        opacity: isListening ? 1 : 0.8,
    }));

    // Speech Recognition Logic (Web only)
    const startListening = useCallback(() => {
        if (Platform.OS !== 'web') {
            alert('Speech recognition is only supported on Web in this demo.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support Speech Recognition.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => setError(event.error);

        recognition.onresult = (event: any) => {
            let currentTranscription = '';
            for (let i = 0; i < event.results.length; i++) {
                currentTranscription += event.results[i][0].transcript;
            }
            setTranscription(currentTranscription);
        };

        (window as any).recognitionInstance = recognition;
        recognition.start();
    }, [language]);

    const stopListening = useCallback(() => {
        const recognition = (window as any).recognitionInstance;
        if (recognition) {
            recognition.stop();
        }
        setIsListening(false);
    }, []);

    const handleFinish = () => {
        stopListening();
        onTranscriptionComplete(transcription);
        onClose();
        setTranscription('');
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {Platform.OS === 'ios' || Platform.OS === 'web' ? (
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
                ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                )}

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <Ionicons name="ear-outline" size={24} color="#6366F1" />
                            <Text style={styles.headerTitle}>Voice Prescription Dictation</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Language Selector */}
                    <View style={styles.langSection}>
                        <Text style={styles.label}>Language:</Text>
                        <View style={styles.langRow}>
                            <TouchableOpacity
                                style={[styles.langBtn, language === 'en-US' && styles.langBtnActive]}
                                onPress={() => setLanguage('en-US')}
                            >
                                <Text style={[styles.langText, language === 'en-US' && styles.langTextActive]}>GB English (UK)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.langBtn, language === 'ar-SA' && styles.langBtnActive]}
                                onPress={() => setLanguage('ar-SA')}
                            >
                                <Text style={[styles.langText, language === 'ar-SA' && styles.langTextActive]}>SA Arabic</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Mic Section */}
                    <View style={styles.micSection}>
                        <Animated.View style={[styles.micOuter, animatedMicStyle]}>
                            <TouchableOpacity
                                style={[styles.micBtn, isListening && styles.micBtnListening]}
                                onPress={isListening ? stopListening : startListening}
                            >
                                <Ionicons name={isListening ? "mic" : "mic-outline"} size={40} color="#fff" />
                            </TouchableOpacity>
                        </Animated.View>
                        <Text style={styles.statusText}>
                            {isListening ? 'Listening...' : 'Ready to dictate prescription'}
                        </Text>
                        <Text style={styles.subStatusText}>
                            {isListening ? 'Speak now, results update in real-time' : 'Press the button below to start speaking'}
                        </Text>
                    </View>

                    {/* Transcription Area */}
                    <View style={styles.transcriptionSection}>
                        <Text style={styles.label}>Transcription</Text>
                        <View style={styles.transcriptionBox}>
                            <ScrollView>
                                {transcription ? (
                                    <Text style={styles.transcriptionText}>{transcription}</Text>
                                ) : (
                                    <View style={styles.emptyTranscription}>
                                        <Ionicons name="text-outline" size={32} color="#CBD5E1" />
                                        <Text style={styles.placeholderText}>Your transcribed prescription will appear here</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.actionBtn, transcription ? styles.actionBtnActive : styles.actionBtnDisabled]}
                            onPress={handleFinish}
                            disabled={!transcription}
                        >
                            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnText}>Process Dictation</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 600,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginLeft: 10,
    },
    closeBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    langSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 10,
    },
    langRow: {
        flexDirection: 'row',
        gap: 12,
    },
    langBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
    },
    langBtnActive: {
        backgroundColor: '#F1F5F9',
        borderColor: '#6366F1',
    },
    langText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    langTextActive: {
        color: '#6366F1',
    },
    micSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    micOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    micBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    micBtnListening: {
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    subStatusText: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
    },
    transcriptionSection: {
        marginBottom: 24,
    },
    transcriptionBox: {
        height: 120,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    transcriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#334155',
    },
    emptyTranscription: {
        flex: 1,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
        textAlign: 'center',
    },
    footer: {
        marginTop: 10,
    },
    actionBtn: {
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    actionBtnActive: {
        backgroundColor: '#4e91fc',
        shadowColor: '#6366F1',
    },
    actionBtnDisabled: {
        backgroundColor: '#CBD5E1',
        shadowColor: 'transparent',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default VoiceDictationModal;
