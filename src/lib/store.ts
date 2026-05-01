
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'SUB_ADMIN' | 'STAFF';
export type CustomerRanking = 'Normal' | 'Regular' | 'VIP' | 'VVIP';
export type CurrencyType = 'USD' | 'LKR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  hotline: string;
  email: string;
  logo: string;
  primaryColor: string;
  currency: CurrencyType;
  isRegistrationEnabled: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  birthday: string; // YYYY-MM-DD
  notes: string;
  ranking: CustomerRanking;
  avatar?: string;
  purchaseHistory: PurchaseRecord[];
}

export interface PurchaseRecord {
  id: string;
  date: string;
  amount: number;
  items: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  priceUSD: number;
  priceLKR: number;
  image: string;
  stock: number;
  maxStockCapacity: number;
  lowStockThreshold: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  items: { productId: string; quantity: number; price: number }[];
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: CurrencyType;
  status: 'Paid' | 'Pending';
}

interface AppStore {
  currentUser: User | null;
  users: User[];
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  companySettings: CompanySettings;
  
  // Auth Actions
  login: (email: string, password?: string, role?: UserRole) => boolean;
  signUp: (name: string, email: string, role: UserRole, password?: string) => void;
  logout: () => void;
  updateMyPassword: (newPassword: string) => void;
  updateProfile: (data: { name?: string; avatar?: string }) => void;
  
  // User Management (Admin only)
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  
  // Company Settings
  updateCompanySettings: (data: Partial<CompanySettings>) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'purchaseHistory'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, amount: number) => void;
  
  // Invoice Actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (id: string, status: 'Paid' | 'Pending') => void;
  deleteInvoice: (id: string) => void;
}

// Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Alba Cinnamon Grade C5', category: 'Premium Sticks', sku: 'CIN-ALB-01', priceUSD: 25.50, priceLKR: 7650, image: 'https://picsum.photos/seed/p1/400/400', stock: 150, maxStockCapacity: 1000, lowStockThreshold: 20 },
  { id: '2', name: 'Cinnamon Bark Oil 60%', category: 'Essential Oils', sku: 'OIL-BRK-01', priceUSD: 120.00, priceLKR: 36000, image: 'https://picsum.photos/seed/p2/400/400', stock: 15, maxStockCapacity: 200, lowStockThreshold: 5 },
  { id: '3', name: 'Ground Cinnamon Powder', category: 'Powder', sku: 'POW-GRD-01', priceUSD: 12.00, priceLKR: 3600, image: 'https://picsum.photos/seed/p3/400/400', stock: 850, maxStockCapacity: 1000, lowStockThreshold: 100 },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Sienna Global Traders', email: 'contact@sienna.com', phone: '+1 234 567 890', country: 'USA', birthday: '1985-06-15', notes: 'Prefers bulk shipping monthly.', ranking: 'VIP', avatar: 'https://picsum.photos/seed/customer1/200/200', purchaseHistory: [] },
  { id: '2', name: 'London Spice Co.', email: 'orders@londonspice.co.uk', phone: '+44 20 7946 0958', country: 'UK', birthday: '1990-11-20', notes: 'Sensitive to moisture levels.', ranking: 'Regular', avatar: 'https://picsum.photos/seed/customer2/200/200', purchaseHistory: [] },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: 'admin1', name: 'Admin User', email: 'admin@cinnamon.com', role: 'ADMIN', password: 'password123' },
        { id: 'staff1', name: 'Staff User', email: 'staff@cinnamon.com', role: 'STAFF', password: 'password123' },
      ],
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      invoices: [],
      companySettings: {
        name: 'Cinnamon Lanka Exports',
        address: 'No. 123, Galle Road, Colombo, Sri Lanka',
        hotline: '+94 11 234 5678',
        email: 'info@cinnamonlanka.com',
        logo: '',
        primaryColor: '20 50% 47%', 
        currency: 'USD',
        isRegistrationEnabled: true,
      },

      login: (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const user = get().users.find(u => u.email.toLowerCase() === cleanEmail);
        
        if (user && user.password === password) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      signUp: (name, email, role, password) => set((state) => {
        const newUser: User = { 
          id: Math.random().toString(36).substr(2, 9), 
          name: name.trim(), 
          email: (email || '').trim().toLowerCase(), 
          role, 
          password,
          avatar: `https://picsum.photos/seed/${name.trim()}/200/200`
        };
        return {
          users: [...state.users, newUser],
          currentUser: newUser
        };
      }),

      logout: () => set({ currentUser: null }),
      
      updateMyPassword: (newPassword) => set((state) => {
        if (!state.currentUser) return state;
        const updatedUsers = state.users.map(u => 
          u.id === state.currentUser?.id ? { ...u, password: newPassword } : u
        );
        return {
          users: updatedUsers,
          currentUser: { ...state.currentUser, password: newPassword }
        };
      }),

      updateProfile: (data) => set((state) => {
        if (!state.currentUser) return state;
        const updatedUser = { ...state.currentUser, ...data };
        const updatedUsers = state.users.map(u => 
          u.id === state.currentUser?.id ? { ...u, ...data } : u
        );
        return {
          users: updatedUsers,
          currentUser: updatedUser
        };
      }),

      addUser: (u) => set((state) => ({
        users: [...state.users, { ...u, id: Math.random().toString(36).substr(2, 9), email: (u.email || '').trim().toLowerCase() }]
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      updateCompanySettings: (data) => set((state) => ({
        companySettings: { ...state.companySettings, ...data }
      })),

      addCustomer: (c) => set((state) => ({
        customers: [...state.customers, { ...c, id: Math.random().toString(36).substr(2, 9), purchaseHistory: [] }]
      })),
      updateCustomer: (id, data) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),

      addProduct: (p) => set((state) => ({
        products: [...state.products, { ...p, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateProduct: (id, data) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      adjustStock: (id, amount) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p)
      })),

      addInvoice: (invoice) => set((state) => {
        const nextNum = state.invoices.length + 1001;
        const inv = { 
          ...invoice, 
          id: Math.random().toString(36).substr(2, 9), 
          invoiceNumber: `INV-${nextNum}`,
          currency: state.companySettings.currency
        };
        
        const updatedProducts = state.products.map(p => {
          const item = invoice.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: p.stock - item.quantity };
          return p;
        });

        return {
          invoices: [...state.invoices, inv],
          products: updatedProducts
        };
      }),
      updateInvoiceStatus: (id, status) => set((state) => ({
        invoices: state.invoices.map(i => i.id === id ? { ...i, status } : i)
      })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(i => i.id !== id)
      })),
    }),
    {
      name: 'cinnamon-link-pro-storage-v4',
    }
  )
);
