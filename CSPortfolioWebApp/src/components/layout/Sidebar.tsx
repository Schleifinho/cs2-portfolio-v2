import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();

  // Menu items only for logged in users
  const loggedInMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "items", label: "Items", icon: BarChart3 },
    { id: "transactions", label: "Transactions", icon: ShoppingCart },
  ];

  return (
      <div className="flex h-screen w-64 flex-col border-r bg-card shadow-card">
        {/* HEADER */}
        <div className="flex h-16 items-center justify-center border-b bg-gradient-primary">
          <h1 className="text-xl font-bold text-primary-foreground">
            Inventory Pro
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 p-4">
          {user &&
              loggedInMenuItems.map((item) => {
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

        {/* FOOTER SECTION (AUTH AREA) */}
        <div className="border-t p-4 mt-auto flex flex-col gap-3">
          {user ? (
              <>
                {/* PROFILE SECTION */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                  <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                  Logged in
                </span>
                  </div>
                </div>

                {/* LOGOUT BUTTON */}
                <Button
                    variant="destructive"
                    className="w-full justify-start gap-3"
                    onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
          ) : (
              <>
                {/* LOGIN BUTTON */}
                <Button
                    variant={activeTab === "login" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => onTabChange("login")}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>

                {/* REGISTER BUTTON */}
                <Button
                    variant={activeTab === "register" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => onTabChange("register")}
                >
                  <User className="h-4 w-4" />
                  Register
                </Button>
              </>
          )}
        </div>
      </div>
  );
}
