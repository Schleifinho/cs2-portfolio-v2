import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ItemsTable } from "@/components/items/ItemsTable";
import { PriceHistoryChart } from "@/components/prices/PriceHistoryChart";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryTable />;
      case "items":
        return <ItemsTable />;
      case "prices":
        return <PriceHistoryChart />;
      case "transactions":
        return <TransactionsTable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default Index;
