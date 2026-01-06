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
  onLogout: () => void
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({onLogout, activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  // Menu items only for logged in users
  const loggedInMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "transactions", label: "Transactions", icon: ShoppingCart },
    { id: "items", label: "Catalog", icon: BarChart3 },
  ];

  return (
      <div className="flex h-screen w-64 flex-col border-r bg-card shadow-card">
        {/* HEADER */}
        <div className="flex h-16 items-center justify-center border-b bg-gradient-primary">
          <h1 className="text-xl font-bold text-primary-foreground">
            CS2 Inventory Pro
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
                      {/* PROFILE CARD (CLICKABLE) */}
                      <button
                          onClick={() => onTabChange("profile")}
                          className={cn(
                              "flex w-full items-center gap-3 p-2 rounded-lg text-left transition-colors",
                              activeTab === "profile"
                                  ? "bg-primary text-primary-foreground shadow-primary"
                                  : "bg-secondary hover:bg-secondary/80"
                          )}
                      >
                        <img src={`${user.profileImageUrl}?v=${Date.now()}`}
                             alt={user.username?.[0]?.toUpperCase()}
                             className="h-10 w-10 rounded-full object-cover"/>

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.username}</span>
                          <span
                              className={cn(
                                      "text-xs",
                                      activeTab === "profile"
                                          ? "text-primary-foreground/80"
                                          : "text-muted-foreground"
                                  )}
                              > View profile
                            </span>
                          </div>
                      </button>

                      {/* LOGOUT */}
                      <Button
                          variant="destructive"
                          className="w-full justify-start gap-3"
                          onClick={() => onLogout()}
                      >
                          <LogOut className="h-4 w-4" />
                          Logout
                      </Button>
                  </>
              ) : (
                  <>
                      {/* LOGIN */}
                      <Button
                          variant={activeTab === "login" ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => onTabChange("login")}
                      >
                          <LogIn className="h-4 w-4" />
                          Login
                      </Button>

                      {/* REGISTER */}
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
