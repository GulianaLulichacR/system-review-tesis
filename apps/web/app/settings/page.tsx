// apps/web/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thesis-review/ui/components/card';
import { Button } from '@thesis-review/ui/components/button';
import { Input } from '@thesis-review/ui/components/input';
import { Label } from '@thesis-review/ui/components/label';
import { Switch } from '@thesis-review/ui/components/switch';
import { Badge } from '@thesis-review/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thesis-review/ui/components/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@thesis-review/ui/components/select';
import {
  Brain,
  Save,
  RefreshCw,
  FileText,
  Download,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Settings,
  Database,
  Mail,
  Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  const [aiConfig, setAiConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4096,
    enableEmbeddings: true,
    enableSemanticSearch: true,
  });

  const [gradingConfig, setGradingConfig] = useState({
    maxScore: 20,
    passingScore: 11,
    weights: {
      structure: 30,
      content: 40,
      form: 20,
      originality: 10,
    },
  });

  const templates = [
    {
      id: '1',
      name: 'Patrón Maestría Ingeniería de Sistemas',
      version: 'v2.1',
      status: 'active',
      lastUpdated: '2025-01-15',
      documents: 145,
    },
    {
      id: '2',
      name: 'Patrón Maestría en Educación',
      version: 'v1.8',
      status: 'active',
      lastUpdated: '2025-01-10',
      documents: 89,
    },
    {
      id: '3',
      name: 'Patrón Maestría en Derecho',
      version: 'v1.5',
      status: 'inactive',
      lastUpdated: '2024-12-20',
      documents: 34,
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra parámetros globales y documentos patrón
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Motor de IA
          </TabsTrigger>
          <TabsTrigger value="grading" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Escala de Calificación
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos Patrón
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* AI Configuration */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Motor de IA
              </CardTitle>
              <CardDescription>
                Configura el proveedor y parámetros del modelo de análisis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Proveedor de IA</Label>
                  <Select
                    value={aiConfig.provider}
                    onValueChange={(value) => setAiConfig(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          OpenAI (GPT-4o)
                        </div>
                      </SelectItem>
                      <SelectItem value="ollama">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🦙</span>
                          </div>
                          Ollama (Local)
                        </div>
                      </SelectItem>
                      <SelectItem value="anthropic">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">C</span>
                          </div>
                          Anthropic (Claude)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select
                    value={aiConfig.model}
                    onValueChange={(value) => setAiConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Más rápido)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Temperatura: {aiConfig.temperature}</Label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Menor = más determinista, Mayor = más creativo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Tokens</Label>
                  <Input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar Embeddings Vectoriales</Label>
                    <p className="text-xs text-muted-foreground">
                      Permite búsqueda semántica y comparación de similitud
                    </p>
                  </div>
                  <Switch
                    checked={aiConfig.enableEmbeddings}
                    onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, enableEmbeddings: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Búsqueda Semántica</Label>
                    <p className="text-xs text-muted-foreground">
                      Compara secciones por significado, no solo por texto
                    </p>
                  </div>
                  <Switch
                    checked={aiConfig.enableSemanticSearch}
                    onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, enableSemanticSearch: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Motor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">API OpenAI</p>
                    <p className="text-xs text-muted-foreground">Conectado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Redis Queue</p>
                    <p className="text-xs text-muted-foreground">3 workers activos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">pgvector</p>
                    <p className="text-xs text-muted-foreground">12,450 embeddings</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Configuration */}
        <TabsContent value="grading" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Escala de Calificación</CardTitle>
              <CardDescription>
                Configura los parámetros de evaluación y aprobación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nota Máxima</Label>
                  <Input
                    type="number"
                    value={gradingConfig.maxScore}
                    onChange={(e) => setGradingConfig(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nota Aprobatoria</Label>
                  <Input
                    type="number"
                    value={gradingConfig.passingScore}
                    onChange={(e) => setGradingConfig(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Ponderación de Dimensiones</Label>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Estructura</span>
                        <span className="text-sm font-medium">{gradingConfig.weights.structure}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={gradingConfig.weights.structure}
                        onChange={(e) => setGradingConfig(prev => ({
                          ...prev,
                          weights: { ...prev.weights, structure: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Contenido</span>
                        <span className="text-sm font-medium">{gradingConfig.weights.content}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={gradingConfig.weights.content}
                        onChange={(e) => setGradingConfig(prev => ({
                          ...prev,
                          weights: { ...prev.weights, content: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Forma</span>
                        <span className="text-sm font-medium">{gradingConfig.weights.form}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={gradingConfig.weights.form}
                        onChange={(e) => setGradingConfig(prev => ({
                          ...prev,
                          weights: { ...prev.weights, form: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Originalidad</span>
                        <span className="text-sm font-medium">{gradingConfig.weights.originality}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={gradingConfig.weights.originality}
                        onChange={(e) => setGradingConfig(prev => ({
                          ...prev,
                          weights: { ...prev.weights, originality: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {Object.values(gradingConfig.weights).reduce((a, b) => a + b, 0)}%
                  {Object.values(gradingConfig.weights).reduce((a, b) => a + b, 0) !== 100 && (
                    <span className="text-red-500 ml-2">(Debe sumar 100%)</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentos Patrón Institucionales</CardTitle>
                  <CardDescription>
                    Define la estructura esperada para cada programa académico
                  </CardDescription>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Nuevo Patrón
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          <Badge variant="outline">{template.version}</Badge>
                          {template.status === 'active' && (
                            <Badge className="bg-green-500">Activo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.documents} documentos evaluados | Última actualización: {template.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Emails automáticos</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones por correo
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones en app</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas en tiempo real
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticación 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Requerir segundo factor
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Logs de auditoría</p>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas las acciones
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}