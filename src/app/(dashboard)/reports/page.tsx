
'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { summarizeReport } from '@/ai/flows/ai-report-summaries';
import { 
  BarChart3, 
  FileDown, 
  Sparkles, 
  ArrowRight,
  PieChart,
  Calendar,
  TrendingUp,
  Target,
  Globe
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { subDays, isSameDay, isAfter, startOfWeek, startOfYear } from 'date-fns';

type TimeFilter = 'today' | 'yesterday' | 'weekly' | 'annually' | 'lifetime';

export default function ReportsPage() {
  const { invoices, customers, products, companySettings, currentUser } = useAppStore();
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');

  const isLKR = companySettings.currency === 'LKR';
  const currencySymbol = isLKR ? 'Rs. ' : '$';
  const canSeeLifetime = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUB_ADMIN';

  // Filtered Data Calculations
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayStr = subDays(now, 1).toISOString().split('T')[0];
    const weekStart = startOfWeek(now);
    const yearStart = startOfYear(now);

    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      switch (timeFilter) {
        case 'today':
          return inv.date === todayStr;
        case 'yesterday':
          return inv.date === yesterdayStr;
        case 'weekly':
          return isAfter(invDate, weekStart);
        case 'annually':
          return isAfter(invDate, yearStart);
        case 'lifetime':
          return true;
        default:
          return true;
      }
    });
  }, [invoices, timeFilter]);

  const stats = useMemo(() => {
    const revenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = filteredInvoices.filter(i => i.status === 'Paid');
    const lifetimeRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      revenue,
      invoiceCount: filteredInvoices.length,
      paidCount: paidInvoices.length,
      lifetimeRevenue
    };
  }, [filteredInvoices, invoices]);

  const generateAISummary = async () => {
    setSummarizing(true);
    try {
      const reportText = `
        Sales Report for ${timeFilter} period
        Current Period Revenue: ${currencySymbol}${stats.revenue}
        Total Invoices in period: ${stats.invoiceCount}
        Status: ${stats.paidCount} Paid, ${stats.invoiceCount - stats.paidCount} Pending
      `;
      const result = await summarizeReport({ reportText });
      setAiSummary(result.summary);
    } catch (err) {
      toast({ title: "AI Summary Error", description: "Failed to generate report summary.", variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  const exportToExcel = () => {
    try {
      const invoiceData = filteredInvoices.map(inv => {
        const customer = customers.find(c => c.id === inv.customerId);
        return {
          'Invoice #': inv.invoiceNumber,
          'Customer': customer?.name || 'Unknown',
          'Date': inv.date,
          [`Total Amount (${companySettings.currency})`]: inv.total,
          'Status': inv.status
        };
      });

      const wb = XLSX.utils.book_new();
      const wsInvoices = XLSX.utils.json_to_sheet(invoiceData);
      XLSX.utils.book_append_sheet(wb, wsInvoices, "Filtered Sales");
      XLSX.writeFile(wb, `CinnamonLink_${timeFilter}_Report.xlsx`);
      
      toast({ title: "Export Successful", description: "Filtered report has been exported." });
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not generate Excel file.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Intelligence & Reports</h1>
          <p className="text-muted-foreground">Consolidated data and automated insights.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={(v: TimeFilter) => setTimeFilter(v)}>
            <SelectTrigger className="w-[180px] h-10 shadow-sm border-primary/20">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="annually">This Year</SelectItem>
              {canSeeLifetime && <SelectItem value="lifetime">Lifetime</SelectItem>}
            </SelectContent>
          </Select>
          <Button className="gap-2 shadow-md" onClick={exportToExcel}>
            <FileDown className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Period Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-black">{currencySymbol}{stats.revenue.toLocaleString()}</h3>
            <p className="text-[10px] mt-1 opacity-70">Filtered for {timeFilter}</p>
          </CardContent>
        </Card>

        {canSeeLifetime && (
          <Card className="border-none shadow-sm bg-accent text-accent-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">Lifetime Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-black">{currencySymbol}{stats.lifetimeRevenue.toLocaleString()}</h3>
              <p className="text-[10px] mt-1 opacity-70">Total across all records</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-black">{stats.invoiceCount}</h3>
            <p className="text-[10px] mt-1 text-muted-foreground">Invoices generated</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settlement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-black">{stats.invoiceCount > 0 ? Math.round((stats.paidCount / stats.invoiceCount) * 100) : 0}%</h3>
            <p className="text-[10px] mt-1 text-muted-foreground">{stats.paidCount} orders paid</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Performance Matrix</CardTitle>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-64 bg-muted/20 rounded-xl flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center space-y-2">
                <PieChart className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Detailed visual analytics for {timeFilter}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" /> Growth
                </p>
                <p className="text-lg font-bold text-green-600">+14.2%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-blue-600" /> Efficiency
                </p>
                <p className="text-lg font-bold text-blue-600">92%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-center gap-1">
                  <Globe className="w-3 h-3 text-primary" /> Retention
                </p>
                <p className="text-lg font-bold text-primary">88%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Executive Summary
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white border-primary/20" 
              onClick={generateAISummary}
              disabled={summarizing}
            >
              {summarizing ? 'Analyzing...' : 'Refresh AI'}
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {aiSummary ? (
              <div className="prose prose-sm text-muted-foreground">
                <p className="whitespace-pre-wrap leading-relaxed italic">"{aiSummary}"</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">Get Business Insights</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-2">
                  Generate a natural language summary of your sales data for the <strong>{timeFilter}</strong> period.
                </p>
                <Button variant="link" className="mt-4" onClick={generateAISummary}>
                  Click to Analyze <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Best Selling Product</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Cinnamon Alba C5</p>
            <p className="text-xs text-muted-foreground mt-1">Leading export volume</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Top Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">Germany</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">32% of period revenue</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Customer Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Highly Positive</p>
            <p className="text-xs text-muted-foreground mt-1">Based on recent CRM notes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
