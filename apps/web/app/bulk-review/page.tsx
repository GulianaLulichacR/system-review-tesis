// apps/web/app/bulk-review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thesis-review/ui/components/card';
import { Button } from '@thesis-review/ui/components/button';
import { Badge } from '@thesis-review/ui/components/badge';
import { Checkbox } from '@thesis-review/ui/components/checkbox';
import { Progress } from '@thesis-review/ui/components/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@thesis-review/ui/components/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@thesis-review/ui/components/alert-dialog';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Send,
  Loader2,
  Filter,
  CheckSquare,
  Square,
  Brain,
} from 'lucide-react';

interface DocumentForReview {
  id: string;
  title: string;
  studentName: string;
  studentCode: string;
  programName: string;
  aiScore: number;
  status: string;
  uploadedAt: string;
  selected: boolean;
}

export default function BulkReviewPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({
    program: 'all',
    status: 'all',
    period: '2025-II',
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.program !== 'all') params.append('programId', filters.program);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('period', filters.period);

      const response = await fetch(`/api/documents?${params.toString()}`);
      const data = await response.json();
      
      setDocuments(data.data.map((doc: any) => ({
        ...doc,
        selected: false,
      })));
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = documents.filter(d => d.selected).length;
  const selectedDocuments = documents.filter(d => d.selected);

  const toggleSelection = (id: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  const selectAll = () => {
    const allSelected = documents.every(d => d.selected);
    setDocuments(prev => prev.map(doc => ({ ...doc, selected: !allSelected })));
  };

  const selectByScore = (minScore: number, maxScore: number) => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      selected: doc.aiScore >= minScore && doc.aiScore <= maxScore,
    })));
  };

  const processBulkAction = async (action: 'approve' | 'reject' | 'assign' | 'analyze') => {
    if (selectedCount === 0) return;

    setProcessing(true);
    setProgress(0);

    const totalDocs = selectedCount;
    let processed = 0;

    for (const doc of selectedDocuments) {
      try {
        await fetch(`/api/review/${doc.id}/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        processed++;
        setProgress(Math.round((processed / totalDocs) * 100));

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
      }
    }

    setProcessing(false);
    fetchDocuments();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING_REVIEW: { variant: 'secondary', label: 'Pendiente IA' },
      AI_COMPLETED: { variant: 'default', label: 'IA Completa' },
      UNDER_REVIEW: { variant: 'outline', label: 'En Revisión' },
      APPROVED: { variant: 'default', label: 'Aprobado' },
      REJECTED: { variant: 'destructive', label: 'Rechazado' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revisión por Lotes</h1>
          <p className="text-muted-foreground">
            Procesa múltiples avances simultáneamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={fetchDocuments}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Programa</label>
              <Select
                value={filters.program}
                onValueChange={(value) => setFilters(prev => ({ ...prev, program: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los programas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los programas</SelectItem>
                  <SelectItem value="msw">Maestría en Ingeniería de Software</SelectItem>
                  <SelectItem value="med">Maestría en Educación</SelectItem>
                  <SelectItem value="mde">Maestría en Derecho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="AI_COMPLETED">Pendiente de Revisión</SelectItem>
                  <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                  <SelectItem value="OBSERVED">Observado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select
                value={filters.period}
                onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-II">Período 2025-II</SelectItem>
                  <SelectItem value="2025-I">Período 2025-I</SelectItem>
                  <SelectItem value="2024-II">Período 2024-II</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => {}}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {processing && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Procesando documentos...</p>
                <Progress value={progress} className="mt-2" />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedCount} documento{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectByScore(80, 100)}
                >
                  Aprobar (≥80%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectByScore(60, 79)}
                >
                  Observar (60-79%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectByScore(0, 59)}
                >
                  Revisar (&lt;60%)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Avances seleccionados — {documents.length} documentos
              </CardTitle>
              <CardDescription>
                {selectedCount} pendientes de acción
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {documents.every(d => d.selected) ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Deseleccionar todos
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Seleccionar todos
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors cursor-pointer ${
                    doc.selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleSelection(doc.id)}
                >
                  <Checkbox
                    checked={doc.selected}
                    onCheckedChange={() => toggleSelection(doc.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{doc.title}</p>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.studentName} — {doc.programName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(doc.aiScore)}`}>
                      {doc.aiScore}%
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/review/${doc.id}`;
                      }}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron documentos con los filtros seleccionados
                </div>
              )}

              {documents.length > 20 && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                  + {documents.length - 20} más seleccionados
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Masivas</CardTitle>
          <CardDescription>
            Aplica la misma acción a todos los documentos seleccionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto py-4"
                  disabled={selectedCount === 0 || processing}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <span>Analizar con IA</span>
                    <span className="text-xs text-muted-foreground">
                      Procesar documentos pendientes
                    </span>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Iniciar análisis IA?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se procesarán {selectedCount} documentos con el motor de IA.
                    Este proceso puede tomar varios minutos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => processBulkAction('analyze')}>
                    Iniciar análisis
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto py-4"
                  disabled={selectedCount === 0 || processing}
                >
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Aprobar</span>
                    <span className="text-xs text-muted-foreground">
                      Marcar como aprobados
                    </span>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Aprobar documentos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se aprobarán {selectedCount} documentos. Los estudiantes recibirán
                    notificación automática.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => processBulkAction('approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Aprobar seleccionados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto py-4"
                  disabled={selectedCount === 0 || processing}
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <span>Observar</span>
                    <span className="text-xs text-muted-foreground">
                      Requiere correcciones
                    </span>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Marcar como observados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se marcarán {selectedCount} documentos como observados.
                    Los estudiantes deberán subir una nueva versión.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => processBulkAction('reject')}>
                    Marcar observados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              className="h-auto py-4"
              disabled={selectedCount === 0 || processing}
              onClick={() => {/* Abrir modal de asignación */}}
            >
              <div className="flex flex-col items-center gap-2">
                <Send className="h-6 w-6 text-blue-500" />
                <span>Asignar</span>
                <span className="text-xs text-muted-foreground">
                  Asignar a revisores
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}