
'use client';

import { useState } from 'react';
import { useAppStore, Product } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Warehouse, 
  ArrowUpDown, 
  RotateCcw, 
  Plus, 
  DollarSign, 
  Package, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { products, adjustStock, updateProduct, companySettings } = useAppStore();
  
  // Currency Settings
  const isLKR = companySettings.currency === 'LKR';
  const currencySymbol = isLKR ? 'Rs. ' : '$';

  // Stats Calculations
  const totalInventoryValue = products.reduce((sum, p) => {
    const price = isLKR ? p.priceLKR : p.priceUSD;
    return sum + (price * p.stock);
  }, 0);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  
  // Refill State
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refillQuantity, setRefillQuantity] = useState<number>(0);

  // Reconciliation State
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [reconProductId, setReconProductId] = useState<string>('');
  const [reconNewStock, setReconNewStock] = useState<number>(0);

  const handleRefill = () => {
    if (!selectedProduct || refillQuantity <= 0) {
      toast({ title: "Invalid Quantity", description: "Please enter a positive number to refill.", variant: "destructive" });
      return;
    }

    adjustStock(selectedProduct.id, refillQuantity);
    toast({ 
      title: "Stock Refilled", 
      description: `Added ${refillQuantity} units to ${selectedProduct.name}.` 
    });
    
    setIsRefillOpen(false);
    setSelectedProduct(null);
    setRefillQuantity(0);
  };

  const handleReconciliation = () => {
    if (!reconProductId) {
      toast({ title: "Select Product", description: "Please select a product to reconcile.", variant: "destructive" });
      return;
    }

    updateProduct(reconProductId, { stock: reconNewStock });
    const productName = products.find(p => p.id === reconProductId)?.name;
    
    toast({ 
      title: "Stock Reconciled", 
      description: `${productName} stock has been manually set to ${reconNewStock} units.` 
    });
    
    setIsReconOpen(false);
    setReconProductId('');
    setReconNewStock(0);
  };

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Warehouse Management</h1>
            <p className="text-muted-foreground">Monitor asset values and optimize stock levels.</p>
          </div>
        </div>
        
        <Dialog open={isReconOpen} onOpenChange={setIsReconOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md" variant="outline">
              <RotateCcw className="w-4 h-4" />
              Stock Reconciliation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Stock Reconciliation</DialogTitle>
              <DialogDescription>
                Correct discrepancies by manually overriding the current stock level.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select value={reconProductId} onValueChange={setReconProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-stock">Current Actual Stock (Physical Count)</Label>
                <Input 
                  id="new-stock" 
                  type="number" 
                  value={reconNewStock} 
                  onChange={(e) => setReconNewStock(parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleReconciliation} className="w-full">Update Warehouse Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Inventory Value</p>
                <h3 className="text-3xl font-black mt-2">
                  {currencySymbol}{totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] mt-2 opacity-70">Based on {companySettings.currency} pricing</p>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Units in Stock</p>
                <h3 className="text-3xl font-black mt-2 text-foreground">
                  {totalUnits.toLocaleString()}
                </h3>
                <p className="text-[10px] mt-2 text-muted-foreground font-medium uppercase tracking-tighter">Across {products.length} products</p>
              </div>
              <div className="p-2 bg-muted rounded-lg text-primary">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-none shadow-sm",
          lowStockCount > 0 ? "bg-accent/10 border border-accent/20" : "bg-muted/50"
        )}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Critical Stock Alerts</p>
                <h3 className={cn(
                  "text-3xl font-black mt-2",
                  lowStockCount > 0 ? "text-accent" : "text-green-600"
                )}>
                  {lowStockCount}
                </h3>
                <p className="text-[10px] mt-2 text-muted-foreground font-medium uppercase tracking-tighter">
                  {lowStockCount > 0 ? 'Action required immediately' : 'Warehouse healthy'}
                </p>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                lowStockCount > 0 ? "bg-accent text-white" : "bg-green-100 text-green-700"
              )}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-muted/10">
            <CardTitle className="text-lg">Warehouse Inventory Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Product / SKU</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Asset Value ({companySettings.currency})</TableHead>
                  <TableHead>Capacity Usage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const capacity = p.maxStockCapacity || 1000; 
                  const usage = (p.stock / capacity) * 100;
                  const isLow = p.stock <= p.lowStockThreshold;
                  const unitPrice = isLKR ? p.priceLKR : p.priceUSD;
                  const assetValue = unitPrice * p.stock;
                  
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{p.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-black text-base",
                            isLow ? "text-accent" : "text-primary"
                          )}>
                            {p.stock}
                          </span>
                          <span className="text-[10px] font-normal text-muted-foreground uppercase">units</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-sm text-foreground">
                          {currencySymbol}{assetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="space-y-1">
                          <Progress value={usage} className={cn("h-2", isLow ? "bg-accent/20" : "bg-primary/20")} />
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                            {usage.toFixed(1)}% OF {capacity} UNIT CAPACITY
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 hover:bg-primary/5 text-primary font-bold"
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsRefillOpen(true);
                          }}
                        >
                          Refill <Plus className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Inventory Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockProducts.map(p => (
                <div key={p.id} className="p-3 bg-accent/5 rounded-lg text-xs flex items-start gap-2 border border-accent/10">
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1 animate-pulse" />
                  <div>
                    <p className="font-bold uppercase tracking-tight text-accent">{p.name}</p>
                    <p className="text-muted-foreground mt-1">Critical: {p.stock} units left. Revenue at risk.</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground italic">No stock risks detected.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <Button variant="outline" className="w-full justify-start gap-3 h-10 text-xs font-bold uppercase tracking-wider" onClick={() => setIsReconOpen(true)}>
                <RotateCcw className="w-4 h-4 text-primary" /> Audit Stock
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-10 text-xs font-bold uppercase tracking-wider">
                <ArrowUpDown className="w-4 h-4 text-primary" /> Transfer Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refill Dialog */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Increase the inventory for <span className="font-bold text-primary">{selectedProduct?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-[10px] uppercase text-muted-foreground">Current Stock</Label>
                <p className="text-xl font-bold">{selectedProduct?.stock} units</p>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Label className="text-[10px] uppercase text-primary">Target Stock</Label>
                <p className="text-xl font-bold text-primary">{(selectedProduct?.stock || 0) + refillQuantity} units</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refill-qty">Quantity to Add</Label>
              <Input 
                id="refill-qty" 
                type="number" 
                placeholder="Enter units..." 
                value={refillQuantity || ''} 
                onChange={(e) => setRefillQuantity(parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefillOpen(false)}>Cancel</Button>
            <Button onClick={handleRefill}>Confirm Addition</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
