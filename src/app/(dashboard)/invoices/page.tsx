
'use client';

import { useState, useMemo, useRef } from 'react';
import { useAppStore, Invoice, Product, Customer } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  PackagePlus, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const { invoices, customers, products, addInvoice, updateInvoiceStatus, deleteInvoice, companySettings, currentUser } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const canDelete = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUB_ADMIN';
  const defaultLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  const isLKR = companySettings.currency === 'LKR';
  const currencySymbol = isLKR ? 'Rs. ' : '$';

  // New Invoice State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);

  const subtotal = useMemo(() => {
    return invoiceItems.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      const price = isLKR ? (product?.priceLKR || 0) : (product?.priceUSD || 0);
      return acc + price * item.quantity;
    }, 0);
  }, [invoiceItems, products, isLKR]);

  const discountAmount = useMemo(() => {
    return (subtotal * discount) / 100;
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return subtotal - discountAmount + tax + shipping;
  }, [subtotal, discountAmount, tax, shipping]);

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceItems(newItems);
  };

  const handleCreateInvoice = () => {
    if (!selectedCustomerId || invoiceItems.length === 0 || invoiceItems.some(i => !i.productId)) {
      toast({ title: "Validation Error", description: "Please select a customer and products.", variant: "destructive" });
      return;
    }

    const consolidatedQty: Record<string, number> = {};
    invoiceItems.forEach(item => {
      consolidatedQty[item.productId] = (consolidatedQty[item.productId] || 0) + item.quantity;
    });

    for (const productId in consolidatedQty) {
      const product = products.find(p => p.id === productId);
      const requested = consolidatedQty[productId];
      if (product && product.stock < requested) {
        toast({ 
          title: "Insufficient Stock", 
          description: `Cannot create invoice. ${product.name} only has ${product.stock} units left.`, 
          variant: "destructive" 
        });
        return;
      }
    }

    const items = invoiceItems.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const price = isLKR ? product.priceLKR : product.priceUSD;
      return { productId: item.productId, quantity: item.quantity, price: price };
    });

    addInvoice({
      customerId: selectedCustomerId,
      date: new Date().toISOString().split('T')[0],
      items,
      tax,
      shipping,
      discount,
      total,
      status: 'Pending',
      currency: companySettings.currency
    });

    toast({ title: "Invoice Created", description: "New invoice generated and stock updated." });
    setIsCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setInvoiceItems([]);
    setTax(0);
    setShipping(0);
    setDiscount(0);
  };

  const toggleStatus = (invId: string, current: 'Paid' | 'Pending') => {
    updateInvoiceStatus(invId, current === 'Paid' ? 'Pending' : 'Paid');
    toast({ title: "Status Updated", description: "Payment status toggled." });
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`invoice-${previewInvoice?.invoiceNumber}.pdf`);
  };

  const InvoiceDisplay = ({ invoice }: { invoice: Invoice }) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const invCurrencySymbol = invoice.currency === 'LKR' ? 'Rs. ' : '$';
    const sub = invoice.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const discVal = (sub * invoice.discount) / 100;

    return (
      <div ref={invoiceRef} className="bg-white p-12 border rounded-lg text-foreground space-y-8 max-w-[800px] mx-auto">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative border p-1 rounded-lg">
              <Image src={companySettings.logo || defaultLogo} alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">{companySettings.name}</h2>
              <p className="text-[10px] text-muted-foreground uppercase">{companySettings.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black uppercase opacity-20">Invoice</h1>
            <p className="font-mono text-sm font-bold">{invoice.invoiceNumber}</p>
            <p className="text-[10px] text-muted-foreground">{invoice.date}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 border-t pt-8">
          <div>
            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Bill To:</Label>
            <p className="font-bold text-lg">{customer?.name}</p>
            <p className="text-xs text-muted-foreground">{customer?.country}</p>
          </div>
          <div className="text-right">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Status:</Label>
            <Badge className={cn("ml-2", invoice.status === 'Paid' ? "bg-green-500" : "bg-amber-500")}>{invoice.status}</Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-bold">Item</TableHead>
              <TableHead className="text-right text-xs font-bold">Price</TableHead>
              <TableHead className="text-right text-xs font-bold">Qty</TableHead>
              <TableHead className="text-right text-xs font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, i) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <TableRow key={i}>
                  <TableCell className="text-xs font-medium">{product?.name}</TableCell>
                  <TableCell className="text-right text-xs">{invCurrencySymbol}{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                  <TableCell className="text-right text-xs font-bold">{invCurrencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2 border-t pt-4">
            <div className="flex justify-between text-xs"><span>Subtotal:</span><span>{invCurrencySymbol}{sub.toFixed(2)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>Discount:</span><span>-{invCurrencySymbol}{discVal.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-black text-primary border-t pt-2"><span>Total:</span><span>{invCurrencySymbol}{invoice.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Invoices</h1>
          <p className="text-muted-foreground">Generate billing and track revenue settlements.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><Label className="font-bold">Items</Label><Button variant="outline" size="sm" onClick={handleAddItem}>+ Add</Button></div>
                {invoiceItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.productId} onValueChange={(v) => handleItemChange(index, 'productId', v)}>
                        <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (Stock: {p.stock})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Input type="number" className="w-20" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-1"><Label className="text-[10px] font-bold">Tax</Label><Input type="number" value={tax} onChange={(e) => setTax(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold">Ship</Label><Input type="number" value={shipping} onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold">Disc %</Label><Input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div className="bg-muted p-4 rounded-lg font-bold text-right text-primary text-xl">Total: {currencySymbol}{total.toLocaleString()}</div>
            </div>
            <DialogFooter><Button onClick={handleCreateInvoice} className="w-full">Finalize Invoice</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{customers.find(c => c.id === inv.customerId)?.name}</TableCell>
                  <TableCell className="font-bold">{inv.currency === 'USD' ? '$' : 'Rs. '}{inv.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'Paid' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleStatus(inv.id, inv.status)}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setPreviewInvoice(inv)}><Eye className="w-4 h-4" /></Button></DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice Detail</DialogTitle>
                          </DialogHeader>
                          {previewInvoice && <div className="space-y-4"><InvoiceDisplay invoice={previewInvoice} /><Button onClick={downloadPDF} className="w-full">Download PDF</Button></div>}
                        </DialogContent>
                      </Dialog>
                      {canDelete && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive gap-2" onClick={() => deleteInvoice(inv.id)}><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
