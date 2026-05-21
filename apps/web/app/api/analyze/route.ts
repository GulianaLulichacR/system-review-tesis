// apps/web/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// URL de tu webhook en n8n Cloud
const N8N_WEBHOOK_URL = 'https://tara047.app.n8n.cloud/webhook/v1/thesis/analyze';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. Obtener datos del frontend
    const file = formData.get('file') as File;
    const advanceId = formData.get('advanceId') as string;
    const programId = formData.get('programId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 });
    }

    // 2. Preparar datos para enviar a n8n
    // n8n espera 'multipart/form-data' para que el nodo 'Extract Text' funcione
    const n8nFormData = new FormData();
    n8nFormData.append('file', file);
    n8nFormData.append('advanceId', advanceId);
    n8nFormData.append('programId', programId);

    // 3. Llamar a n8n
    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, n8nFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 4. Devolver respuesta al frontend
    return NextResponse.json(n8nResponse.data);

  } catch (error: any) {
    console.error('Error en el backend:', error.message);
    return NextResponse.json(
      { error: 'Error al procesar el documento', details: error.message },
      { status: 500 }
    );
  }
}