
'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function SalesHistoryPage() {
  const { invoices, customers } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Sales History</h1>
          <p className="text-muted-foreground">Comprehensive log of all transactions and shipments.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoice or customer..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Transaction Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const customer = customers.find(c => c.id === inv.customerId);
                  const invCurrencySymbol = inv.currency === 'LKR' ? 'Rs. ' : '$';
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/10">
                      <TableCell className="text-xs">{inv.date}</TableCell>
                      <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium">{customer?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-muted-foreground">{customer?.country}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {inv.items.length} product(s)
                      </TableCell>
                      <TableCell className="text-xs text-accent">
                        {inv.discount > 0 ? `${inv.discount}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">{invCurrencySymbol}{inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'Paid' ? 'default' : 'secondary'}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                    {invoices.length === 0 ? "No sales recorded yet." : "No transactions match your search."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
