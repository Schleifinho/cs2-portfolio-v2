import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/auth";
import {UserLoginDto, UserRegisterDto, UserDto, ChangePasswordRequestDto} from "@/types/Auth";

interface AuthContextType {
    user: UserDto | null;
    login: (data: UserLoginDto) => Promise<void>;
    register: (data: UserRegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    changePassword: (dto: ChangePasswordRequestDto) => Promise<void>;
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

    const uploadAvatar = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        await authApi.uploadAvatar(formData);
        await fetchUser(); // 🔥 REFRESH USER
    };

    const changePassword = async (dto: ChangePasswordRequestDto) => {
        await authApi.changePassword(dto);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, uploadAvatar, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
