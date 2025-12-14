import { Platform } from 'react-native';

// On Android emulators, use 10.0.2.2 to reach localhost on the host machine
const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default API_BASE;
