
'use client';

import { Bell, Search, Plus, UserPlus, FilePlus, PackagePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold capitalize">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search records, products..." 
            className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 h-9 shadow-sm" size="sm">
              <Plus className="w-4 h-4" />
              <span>Quick Create</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>New Transaction</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/invoices')}>
              <FilePlus className="w-4 h-4 text-blue-500" />
              <span>Invoice</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/customers')}>
              <UserPlus className="w-4 h-4 text-green-500" />
              <span>Customer</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/products')}>
              <PackagePlus className="w-4 h-4 text-orange-500" />
              <span>Product</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
