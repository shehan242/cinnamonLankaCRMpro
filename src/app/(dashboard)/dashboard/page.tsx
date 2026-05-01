
'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FileText,
  Cake,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';

export default function DashboardPage() {
  const { customers, products, invoices, companySettings } = useAppStore();
  const [todayBirthdays, setTodayBirthdays] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    const matches = customers.filter(c => {
      if (!c.birthday) return false;
      const bday = new Date(c.birthday);
      return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
    });
    setTodayBirthdays(matches);
  }, [customers]);

  const isLKR = companySettings.currency === 'LKR';
  const currencySymbol = isLKR ? 'Rs. ' : '$';

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  const stats = [
    { title: 'Customers', value: customers.length, icon: Users, color: 'text-blue-600', trend: '+12%' },
    { title: 'Sales', value: invoices.length, icon: FileText, color: 'text-primary', trend: '+5%' },
    { title: `Revenue`, value: `${currencySymbol}${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', trend: '+8.2%' },
    { title: 'Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-accent', trend: lowStockCount > 0 ? 'Urgent' : 'All clear' },
  ];

  const chartData = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 }, { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 2390 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Enterprise Portal</h1>
          <p className="text-muted-foreground">Monitoring Ceylon's finest export operations.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoices">
            <Button className="gap-2 shadow-lg"><Plus className="w-4 h-4" /> New Invoice</Button>
          </Link>
        </div>
      </div>

      {todayBirthdays.length > 0 && (
        <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
            <Cake size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cake className="w-5 h-5" /> Customer Birthday Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium opacity-90">Send your best wishes to these clients celebrating today:</p>
            <div className="flex flex-wrap gap-4">
              {todayBirthdays.map(c => (
                <div key={c.id} className="flex items-center gap-3 bg-white/10 p-2 rounded-xl border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="text-[10px] opacity-80">{c.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="shadow-sm border-none bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}><Icon className="w-5 h-5" /></div>
                  <div className={cn("flex items-center text-xs font-medium", stat.trend.startsWith('+') ? "text-green-600" : "text-accent")}>{stat.trend}</div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Revenue Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, index) => <Cell key={`cell-${index}`} fill={index === 5 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Export Logs</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="space-y-1">
                  <p className="text-xs font-bold">{inv.invoiceNumber}</p>
                  <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black">{currencySymbol}{inv.total.toLocaleString()}</p>
                  <Badge variant={inv.status === 'Paid' ? 'default' : 'secondary'} className="text-[9px] h-4">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
