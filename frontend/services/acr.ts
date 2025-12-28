import axios from 'axios';
import { Platform } from 'react-native';
import API_BASE from './config';

async function uploadFileToEndpoint(endpoint: string, file: any) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const webFile = file.file || file;
    formData.append('file', webFile);
  } else {
    const fileToUpload = {
      uri: file.uri || file.fileUri,
      name: file.name || file.fileName || 'upload.jpg',
      type: file.mimeType || file.type || file.fileType || 'image/jpeg',
    };
    formData.append('file', fileToUpload as any);
  }

  try {
    const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Processing failed';
    throw new Error(errorMsg);
  }
}

export async function processACR(input: any) {
  // If input is a string, send it as JSON text
  if (typeof input === 'string') {
    try {
      const response = await axios.post(`${API_BASE}/api/process/acr/`, { text: input });
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Processing failed';
      throw new Error(errorMsg);
    }
  }

  // Otherwise, treat as a file upload
  return uploadFileToEndpoint('/api/process/acr/', input);
}

export default processACR;
