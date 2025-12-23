import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

export const VerifyEmail = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { confirmEmailVerification, refreshUser } = useAuth();

    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        const token = params.get("token");

        if (!token) {
            setStatus("error");
            return;
        }

        confirmEmailVerification(token)
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"));
    }, [params]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-card text-center space-y-6">
                {/* HEADER */}
                <h1 className="text-2xl font-semibold">Email verification</h1>

                {/* STATUS */}
                <div
                    className={cn(
                        "flex flex-col items-center gap-3",
                        status === "loading" && "text-muted-foreground",
                        status === "success" && "text-green-600",
                        status === "error" && "text-destructive"
                    )}
                >
                    {status === "loading" && (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin" />
                            <p>Verifying your email…</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle className="h-10 w-10" />
                            <p>Your email has been successfully verified.</p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="h-10 w-10" />
                            <p>This verification link is invalid or has expired.</p>
                        </>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="pt-2">
                    <Button
                        className="w-full"
                        onClick={async () => {
                            if (refreshUser) {
                                await refreshUser(); // fetch latest user state
                            }
                            navigate("/"); // then navigate home
                        }}
                    >
                        Return to homepage
                    </Button>
                </div>
            </div>
        </div>
    );
};
