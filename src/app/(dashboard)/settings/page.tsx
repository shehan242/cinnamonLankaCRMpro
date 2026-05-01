
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Globe, Bell, Lock, User, Key, Camera, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { currentUser, updateMyPassword, updateProfile } = useAppStore();
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match or are empty.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    updateMyPassword(newPassword);
    toast({ title: "Success", description: "Your login password has been updated." });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "File too large", description: "Please upload an image smaller than 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
        toast({ title: "Image Selected", description: "Click 'Save Profile' to finalize the update." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast({ title: "Error", description: "Display name cannot be empty.", variant: "destructive" });
      return;
    }
    updateProfile({
      name: profileName,
      avatar: profileAvatar
    });
    toast({ title: "Profile Updated", description: "Your professional information has been saved." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="text-muted-foreground">Customize your business preferences and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Edit Profile
              </CardTitle>
              <CardDescription>Update your public-facing professional details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="w-24 h-24 border-4 border-primary/10 shadow-lg group-hover:border-primary/40 transition-all">
                    <AvatarImage src={profileAvatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                      {profileName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-[10px] font-bold">CHANGE</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                />
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Display Name</Label>
                    <Input 
                      id="profile-name" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User Role</Label>
                    <Input value={currentUser?.role} disabled className="bg-muted" />
                    <p className="text-[10px] text-muted-foreground italic">Contact system administrator to change access levels.</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="w-full md:w-auto shadow-md">
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Regional & Business Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-lkr">Auto-convert USD to LKR</Label>
                  <p className="text-xs text-muted-foreground">Use live exchange rates for product pricing.</p>
                </div>
                <Switch id="auto-lkr" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metric">Use Metric Units (kg)</Label>
                  <p className="text-xs text-muted-foreground">Standardized units for export documentation.</p>
                </div>
                <Switch id="metric" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stock-alert">Low Stock Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify when products hit low stock threshold.</p>
                </div>
                <Switch id="stock-alert" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-lead">New Lead Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get alerted when a potential customer is added.</p>
                </div>
                <Switch id="new-lead" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Account Security
              </CardTitle>
              <CardDescription>Update your login credentials here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">Work Email / ID</Label>
                <Input id="user-id" value={currentUser?.email} disabled className="bg-white/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pass">New Password</Label>
                <Input 
                  id="new-pass" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="At least 6 chars" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirm Password</Label>
                <Input 
                  id="confirm-pass" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Re-enter password" 
                />
              </div>
              <Button onClick={handleUpdatePassword} className="w-full gap-2">
                <Key className="w-4 h-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border-2 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Your Live Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={currentUser?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white font-bold text-xl">
                    {currentUser?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{currentUser?.name}</p>
                  <Badge variant="secondary" className="text-[10px]">{currentUser?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
