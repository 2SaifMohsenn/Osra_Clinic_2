import api from '@/src/api/api';

/**
 * Service to interact with the Disease Ontology Proxy.
 */
export const searchDiseases = async (query: string) => {
    if (!query || query.length < 2) return [];
    try {
        const response = await api.get('/process/disease-search/', {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        console.error("[DiseaseSearchService] Error fetching diseases:", error);
        throw error;
    }
};
