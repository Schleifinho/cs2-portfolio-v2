import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { AvatarUploadDialog } from "./AvatarUploadDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export const Profile = () => {
    const { user } = useAuth();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>

            <div className="flex gap-6 rounded-xl border bg-card p-6 shadow-card">
                {/* AVATAR */}
                <div className="relative shrink-0">
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${user.profileImageUrl}?v=${Date.now()}`}
                        alt={user.username?.[0]?.toUpperCase()}
                        className="h-32 w-32 rounded-full border object-cover"
                    />

                    <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0"
                        onClick={() => setAvatarOpen(true)}
                    >
                        Change
                    </Button>
                </div>

                {/* INFO */}
                <div className="flex flex-1 flex-col justify-between">
                    <div className="space-y-1">
                        <div className="text-lg font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>

                    <div className="pt-4">
                        <Button variant="outline" onClick={() => setPasswordOpen(true)}>
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
