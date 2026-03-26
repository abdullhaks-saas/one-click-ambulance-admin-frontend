import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminReportsApi } from '@/services/api';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ReportsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const reports = [
    { id: 'rides', title: 'Rides Report', description: 'Detailed log of all rides, statuses, and distances.' },
    { id: 'revenue', title: 'Revenue Report', description: 'Financial breakdown of platform earnings and fares.' },
    { id: 'drivers', title: 'Driver Performance', description: 'Driver activity, ratings, and completion rates.' },
    { id: 'payments', title: 'Payment Transactions', description: 'All payment gateway transactions and statuses.' },
    { id: 'cancellations', title: 'Cancellations', description: 'Cancelled rides with reasons and timestamps.' },
  ];

  async function handleExport(reportType: string, format: 'csv' | 'xlsx') {
    try {
      const params: any = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      params.format = format;

      const response = await adminReportsApi.exportReport(reportType, params);
      
      // Create a blob and trigger download
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${reportType} report exported successfully`);
    } catch (err: any) {
      toast.error(err?.apiMessage || `Failed to export ${reportType} report`);
    }
  }

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reports & Exports</h1>
      </div>

      <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button 
              variant="ghost" 
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="text-slate-500"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => handleExport(report.id, 'csv')}
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => handleExport(report.id, 'xlsx')}
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Excel
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
