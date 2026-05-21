// apps/web/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thesis-review/ui/components/card';
import { Badge } from '@thesis-review/ui/components/badge';
import { Button } from '@thesis-review/ui/components/button';
import { Progress } from '@thesis-review/ui/components/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thesis-review/ui/components/tabs';
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Bell
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardStats {
  pendingReviews: number;
  reviewedThisMonth: number;
  aiConcordance: number;
  averageScore: number;
  pendingChange: number;
  reviewedChange: number;
  recentDocuments: RecentDocument[];
  statusDistribution: { name: string; value: number }[];
  monthlyProgress: { month: string; documentos: number }[];
}

interface RecentDocument {
  id: string;
  title: string;
  studentName: string;
  aiScore: number;
  status: string;
  uploadedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-II');

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedPeriod]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING_REVIEW: 'secondary',
      PROCESSING_AI: 'outline',
      AI_COMPLETED: 'default',
      APPROVED: 'default',
      REJECTED: 'destructive',
      OBSERVED: 'destructive',
    };
    
    const labels: Record<string, string> = {
      PENDING_REVIEW: 'Pendiente',
      PROCESSING_AI: 'Analizando IA',
      AI_COMPLETED: 'IA Completa',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      OBSERVED: 'Observado',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
          <p className="text-muted-foreground">
            Sistema de Revisión Inteligente de Tesis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="2025-II">Periodo 2025-II</option>
            <option value="2025-I">Periodo 2025-I</option>
            <option value="2024-II">Periodo 2024-II</option>
          </select>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={fetchDashboardStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avances Pendientes
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-500">↑ {stats?.pendingChange || 0} nuevos hoy</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revisados (Mes)
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.reviewedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ {stats?.reviewedChange || 0}% vs. anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concordancia IA
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.aiConcordance || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              IA vs. Humano
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nota Promedio IA
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.averageScore?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Escala 0 - 20
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Documents */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Avances Recientes</CardTitle>
            <CardDescription>Documentos pendientes de revisión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentDocuments?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/review/${doc.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(doc.aiScore)}`}>
                        {doc.aiScore}%
                      </p>
                      <Progress 
                        value={doc.aiScore} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.statusDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Mensual</CardTitle>
          <CardDescription>Avances recibidos por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="documentos"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];