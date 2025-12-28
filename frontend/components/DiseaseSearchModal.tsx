import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { searchDiseases } from '../services/diseaseSearch';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DiseaseSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (diseaseName: string, doid: string) => void;
}

const DiseaseCard = ({ item, onSelect }: { item: any; onSelect: (name: string, id: string) => void }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={toggleExpand}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.diseaseTitle}>{item.lbl}</Text>
                    <Text style={styles.doidText}>{item.doid}</Text>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748B"
                />
            </View>

            <Text style={styles.definitionSnippet} numberOfLines={expanded ? undefined : 2}>
                {item.def || "No definition available."}
            </Text>

            {expanded && (
                <View style={styles.expandedContent}>
                    {item.synonyms && item.synonyms.length > 0 && (
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Synonyms</Text>
                            <View style={styles.tagContainer}>
                                {item.synonyms.map((s: string, idx: number) => (
                                    <View key={idx} style={styles.tag}>
                                        <Text style={styles.tagText}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {item.xrefs && item.xrefs.length > 0 && (
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>External References</Text>
                            <Text style={styles.xrefText}>
                                {item.xrefs.map((x: any) => `${x.id}`).join(', ')}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => onSelect(item.lbl, item.doid)}
                    >
                        <Ionicons name="copy-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.copyBtnText}>Copy to EMR</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

export const DiseaseSearchModal: React.FC<DiseaseSearchModalProps> = ({ visible, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const data = await searchDiseases(query);
                    setResults(data);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Disease Ontology</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#0F172A" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search diseases (e.g. diabetes)..."
                            value={query}
                            onChangeText={setQuery}
                            placeholderTextColor="#94A3B8"
                            autoFocus
                        />
                        {loading && <ActivityIndicator size="small" color="#2E8BC0" />}
                    </View>

                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => item.doid || index.toString()}
                        renderItem={({ item }) => (
                            <DiseaseCard item={item} onSelect={(name, id) => {
                                onSelect(name, id);
                                onClose();
                            }} />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={() => (
                            !loading && query.length >= 2 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No matching diseases found.</Text>
                                </View>
                            ) : null
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        height: '85%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    diseaseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        flex: 1,
    },
    doidText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#3B82F6',
        marginTop: 2,
    },
    definitionSnippet: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    detailSection: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '600',
    },
    xrefText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
        lineHeight: 18,
    },
    copyBtn: {
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    copyBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '500',
    },
});
