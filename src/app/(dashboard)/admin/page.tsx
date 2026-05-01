
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Building2, 
  Save, 
  Upload,
  Camera,
  Mail,
  Phone,
  MapPin,
  Palette,
  Coins,
  LockKeyhole,
  Share2
} from 'lucide-react';
import { useAppStore, UserRole, CurrencyType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const COLOR_PRESETS = [
  { name: 'Sienna (Default)', value: '20 50% 47%', hex: '#B4673D' },
  { name: 'Ocean Blue', value: '221.2 83.2% 53.3%', hex: '#3B82F6' },
  { name: 'Emerald', value: '142.1 76.2% 36.3%', hex: '#10B981' },
  { name: 'Royal Purple', value: '262.1 83.3% 57.8%', hex: '#8B5CF6' },
  { name: 'Deep Slate', value: '215 25% 27%', hex: '#334155' },
  { name: 'Rich Red', value: '0 72% 51%', hex: '#DC2626' },
];

export default function AdminPage() {
  const { users, addUser, deleteUser, currentUser, companySettings, updateCompanySettings } = useAppStore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  // User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STAFF');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Company Settings Form State
  const [compName, setCompName] = useState(companySettings.name);
  const [compAddress, setCompAddress] = useState(companySettings.address);
  const [compHotline, setCompHotline] = useState(companySettings.hotline);
  const [compEmail, setCompEmail] = useState(companySettings.email);
  const [compLogo, setCompLogo] = useState(companySettings.logo);
  const [compColor, setCompColor] = useState(companySettings.primaryColor);
  const [compCurrency, setCompCurrency] = useState<CurrencyType>(companySettings.currency || 'USD');
  const [regEnabled, setRegEnabled] = useState(companySettings.isRegistrationEnabled);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      password: newUserPassword,
    });
    toast({ title: "User Created", description: `Access granted to ${newUserName} as ${newUserRole}.` });
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('STAFF');
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast({ title: "Action Denied", description: "You cannot delete your own admin account.", variant: "destructive" });
      return;
    }
    deleteUser(id);
    toast({ title: "User Removed", description: "The account has been deactivated." });
  };

  const handleShareAccess = () => {
    const loginUrl = window.location.origin + '/login';
    navigator.clipboard.writeText(loginUrl).then(() => {
      toast({ 
        title: "Link Copied", 
        description: "The system login URL has been copied to your clipboard. Send this to the user." 
      });
    }).catch(() => {
      toast({ 
        title: "Share Failed", 
        description: "Could not copy link to clipboard.", 
        variant: "destructive" 
      });
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Logo should be under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompLogo(reader.result as string);
        toast({ title: "Logo Ready", description: "Click 'Save Business Identity' to apply." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompanySettings = () => {
    updateCompanySettings({
      name: compName,
      address: compAddress,
      hotline: compHotline,
      email: compEmail,
      logo: compLogo,
      primaryColor: compColor,
      currency: compCurrency,
      isRegistrationEnabled: regEnabled,
    });
    toast({ title: "Settings Saved", description: "Company identity, theme, and access controls have been updated." });
  };

  const defaultLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Control Center</h1>
          <p className="text-muted-foreground">Manage system users and global business configurations.</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Assign credentials and roles for a new staff member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email (ID)</Label>
                <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="e.g. marketing@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Login Password</Label>
                <Input id="password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Role Access Level</Label>
                <Select value={newUserRole} onValueChange={(v: UserRole) => newUserRole === 'ADMIN' ? setNewUserRole(v) : setNewUserRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="SUB_ADMIN">Sub-Admin</SelectItem>
                    <SelectItem value="STAFF">Operations Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser} className="w-full">Generate Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Identity & Branding
            </CardTitle>
            <CardDescription>Configure branding, contact details, and the system theme color.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 pb-6 border-b">
              <div className="flex flex-col items-center gap-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Logo</Label>
                <div 
                  className="relative group cursor-pointer w-32 h-32 bg-white rounded-xl shadow-inner border border-dashed border-primary/20 flex items-center justify-center overflow-hidden"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Image 
                    src={compLogo || defaultLogo} 
                    alt="Company Logo" 
                    fill 
                    className="object-contain p-2" 
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-[10px] font-bold">UPLOAD</span>
                  </div>
                </div>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                    <Building2 className="w-3 h-3" /> Company Name
                  </Label>
                  <Input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Cinnamon Lanka Exports" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                    <Mail className="w-3 h-3" /> Official Email
                  </Label>
                  <Input value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="info@company.com" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                    <Phone className="w-3 h-3" /> Hotline / Phone
                  </Label>
                  <Input value={compHotline} onChange={(e) => setCompHotline(e.target.value)} placeholder="+94 11..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                    <MapPin className="w-3 h-3" /> Physical Address
                  </Label>
                  <Input value={compAddress} onChange={(e) => setCompAddress(e.target.value)} placeholder="City, Country" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Palette className="w-4 h-4 text-primary" />
                  Dashboard Theme Color
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCompColor(color.value)}
                      className={cn(
                        "group flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                        compColor === color.value 
                          ? "border-primary bg-primary/5 shadow-sm scale-105" 
                          : "border-transparent hover:border-muted-foreground/20"
                      )}
                    >
                      <div 
                        className="w-8 h-8 rounded-full shadow-inner border border-black/5" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Coins className="w-4 h-4 text-primary" />
                    Preferred Currency
                  </Label>
                  <Select value={compCurrency} onValueChange={(v: CurrencyType) => setCompCurrency(v)}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD (United States Dollar)</SelectItem>
                      <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <LockKeyhole className="w-4 h-4 text-primary" />
                        Public Registration
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Enable self-sign-up on login page.</p>
                    </div>
                    <Switch 
                      checked={regEnabled} 
                      onCheckedChange={setRegEnabled} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveCompanySettings} className="gap-2 px-8">
                <Save className="w-4 h-4" />
                Save Business Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Access Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Accounts</span>
                <span className="font-bold">{users.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary">Full Admins</span>
                <span className="font-bold">{users.filter(u => u.role === 'ADMIN').length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5">
                <ShieldAlert className="w-4 h-4" />
                View Audit History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">User Access Management</CardTitle>
          <CardDescription>Review and modify system user permissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>User Identity</TableHead>
                <TableHead>Identifier (Email)</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                        onClick={handleShareAccess}
                        title="Copy Login Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
