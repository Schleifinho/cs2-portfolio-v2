import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ItemsTable } from "@/components/items/ItemsTable";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { Welcome } from "@/pages/Welcome";
import { Profile } from "@/components/profile/profile.tsx";
import { useAuth } from "@/lib/AuthContext";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("welcome");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect `/` to dashboard if user is logged in
  useEffect(() => {
    if (location.pathname === "/" && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, user, navigate]);

  // Update activeTab based on URL (supports back/forward)
  useEffect(() => {
    const path = location.pathname.replace("/", "");

    if (
        ["dashboard", "inventory", "transactions", "items", "profile"].includes(path)
    ) {
      setActiveTab(path);
    } else if (["login", "register", "welcome"].includes(path)) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  // Redirect logged-in users away from login/register pages
  useEffect(() => {
    if (user && ["login", "register"].includes(location.pathname.replace("/", ""))) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = async () => {
    await logout();
    setActiveTab("welcome");
    navigate("/", { replace: true }); // redirect to welcome after logout
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryTable />;
      case "transactions":
        return <TransactionsTable />;
      case "items":
        return <ItemsTable />;
      case "profile":
        return <Profile />;
      case "login":
        return <Login onTabChange={setActiveTab} />;
      case "register":
        return <Register onTabChange={setActiveTab} />;
      case "welcome":
      default:
        return <Welcome onTabChange={setActiveTab} />;
    }
  };

  return (
      <SidebarProvider>
        <div className="flex min-h-svh w-full bg-background">
          <AppSidebar
              onLogout={handleLogout}
              activeTab={activeTab}
          />

          <SidebarInset>
            {/* Top bar */}
            <div className="flex h-14 items-center gap-3 border-b px-4">
              <SidebarTrigger />
              <h2 className="text-sm font-medium capitalize">{activeTab}</h2>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 sm:p-6">{renderContent()}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
  );
};

export default Index;
