
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  History, 
  BarChart3, 
  Settings, 
  LogOut,
  Warehouse,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Sales History', href: '/sales', icon: History },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const adminItems = [
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, currentUser, companySettings } = useAppStore();
  const defaultLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-14 h-14 relative bg-white rounded-xl flex items-center justify-center p-1 shadow-sm border border-primary/10 overflow-hidden shrink-0">
            <Image 
              src={companySettings.logo || defaultLogo} 
              alt={companySettings.name} 
              width={50} 
              height={50} 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold leading-tight tracking-tight truncate">{companySettings.name}</h1>
            <span className="text-[9px] uppercase font-bold text-primary tracking-tighter opacity-80 shrink-0">CRM Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-3 py-2">
          General
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "" : "opacity-70 group-hover:opacity-100")} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {currentUser?.role === 'ADMIN' && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-3 py-2 mt-6">
              Administration
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm",
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "" : "opacity-70 group-hover:opacity-100")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-medium overflow-hidden border">
            {currentUser?.avatar ? (
              <Image src={currentUser.avatar} alt={currentUser.name} width={32} height={32} className="object-cover h-full w-full" />
            ) : (
              currentUser?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{currentUser?.name}</span>
            <span className="text-[10px] uppercase tracking-wide opacity-50">{currentUser?.role}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 h-9"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">Logout</span>
        </Button>
      </div>
    </div>
  );
}
