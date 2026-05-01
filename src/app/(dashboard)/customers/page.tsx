
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore, Customer, CustomerRanking } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Globe, 
  Sparkles,
  UserPlus,
  Trash2,
  Edit,
  History,
  Camera,
  Upload,
  Cake,
  Calendar,
  CreditCard,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiCustomerInsights, AICustomerInsightsOutput } from '@/ai/flows/ai-customer-insights';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { format, isSameDay, addDays } from 'date-fns';

export default function CustomersPage() {
  const { customers, deleteCustomer, addCustomer, currentUser, invoices, companySettings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AICustomerInsightsOutput | null>(null);
  const [today, setToday] = useState<Date>(new Date());
  
  const canDelete = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUB_ADMIN';

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Customer Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newRanking, setNewRanking] = useState<CustomerRanking>('Normal');

  useEffect(() => {
    setToday(new Date());
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatar(reader.result as string);
        toast({ title: "Image Uploaded", description: "Profile picture set." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomer = () => {
    if (!newName || !newEmail || !newCountry || !newPhone || !newBirthday) {
      toast({ title: "Missing Fields", description: "Please fill in all the required details, including birthday.", variant: "destructive" });
      return;
    }

    addCustomer({
      name: newName,
      email: newEmail,
      country: newCountry,
      phone: newPhone,
      birthday: newBirthday,
      notes: newNotes,
      ranking: newRanking,
      avatar: newAvatar || `https://picsum.photos/seed/${newName}/200/200`
    });

    toast({ title: "Customer Added", description: `${newName} has been added to your contacts.` });
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewCountry('');
    setNewPhone('');
    setNewBirthday('');
    setNewNotes('');
    setNewAvatar('');
    setNewRanking('Normal');
  };

  const handleRunAI = async (customer: Customer) => {
    setAnalyzingId(customer.id);
    setAiResult(null);
    try {
      const result = await aiCustomerInsights({
        customerNotes: customer.notes,
        purchaseHistory: (customer.purchaseHistory || []).map(p => ({
          productName: p.items.join(', '),
          price: p.amount,
          quantity: 1, 
          date: p.date
        }))
      });
      setAiResult(result);
    } catch (err) {
      toast({ title: "AI Analysis Failed", description: "Could not reach the AI service.", variant: "destructive" });
    } finally {
      setAnalyzingId(null);
    }
  };

  const getBirthdayStatus = (birthdayStr: string) => {
    if (!birthdayStr) return null;
    const bday = new Date(birthdayStr);
    const targetBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
    const tomorrow = addDays(today, 1);
    const targetTomorrow = new Date(tomorrow.getFullYear(), bday.getMonth(), bday.getDate());

    if (isSameDay(today, targetBday)) return 'today';
    if (isSameDay(tomorrow, targetTomorrow)) return 'tomorrow';
    return null;
  };

  const getRankBadge = (rank: CustomerRanking) => {
    switch(rank) {
      case 'VVIP': return <Badge className="bg-purple-600 hover:bg-purple-700">{rank}</Badge>;
      case 'VIP': return <Badge className="bg-amber-500 hover:bg-amber-600">{rank}</Badge>;
      case 'Regular': return <Badge variant="secondary">{rank}</Badge>;
      default: return <Badge variant="outline">{rank}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">CRM & Leads</h1>
          <p className="text-muted-foreground">Manage relationships and track customer lifecycle milestones.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <UserPlus className="w-4 h-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Customer</DialogTitle>
              <DialogDescription>
                Enter the details of the new business partner or lead.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-20 h-20 border-2 border-primary/20 shadow-md group-hover:border-primary/50 transition-all">
                    <AvatarImage src={newAvatar || `https://picsum.photos/seed/placeholder/200/200`} className="object-cover" />
                    <AvatarFallback><Camera className="w-8 h-8 opacity-50" /></AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" placeholder="Full Name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="col-span-3" placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-right">Birthday</Label>
                <Input id="birthday" type="date" value={newBirthday} onChange={(e) => setNewBirthday(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">Country</Label>
                <Input id="country" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="col-span-3" placeholder="e.g. Germany" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="col-span-3" placeholder="+1..." />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ranking" className="text-right">Ranking</Label>
                <Select value={newRanking} onValueChange={(v: CustomerRanking) => setNewRanking(v)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="VVIP">VVIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCustomer} className="w-full">Create Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold">{customers.length}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase">Global Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 border border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-primary">
                {customers.filter(c => getBirthdayStatus(c.birthday) === 'today').length}
              </h3>
              <p className="text-sm font-bold text-primary uppercase">Birthdays Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold">{customers.filter(c => c.ranking.includes('VIP')).length}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase">High-Value Partners</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Customer Directory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Customer</TableHead>
                <TableHead>Birthday Alert</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Ranking</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const bdayStatus = getBirthdayStatus(customer.birthday);
                const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
                
                return (
                  <TableRow key={customer.id} className={cn(
                    "group transition-colors",
                    bdayStatus === 'today' ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/10"
                  )}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-background">
                          <AvatarImage src={customer.avatar} className="object-cover" />
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm flex items-center gap-2">
                            {customer.name}
                            {bdayStatus === 'today' && <Cake className="w-3 h-3 text-primary animate-bounce" />}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bdayStatus === 'today' ? (
                        <Badge className="bg-primary text-white gap-1">
                          <Cake className="w-3 h-3" /> Celebration Today!
                        </Badge>
                      ) : bdayStatus === 'tomorrow' ? (
                        <Badge variant="outline" className="border-primary text-primary gap-1">
                          <Calendar className="w-3 h-3" /> Birthday Tomorrow
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{customer.birthday}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <Globe className="w-3 h-3 opacity-50" />
                        {customer.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRankBadge(customer.ranking)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                              <User className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Customer Profile View</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-8 py-6">
                              <div className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b">
                                <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-xl">
                                  <AvatarImage src={customer.avatar} className="object-cover" />
                                  <AvatarFallback className="text-4xl">{customer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-4 flex-1">
                                  <div>
                                    <h2 className="text-3xl font-black tracking-tight">{customer.name}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <Badge variant="secondary" className="gap-1"><Globe className="w-3 h-3" /> {customer.country}</Badge>
                                      <Badge variant="outline" className="gap-1"><Cake className="w-3 h-3" /> {customer.birthday}</Badge>
                                      {getRankBadge(customer.ranking)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
                                      <p className="text-sm font-medium">{customer.email}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
                                      <p className="text-sm font-medium">{customer.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h3 className="font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Purchase History</h3>
                                  <div className="border rounded-xl overflow-hidden">
                                    <Table>
                                      <TableBody>
                                        {customerInvoices.length > 0 ? customerInvoices.map((inv) => (
                                          <TableRow key={inv.id}>
                                            <TableCell className="py-2">
                                              <p className="text-xs font-bold">{inv.invoiceNumber}</p>
                                              <p className="text-[9px] text-muted-foreground">{inv.date}</p>
                                            </TableCell>
                                            <TableCell className="text-right py-2 font-black text-xs">
                                              {inv.currency === 'USD' ? '$' : 'Rs. '}{inv.total.toLocaleString()}
                                            </TableCell>
                                          </TableRow>
                                        )) : (
                                          <TableRow>
                                            <TableCell className="text-center py-4 text-xs italic text-muted-foreground">No orders recorded yet.</TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h3 className="font-bold flex items-center gap-2"><Edit className="w-4 h-4 text-primary" /> Relationship Notes</h3>
                                  <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20 text-sm italic min-h-[100px]">
                                    {customer.notes || "No additional internal notes provided."}
                                  </div>
                                  <Button className="w-full gap-2" variant="outline" onClick={() => handleRunAI(customer)}>
                                    <Sparkles className="w-4 h-4" /> Run AI Insight
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleRunAI(customer)}><Sparkles className="w-4 h-4" /> AI Strategy</DropdownMenuItem>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteCustomer(customer.id)}>
                                  <Trash2 className="w-4 h-4" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    No customers found matching your search.
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
