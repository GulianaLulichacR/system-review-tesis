// apps/web/app/review/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thesis-review/ui/components/card';
import { Button } from '@thesis-review/ui/components/button';
import { Badge } from '@thesis-review/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thesis-review/ui/components/tabs';
import { Progress } from '@thesis-review/ui/components/progress';
import { Textarea } from '@thesis-review/ui/components/textarea';
import { Label } from '@thesis-review/ui/components/label';
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
  ChevronLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Download,
  Save,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Clock,
  User,
  Brain,
  Loader2
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface ReviewData {
  documentId: string;
  documentTitle: string;
  studentName: string;
  studentCode: string;
  programName: string;
  version: number;
  uploadedAt: string;
  filePath: string;
  aiAnalysis: {
    overallScore: number;
    structureScore: number;
    contentScore: number;
    formScore: number;
    originalityScore: number;
    executiveSummary: string;
    findings: Finding[];
  };
  review: {
    id: string;
    status: string;
    humanScore: number | null;
    finalScore: number | null;
    generalComment: string;
    decision: string | null;
  };
}

interface Finding {
  id: string;
  findingType: string;
  severity: string;
  title: string;
  description: string;
  sectionRef: string | null;
  pageNumber: number | null;
  correctionInstruction: string | null;
  improvementExample: string | null;
  recommendation: string | null;
  reviewerStatus: string;
  reviewerComment: string | null;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-evaluation');
  const [editedFindings, setEditedFindings] = useState<Record<string, Finding>>({});
  const [humanScore, setHumanScore] = useState<number | null>(null);
  const [generalComment, setGeneralComment] = useState('');

  useEffect(() => {
    fetchReviewData();
  }, [params.id]);

