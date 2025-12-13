import API_BASE from './config';

async function uploadFileToEndpoint(endpoint: string, file: { fileUri: string; fileName: string; fileType: string }) {
  const { fileUri, fileName, fileType } = file;
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName || 'file',
    type: fileType || 'application/octet-stream',
  } as any);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Processing failed');
  return json;
}

export async function processACR(file: { fileUri: string; fileName: string; fileType: string }) {
  return uploadFileToEndpoint('/api/process/acr/', file);
}

export default processACR;
