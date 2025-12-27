import axios from 'axios';
import { Platform } from 'react-native';
import API_BASE from './config';

async function uploadFileToEndpoint(endpoint: string, file: any) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, Expo DocumentPicker assets usually have 'file' for the File object
    const webFile = file.file || file;
    formData.append('file', webFile);
  } else {
    // React Native FormData file object format for Native
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

export async function processOCR(file: any) {
  return uploadFileToEndpoint('/api/process/ocr/', file);
}

export default processOCR;
