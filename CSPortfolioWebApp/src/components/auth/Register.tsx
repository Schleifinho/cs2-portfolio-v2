import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { UserRegisterDto } from "@/types/Auth";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RegisterProps {
    onTabChange: (tab: string) => void;
}

export const Register = ({ onTabChange }: RegisterProps) => {
    const { register } = useAuth();
    const [form, setForm] = useState<UserRegisterDto>({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await register(form);
        } catch {
            setError("Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-full items-center justify-center p-6">
            <div className="animate-fadeIn w-full max-w-md">
                <Card className="shadow-lg border-border/40">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                        <CardDescription>
                            Fill in your details to get started.
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
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
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

                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating account..." : "Register"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="text-sm text-muted-foreground text-center block">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onTabChange("login")}
                            className="underline text-primary hover:text-primary/80"
                        >
                            Login
                        </button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