  const fetchReviewData = async () => {
    try {
      const response = await fetch(`/api/review/${params.id}`);
      const result = await response.json();
      setData(result);
      setHumanScore(result.review?.humanScore || result.aiAnalysis?.overallScore);
      setGeneralComment(result.review?.generalComment || '');
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindingAction = async (findingId: string, action: 'accept' | 'discard' | 'edit', comment?: string) => {
    const finding = data?.aiAnalysis.findings.find(f => f.id === findingId);
    if (!finding) return;

    setEditedFindings(prev => ({
      ...prev,
      [findingId]: {
        ...finding,
        reviewerStatus: action === 'accept' ? 'ACCEPTED' : action === 'discard' ? 'DISCARDED' : 'MODIFIED',
        reviewerComment: comment || finding.reviewerComment,
      }
    }));
  };

  const calculateAdjustedScore = () => {
    const findings = Object.values(editedFindings);
    let adjustment = 0;
    
    findings.forEach(f => {
      if (f.reviewerStatus === 'DISCARDED') {
        // Recuperar puntos si se descarta un hallazgo negativo
        switch (f.severity) {
          case 'CRITICAL':
            adjustment += 5;
            break;
          case 'MAJOR':
            adjustment += 3;
            break;
          case 'MINOR':
            adjustment += 1;
            break;
        }
      }
    });

    const baseScore = data?.aiAnalysis.overallScore || 0;
    return Math.min(100, Math.max(0, baseScore + adjustment));
  };

  const handleSaveReview = async (submit: boolean = false) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/review/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findings: editedFindings,
          humanScore,
          generalComment,
          action: submit ? 'submit' : 'save',
        }),
      });

      if (response.ok) {
        if (submit) {
          router.push('/dashboard');
        } else {
          // Mostrar notificación de guardado
        }
      }
    } catch (error) {
      console.error('Error saving review:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAJOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MINOR':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUGGESTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      CRITICAL: 'Crítico',
      MAJOR: 'Mayor',
      MINOR: 'Menor',
      SUGGESTION: 'Sugerencia',
    };
    return labels[severity] || severity;
  };

  const getFindingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MISSING_SECTION: 'Sección faltante',
      STRUCTURAL_ERROR: 'Error estructural',
      CONTENT_ERROR: 'Error de contenido',
      FORM_ERROR: 'Error de forma',
      FORMATTING_ISSUE: 'Problema de formato',
      CITATION_ISSUE: 'Problema de citas',
      COHERENCE_ISSUE: 'Problema de coherencia',
      LANGUAGE_ISSUE: 'Problema de lenguaje',
      SUGGESTION: 'Sugerencia',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const radarData = [
    { subject: 'Estructura', A: data?.aiAnalysis.structureScore || 0, fullMark: 100 },
    { subject: 'Contenido', A: data?.aiAnalysis.contentScore || 0, fullMark: 100 },
    { subject: 'Forma', A: data?.aiAnalysis.formScore || 0, fullMark: 100 },
    { subject: 'Originalidad', A: data?.aiAnalysis.originalityScore || 0, fullMark: 100 },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Revisar avance - {data?.studentName} - Cap. {data?.version}
          </h1>
          <p className="text-muted-foreground">
            {data?.documentTitle} | {data?.programName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Document Viewer */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documento
            </CardTitle>
            <CardDescription>
              Vista previa del documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
              <iframe
                src={data?.filePath}
                className="w-full h-full rounded-lg"
                title="Document preview"
              />
            </div>
          </CardContent>
        </Card>

        {/* Review Panel */}
        <Card className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-evaluation" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Evaluación IA
                </TabsTrigger>
                <TabsTrigger value="my-review" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Mi Revisión
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="ai-evaluation" className="space-y-6 p-6 pt-2">
              {/* Score Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {data?.aiAnalysis.overallScore}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nota IA: {((data?.aiAnalysis.overallScore || 0) / 100 * 20).toFixed(1)}/20
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={120}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Executive Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Resumen Ejecutivo</h3>
                <p className="text-sm text-muted-foreground">
                  {data?.aiAnalysis.executiveSummary}
                </p>
              </div>

              {/* Findings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Hallazgos ({data?.aiAnalysis.findings.length})</h3>
                {data?.aiAnalysis.findings.map((finding) => {
                  const editedFinding = editedFindings[finding.id];
                  const currentFinding = editedFinding || finding;
                  
                  return (
                    <Card key={finding.id} className={`border-l-4 ${
                      currentFinding.reviewerStatus === 'ACCEPTED' ? 'border-l-green-500' :
                      currentFinding.reviewerStatus === 'DISCARDED' ? 'border-l-gray-300 opacity-50' :
                      finding.severity === 'CRITICAL' ? 'border-l-red-500' :
                      finding.severity === 'MAJOR' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(finding.severity)}>
                                {getSeverityLabel(finding.severity)}
                              </Badge>
                              <Badge variant="outline">
                                {getFindingTypeLabel(finding.findingType)}
                              </Badge>
                              {finding.sectionRef && (
                                <span className="text-sm text-muted-foreground">
                                  Sección: {finding.sectionRef}
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium mb-1">{finding.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {finding.description}
                            </p>
                            
                            {finding.correctionInstruction && (
                              <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                                <p className="text-sm font-medium text-green-800">Cómo corregir:</p>
                                <p className="text-sm text-green-700">{finding.correctionInstruction}</p>
                              </div>
                            )}
                            
                            {finding.improvementExample && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                                <p className="text-sm font-medium text-blue-800">Ejemplo:</p>
                                <p className="text-sm text-blue-700 italic">"{finding.improvementExample}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Button
                            size="sm"
                            variant={currentFinding.reviewerStatus === 'ACCEPTED' ? 'default' : 'outline'}
                            onClick={() => handleFindingAction(finding.id, 'accept')}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant={currentFinding.reviewerStatus === 'DISCARDED' ? 'destructive' : 'outline'}
                            onClick={() => handleFindingAction(finding.id, 'discard')}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Descartar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* Abrir modal de edición */}}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="my-review" className="space-y-6 p-6 pt-2">
              {/* Score Adjustment */}
              <div className="space-y-4">
                <div>
                  <Label>Puntuación Final</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">Nota IA: {((data?.aiAnalysis.overallScore || 0) / 100 * 20).toFixed(1)}/20</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={humanScore !== null ? (humanScore / 100 * 20).toFixed(1) : ''}
                        onChange={(e) => setHumanScore(parseFloat(e.target.value) / 20 * 100)}
                        className="w-20 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <span className="text-sm">/ 20</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Comentario General</Label>
                  <Textarea
                    placeholder="Ingrese sus observaciones generales sobre el documento..."
                    className="mt-2 min-h-32"
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Decisión</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="h-auto py-3">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Aprobar</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Observado</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 col-span-2">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      <span>Rechazar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => handleSaveReview(false)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={saving}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Revisión
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar envío?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Una vez enviada, la revisión será notificada al estudiante y no podrá ser modificada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleSaveReview(true)}>
                        Confirmar envío
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}