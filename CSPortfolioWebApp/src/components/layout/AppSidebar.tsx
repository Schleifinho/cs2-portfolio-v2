import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, BarChart3, ShoppingCart, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
    onLogout: () => void;
    activeTab: string;
}

export function AppSidebar({ onLogout, activeTab }: AppSidebarProps) {
    const { user } = useAuth();
    const { isMobile, setOpenMobile } = useSidebar();
    const navigate = useNavigate();

    const sidebarItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "inventory", label: "Inventory", icon: Package },
        { id: "transactions", label: "Transactions", icon: ShoppingCart },
        { id: "items", label: "Catalog", icon: BarChart3 },
    ];

    const handleNavigate = (tab: string) => {
        navigate(`/${tab}`);
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar collapsible="offcanvas" className="flex flex-col h-full">
            {/* HEADER */}
            <SidebarHeader className="border-b bg-gradient-primary">
                <h1 className="px-3 py-2 text-lg font-bold text-primary-foreground">CS2 Inventory Pro</h1>
            </SidebarHeader>

            {/* NAVIGATION */}
            <SidebarContent className="flex-1 overflow-auto p-3">
                <SidebarMenu>
                    {user &&
                        sidebarItems.map((item) => (
                            <SidebarMenuItem key={item.id}>
                                <SidebarMenuButton
                                    size="lg"
                                    onClick={() => handleNavigate(item.id)}
                                    data-active={activeTab === item.id}
                                    className="justify-start gap-3"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                </SidebarMenu>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="shrink-0 border-t p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                <SidebarMenu>
                    {user ? (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    onClick={() => handleNavigate("profile")}
                                    data-active={activeTab === "profile"}
                                    className="justify-start gap-3"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    onClick={() => {
                                        onLogout();
                                        if (isMobile) setOpenMobile(false);
                                    }}
                                    className="justify-start gap-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" onClick={() => handleNavigate("login")} className="justify-start gap-3">
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" onClick={() => handleNavigate("register")} className="justify-start gap-3">
                                    <User className="h-4 w-4" />
                                    Register
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
