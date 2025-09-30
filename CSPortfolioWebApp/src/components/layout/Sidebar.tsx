import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  BarChart3
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'items', label: 'Items', icon: BarChart3 },
    { id: 'prices', label: 'Price History', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card shadow-card">
      <div className="flex h-16 items-center justify-center border-b bg-gradient-primary">
        <h1 className="text-xl font-bold text-primary-foreground">
          Inventory Pro
        </h1>
      </div>
      
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-primary" 
                  : "hover:bg-secondary"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}