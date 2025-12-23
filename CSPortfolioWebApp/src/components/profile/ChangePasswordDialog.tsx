import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: Props) => {
    const { changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async () => {
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            onOpenChange(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err?.message ?? "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md overflow-hidden border bg-card shadow-card p-0">
                {/* HEADER */}
                <DialogHeader className="border-b bg-gradient-primary px-6 py-4">
                    <DialogTitle className="text-lg font-semibold text-primary-foreground">
                        Change Password
                    </DialogTitle>
                </DialogHeader>

                {/* BODY */}
                <div className="space-y-4 p-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Current password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">New password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Confirm new password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex gap-3 border-t bg-secondary/30 px-6 py-4">
                    <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 shadow-primary"
                        disabled={loading}
                        onClick={onSubmit}
                    >
                        {loading ? "Saving..." : "Update Password"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
