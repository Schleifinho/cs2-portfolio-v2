import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { UserLoginDto } from "@/types/Auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginProps {
    onTabChange: (tab: string) => void;
}

export const Login = ({ onTabChange }: LoginProps) => {
    const { login } = useAuth();
    const [form, setForm] = useState<UserLoginDto>({
        username: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(form);
        } catch {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-full items-center justify-center p-6">
            <div className="animate-fadeIn w-full max-w-md">
                <Card className="shadow-lg border-border/40">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your dashboard.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {error && (
                            <div className="text-red-500 text-sm bg-red-100/50 border border-red-300 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="johndoe"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="text-sm text-muted-foreground text-center block">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onTabChange("register")}
                            className="underline text-primary hover:text-primary/80"
                        >
                            Register
                        </button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
