// apps/web/app/upload/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thesis-review/ui/components/card';
import { Button } from '@thesis-review/ui/components/button';
import { Progress } from '@thesis-review/ui/components/progress';
import { Badge } from '@thesis-review/ui/components/badge';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Brain,
  ArrowRight
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  aiScore?: number;
  error?: string;
}

const ANALYSIS_STEPS = [
  { id: 'upload', title: 'Carga Word/PDF', description: 'Subir documento al sistema' },
  { id: 'extract', title: 'Extracción de texto', description: 'Procesar contenido del documento' },
  { id: 'structure', title: 'Análisis estructural', description: 'Identificar secciones y formato' },
  { id: 'content', title: 'Análisis de contenido', description: 'Evaluar calidad académica' },
  { id: 'feedback', title: 'Generación de feedback', description: 'Crear retroalimentación accionable' },
  { id: 'score', title: 'Calificación automática', description: 'Asignar puntuación' },
];

export default function UploadPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Iniciar carga automática
    newFiles.forEach(file => uploadFile(file, acceptedFiles.find(f => f.name === file.name)!));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const uploadFile = async (fileState: UploadedFile, file: File) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileState.id ? { ...f, status: 'uploading' } : f
      ));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'ADVANCE');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const result = await response.json();
      
      setFiles(prev => prev.map(f => 
        f.id === fileState.id ? { 
          ...f, 
          status: 'processing',
          progress: 50,
        } : f
      ));

      // Simular progreso de análisis IA
      simulateAIProcessing(fileState.id, result.documentId);

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileState.id ? { 
          ...f, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
        } : f
      ));
    }
  };

  const simulateAIProcessing = async (fileId: string, documentId: string) => {
    setIsProcessing(true);
    
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentStep(i);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          progress: 50 + ((i + 1) / ANALYSIS_STEPS.length) * 50,
        } : f
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Obtener resultado del análisis
    try {
      const response = await fetch(`/api/documents/${documentId}/analysis`);
      const analysis = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed',
          progress: 100,
          aiScore: analysis.overallScore,
        } : f
      ));
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cargar nuevo avance</h1>
        <p className="text-muted-foreground">
          Sube tu documento para análisis automático con IA
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir documento
            </CardTitle>
            <CardDescription>
              Formatos soportados: Word (.docx, .doc) y PDF (.pdf) hasta 50MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Suelta los archivos aquí...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Arrastra y suelta archivos aquí
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    o haz clic para seleccionar
                  </p>
                  <Button variant="outline">
                    Seleccionar archivo
                  </Button>
                </>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2">
                          {file.status === 'completed' && (
                            <Badge variant="default" className="bg-green-500">
                              {file.aiScore}% cumplimiento
                            </Badge>
                          )}
                          {file.status === 'error' && (
                            <Badge variant="destructive">
                              Error
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status !== 'pending' && file.status !== 'completed' && file.status !== 'error' && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{file.status}</span>
                          </>
                        )}
                      </div>
                      {file.status !== 'pending' && file.status !== 'error' && (
                        <Progress value={file.progress} className="h-1 mt-2" />
                      )}
                      {file.error && (
                        <p className="text-sm text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Pipeline de Análisis IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ANALYSIS_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 ${
                    index <= currentStep && isProcessing ? 'opacity-100' : 
                    index < currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-500' :
                    index === currentStep && isProcessing ? 'bg-primary animate-pulse' :
                    'bg-muted'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : index === currentStep && isProcessing ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {isProcessing && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  Procesando con GPT-4o...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tiempo estimado: 15-30 segundos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata Section */}
      <Card>
        <CardHeader>
          <CardTitle>Información del documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
              <p className="font-medium">{session?.user?.name || 'Torres M., Juan Carlos'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código</p>
              <p className="font-medium">2025-12345</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Programa</p>
              <p className="font-medium">Maestría en Ingeniería de Software</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History (if applicable) */}
      <Card>
        <CardHeader>
          <CardTitle>Versiones del avance</CardTitle>
          <CardDescription>Historial de versiones y evolución de cumplimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Version List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Versión 3 (actual)</p>
                    <p className="text-sm text-muted-foreground">Hace 2 días</p>
                  </div>
                </div>
                <Badge>88%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Versión 2</p>
                    <p className="text-sm text-muted-foreground">Hace 1 semana</p>
                  </div>
                </div>
                <Badge variant="secondary">73%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Versión 1</p>
                    <p className="text-sm text-muted-foreground">Hace 2 semanas</p>
                  </div>
                </div>
                <Badge variant="secondary">58%</Badge>
              </div>
            </div>

            {/* Evolution Chart */}
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Evolución de cumplimiento IA</p>
                <div className="flex items-end gap-4 h-32">
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-yellow-400 rounded-t" style={{ height: '58%' }}></div>
                    <span className="text-xs mt-1">v1</span>
                    <span className="text-xs text-muted-foreground">58%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-blue-400 rounded-t" style={{ height: '73%' }}></div>
                    <span className="text-xs mt-1">v2</span>
                    <span className="text-xs text-muted-foreground">73%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-green-500 rounded-t" style={{ height: '88%' }}></div>
                    <span className="text-xs mt-1">v3</span>
                    <span className="text-xs text-muted-foreground">88%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}