// apps/web/lib/n8n-client.ts
import axios from 'axios';

const N8N_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export const triggerAnalysis = async (documentId: string) => {
  // Llama al webhook de n8n para iniciar el proceso IA
  return axios.post(`${N8N_URL}/webhook/analyze`, { documentId });
};