
'use client';

import { useState, use, useEffect } from 'react';
import { useAppStore, UserRole } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage(props: { 
  params: Promise<any>; 
  searchParams: Promise<any>; 
}) {
  // Unwrap Next.js 15 Promise-based props
  use(props.params);
  use(props.searchParams);

  const { login, signUp, companySettings } = useAppStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('STAFF');

  // Sign Up State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('STAFF');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email.trim(), password, loginRole);
    if (success) {
      toast({ title: "Welcome back!", description: "Successfully authenticated." });
      router.push('/dashboard');
    } else {
      toast({ 
        title: "Login Failed", 
        description: "Invalid credentials. Please check your ID and password.", 
        variant: "destructive" 
      });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    signUp(newName, newEmail, newRole, newPassword);
    toast({ title: "Account Created", description: `You have been registered as ${newRole}.` });
    router.push('/dashboard');
  };

  if (!mounted) return null;

  const defaultLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://picsum.photos/seed/cinnamon-warehouse/1920/1080?blur=5')] bg-cover relative">
      <div className="absolute inset-0 bg-primary/25 backdrop-blur-md" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-none overflow-hidden rounded-3xl bg-white/95 transition-all duration-500">
        <div className="bg-primary h-2 w-full absolute top-0" />
        <CardHeader className="text-center space-y-2 pb-6 pt-10">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-3 shadow-xl mb-4 border border-primary/10 overflow-hidden transition-all hover:scale-105 duration-300">
            <Image 
              src={companySettings.logo || defaultLogo} 
              alt={companySettings.name} 
              width={96} 
              height={96} 
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-black text-primary tracking-tighter">{companySettings.name}</CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">Enterprise CRM & Management</CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-4">
          <div className="flex p-1 bg-muted/50 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('signin')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all",
                mode === 'signin' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            {companySettings.isRegistrationEnabled && (
              <button 
                onClick={() => setMode('signup')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all",
                  mode === 'signup' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            )}
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Access Role (Optional Hint)</Label>
                <Select value={loginRole} onValueChange={(v: UserRole) => setLoginRole(v)}>
                  <SelectTrigger className="h-12 rounded-xl bg-white border-muted-foreground/10 focus-visible:ring-primary shadow-sm">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="SUB_ADMIN">Sub-Admin</SelectItem>
                    <SelectItem value="STAFF">Operations Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">User ID / Email</Label>
                <Input 
                  type="text" 
                  placeholder="Enter your ID" 
                  className="h-12 rounded-xl bg-white border-muted-foreground/10 focus-visible:ring-primary shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-white border-muted-foreground/10 focus-visible:ring-primary shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-black uppercase tracking-widest shadow-lg rounded-xl mt-4 bg-primary hover:bg-primary/90 transition-all">
                Enter System <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Full Name</Label>
                <Input 
                  placeholder="e.g. John Doe" 
                  className="h-11 rounded-xl bg-white border-muted-foreground/10 shadow-sm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Choose User ID</Label>
                <Input 
                  placeholder="Create unique ID" 
                  className="h-11 rounded-xl bg-white border-muted-foreground/10 shadow-sm"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Set Password</Label>
                <Input 
                  type="password" 
                  placeholder="Min 6 chars" 
                  className="h-11 rounded-xl bg-white border-muted-foreground/10 shadow-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Assign System Role</Label>
                <Select value={newRole} onValueChange={(v: UserRole) => setNewRole(v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-white border-muted-foreground/10 shadow-sm">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-primary" /> Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="SUB_ADMIN">Sub-Admin</SelectItem>
                    <SelectItem value="STAFF">Operations Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-black uppercase tracking-widest shadow-lg rounded-xl mt-4 transition-all">
                Create Account <UserPlus className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-10 pt-4">
          <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">
            Cinnamon Lanka Exports ERP v2.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
