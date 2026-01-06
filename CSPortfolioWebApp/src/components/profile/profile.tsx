import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { AvatarUploadDialog } from "./AvatarUploadDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { CheckCircle, AlertTriangle } from "lucide-react";

export const Profile = () => {
    const { user, resendVerificationEmail, refreshUser } = useAuth();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    if (!user) return null;

    const COOLDOWN_SECONDS = 60;

    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending] = useState(false);

    const handleResend = async () => {
        if (cooldown > 0) return;

        setSending(true);
        try {
            await resendVerificationEmail();
            setCooldown(COOLDOWN_SECONDS);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (cooldown === 0) return;

        const interval = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>

            <div className="flex gap-6 rounded-xl border bg-card p-6 shadow-card">
                {/* AVATAR */}
                <div className="relative shrink-0 ">
                    <img
                        src={`${user.profileImageUrl}?v=${Date.now()}`}
                        alt={user.username?.[0]?.toUpperCase()}
                        className="h-32 w-32 rounded-full border object-cover"
                    />
                </div>

                {/* INFO */}
                <div className="flex flex-1 flex-col justify-between">
                    <div className="space-y-1">
                        <div className="text-lg font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>

                        {/* EMAIL STATUS */}
                        {user.confirmedEmail ? (
                            <div className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-sm text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span>Email verified</span>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-400 px-2 py-1 text-sm text-yellow-800">
                                <AlertTriangle className="h-4 w-4 shrink-0"/>
                                <span>Email not verified</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleResend}
                                    disabled={sending || cooldown > 0}
                                    className="text-xs px-2 py-1 bg-yellow-800 text-yellow-400 leading-none h-auto"
                                >
                                    {sending ? "Sending..." : cooldown > 0 ? `Resend again in ${cooldown}s` : "Resend"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 flex gap-2">
                        {/* Change Image */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAvatarOpen(true)}
                        >
                            Change Image
                        </Button>

                        {/* Change Password */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPasswordOpen(true)}
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </div>

            {/* DIALOGS */}
            <AvatarUploadDialog open={avatarOpen} onOpenChange={setAvatarOpen} />
            <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
        </div>
    );
};
