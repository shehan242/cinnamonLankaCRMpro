
'use client';

import { useState, useRef } from 'react';
import { useAppStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Filter,
  MoreVertical,
  Layers,
  BarChart2,
  Trash2,
  Edit,
  Camera,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const { products, companySettings, currentUser, addProduct, deleteProduct, updateProduct } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newPriceUSD, setNewPriceUSD] = useState<number>(0);
  const [newPriceLKR, setNewPriceLKR] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('Premium Sticks');
  const [newStock, setNewStock] = useState<number>(0);

  const isLKR = companySettings.currency === 'LKR';
  const currencySymbol = isLKR ? 'Rs. ' : '$';
  
  // Role check: Only ADMIN and SUB_ADMIN can modify products
  const canModify = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUB_ADMIN';

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image should be under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newName || !newSku) {
      toast({ title: "Missing Fields", description: "Product name and SKU are required.", variant: "destructive" });
      return;
    }

    addProduct({
      name: newName,
      sku: newSku,
      image: newImage || `https://picsum.photos/seed/${newSku}/400/400`,
      priceUSD: newPriceUSD,
      priceLKR: newPriceLKR,
      category: newCategory,
      stock: newStock,
      maxStockCapacity: 1000,
      lowStockThreshold: 20
    });

    toast({ title: "Product Added", description: `${newName} added to the catalog.` });
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewSku('');
    setNewImage('');
    setNewPriceUSD(0);
    setNewPriceLKR(0);
    setNewCategory('Premium Sticks');
    setNewStock(0);
  };

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    toast({ title: "Product Removed", description: `${name} has been deleted.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Product Inventory</h1>
          <p className="text-muted-foreground">Real-time stock monitoring and price management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Layers className="w-4 h-4" />
            Categories
          </Button>
          
          {canModify && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-md">
                  <Plus className="w-4 h-4" />
                  New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Create a new product entry for the export catalog.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div 
                      className="relative group cursor-pointer w-24 h-24 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-primary/20 flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {newImage ? (
                        <Image src={newImage} alt="Preview" fill className="object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 opacity-20" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Product Photo</Label>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sku" className="text-right">Code (SKU)</Label>
                    <Input id="sku" value={newSku} onChange={(e) => setNewSku(e.target.value)} className="col-span-3 font-mono" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cat" className="text-right">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premium Sticks">Premium Sticks</SelectItem>
                        <SelectItem value="Essential Oils">Essential Oils</SelectItem>
                        <SelectItem value="Powder">Powder</SelectItem>
                        <SelectItem value="Bulk">Bulk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price-usd" className="text-right">Price (USD)</Label>
                    <Input id="price-usd" type="number" value={newPriceUSD} onChange={(e) => setNewPriceUSD(parseFloat(e.target.value) || 0)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price-lkr" className="text-right">Price (LKR)</Label>
                    <Input id="price-lkr" type="number" value={newPriceLKR} onChange={(e) => setNewPriceLKR(parseFloat(e.target.value) || 0)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">Initial Stock</Label>
                    <Input id="stock" type="number" value={newStock} onChange={(e) => setNewStock(parseInt(e.target.value) || 0)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} className="w-full">Create Product Record</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search Name or Code (SKU)..." 
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Stock Inventory List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Product Code (SKU)</TableHead>
                <TableHead>Stock Units</TableHead>
                <TableHead>Stock Percentage</TableHead>
                <TableHead className="text-right">Price ({companySettings.currency})</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockPercentage = (product.stock / product.maxStockCapacity) * 100;
                const isLowStock = product.stock <= product.lowStockThreshold;
                const displayPrice = isLKR ? product.priceLKR : product.priceUSD;
                
                return (
                  <TableRow key={product.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="w-12 h-12 relative rounded-md overflow-hidden border bg-muted">
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{product.name}</span>
                        <Badge variant="outline" className="w-fit text-[10px] mt-1 uppercase opacity-70">
                          {product.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold",
                          isLowStock ? "text-accent" : "text-foreground"
                        )}>
                          {product.stock}
                        </span>
                        {isLowStock && <AlertTriangle className="w-3 h-3 text-accent" />}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
                          <span>Usage</span>
                          <span>{Math.round(stockPercentage)}%</span>
                        </div>
                        <Progress 
                          value={stockPercentage} 
                          className={cn(
                            "h-1.5",
                            stockPercentage < 20 ? "bg-accent/20" : "bg-primary/20"
                          )} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary">{currencySymbol}{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {isLKR ? `$${product.priceUSD.toFixed(2)}` : `Rs. ${product.priceLKR.toLocaleString()}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2">
                            <BarChart2 className="w-4 h-4" /> Stock History
                          </DropdownMenuItem>
                          {canModify && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 text-destructive"
                                onClick={() => handleDelete(product.id, product.name)}
                              >
                                <Trash2 className="w-4 h-4" /> Remove Product
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                    No products found.
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
