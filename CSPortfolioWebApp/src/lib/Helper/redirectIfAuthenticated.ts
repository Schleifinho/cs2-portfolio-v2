import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    return user ? null : children;
};
