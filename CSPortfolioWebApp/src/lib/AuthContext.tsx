import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/auth";
import { UserLoginDto, UserRegisterDto, UserDto } from "@/types/Auth";

interface AuthContextType {
    user: UserDto | null;
    login: (data: UserLoginDto) => Promise<void>;
    register: (data: UserRegisterDto) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserDto | null>(null);

    const fetchUser = async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
        } catch {
            setUser(null); // invalid token → user logged out
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (data: UserLoginDto) => {
        await authApi.login(data);
        await fetchUser();
    };

    const register = async (data: UserRegisterDto) => {
        await authApi.register(data);
        await fetchUser();
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
