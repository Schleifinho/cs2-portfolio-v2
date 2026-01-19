import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { AvatarUploadDialog } from "./AvatarUploadDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { CheckCircle, AlertTriangle, ShieldCheck, Mail, User, Camera, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Profile = () => {
    const { user, resendVerificationEmail } = useAuth();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (cooldown === 0) return;
        const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    if (!user) return null;

    const COOLDOWN_SECONDS = 60;

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

    const getPriorityRole = () => {
        // Priority order: Admin > Mod > Normal
        // NoEmailVerification is a status we show only if they aren't staff
        if (user.roles.includes("Admin")) return { label: "Administrator", color: "text-red-500 bg-red-500/10 border-red-500/20" };
        if (user.roles.includes("Mod")) return { label: "Moderator", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
        if (user.roles.includes("NoEmailVerification")) return { label: "Pending Verification", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
        return { label: "Member", color: "text-primary bg-primary/10 border-primary/20" };
    };

    return (
      <div className="flex flex-col flex-1 min-h-0 w-full max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
          {/* HEADER */}
          <div className="flex flex-col gap-1 shrink-0 px-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Account Settings
              </h2>
              <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      Security • Personal Information
                  </p>
              </div>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden min-w-0 w-full">
              <div className="p-4 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

                      {/* LEFT: AVATAR SECTION */}
                      <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
                          <div className="relative group">
                              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse group-hover:hidden" />
                              <img
                                src={`${user.profileImageUrl}?v=${Date.now()}`}
                                alt={user.username?.[0]?.toUpperCase()}
                                className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-lg relative z-10"
                              />
                              <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 rounded-full h-9 w-9 border shadow-sm z-20"
                                onClick={() => setAvatarOpen(true)}
                              >
                                  <Camera className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>

                      {/* RIGHT: USER INFO SECTION */}
                      <div className="flex flex-col space-y-4 min-w-0">
                          <div className="space-y-1 text-center md:text-left">
                              <div className="flex flex-col md:flex-row md:items-center gap-2">
                                  <h3 className="text-2xl font-black tracking-tight truncate">
                                      {user.username}
                                  </h3>

                              </div>
                              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="text-sm font-medium truncate">{user.email}</span>
                                  {user.confirmedEmail ? (
                                    <Badge className="w-fit mx-auto md:mx-0 bg-green-500/10 text-green-600 border-green-500/20 text-[10px] uppercase font-black">
                                        Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="w-fit mx-auto md:mx-0 bg-red-500/10 text-red-600 border-red-500/20 text-[10px] uppercase font-black animate-pulse">
                                        Unverified
                                    </Badge>
                                  )}
                              </div>
                          </div>

                          {/* EMAIL VERIFICATION ALERT */}
                          {!user.confirmedEmail && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <div className="flex-1 text-xs font-bold text-center sm:text-left">
                                    Your email is not verified. Check your inbox to secure your account.
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleResend}
                                  disabled={sending || cooldown > 0}
                                  className="h-8 text-[10px] font-black uppercase border-amber-500/30 hover:bg-amber-500/10"
                                >
                                    {sending ? "Sending..." : cooldown > 0 ? `${cooldown}s` : "Resend Link"}
                                </Button>
                            </div>
                          )}

                          {/* ACTION BUTTONS */}
                          <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 text-xs font-bold gap-2 flex-1 sm:flex-none"
                                onClick={() => setPasswordOpen(true)}
                              >
                                  <Lock className="h-3.5 w-3.5" />
                                  Change Password
                              </Button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* FOOTER STATS (Visual only to match dashboard style) */}
              <div className="grid grid-cols-2 border-t bg-muted/5">
                  <div className="p-4 text-center border-r">
                      <span className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest">Status</span>
                      <span className="text-sm font-bold flex items-center justify-center gap-1.5 mt-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Active
                        </span>
                  </div>
                  <div className="p-4 text-center">
                      <span className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest">Role</span>
                      <span className="text-sm font-bold mt-1 block">{getPriorityRole().label}</span>
                  </div>
              </div>
          </div>

          <AvatarUploadDialog open={avatarOpen} onOpenChange={setAvatarOpen} />
          <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      </div>
    );
};