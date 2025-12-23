import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ItemsTable } from "@/components/items/ItemsTable";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { useAuth } from "@/lib/AuthContext";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { Welcome } from "@/pages/Welcome";
import {Profile} from "@/components/profile/profile.tsx";
import {authApi} from "@/lib/auth.ts";
import {useNavigate} from "react-router-dom";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("welcome");
  const navigate = useNavigate();

  // Handle redirect on login/logout
  useEffect(() => {
    if (user) {
      setActiveTab("dashboard");
    } else {
      // Only reset to welcome if user logs out,
      // NOT when switching manually to login/register.
      if (activeTab !== "login" && activeTab !== "register") {
        setActiveTab("welcome");
      }
    }
  }, [user]);

  const handleLogout = async () => {
    await authApi.logout();
    await logout();
    setActiveTab("welcome"); // reset tab
    navigate("/");           // optional
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
      <div className="flex min-h-screen bg-background">
        <Sidebar onLogout={handleLogout}  activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
  );
};

export default Index;
