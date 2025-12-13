import API_BASE from './config';

export async function processNLP(text: string) {
  const res = await fetch(`${API_BASE}/api/process/nlp/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'NLP processing failed');
  return json;
}

export default processNLP;
