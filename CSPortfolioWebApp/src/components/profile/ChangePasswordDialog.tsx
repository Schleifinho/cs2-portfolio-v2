import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { ShieldAlert, KeyRound, Lock, Fingerprint, ShieldCheck, AlertCircle } from "lucide-react";

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
            setError("Confirmation mismatch: New passwords do not align.");
            return;
        }
        setLoading(true);
        try {
            await changePassword({ currentPassword, newPassword, confirmPassword });
            onOpenChange(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err?.message ?? "Security protocol update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md overflow-hidden p-0 border-border/60 gap-0 shadow-2xl">
              {/* HEADER: Security Terminal Style */}
              <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/5">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                          <ShieldAlert className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                          <DialogTitle className="text-xl font-black uppercase tracking-tight">
                              Security Protocol
                          </DialogTitle>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              Credential Authorization Update
                          </p>
                      </div>
                  </div>
              </DialogHeader>

              {/* BODY: Credential Inputs */}
              <div className="p-6 space-y-6">
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                              <KeyRound className="h-3 w-3" /> Current Password
                          </Label>
                          <Input
                            type="password"
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-mono"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                      </div>

                      {/* Divider with Icon */}
                      <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
                          <div className="relative flex justify-center text-[9px] uppercase font-black bg-card px-2 text-muted-foreground/40 tracking-widest">
                              New Security Layer
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                              <Lock className="h-3 w-3" /> New Password
                          </Label>
                          <Input
                            type="password"
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-mono"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                      </div>

                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                              <Fingerprint className="h-3 w-3" /> Confirm Password
                          </Label>
                          <Input
                            type="password"
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-mono"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                      </div>
                  </div>

                  {/* Dynamic Error Messaging */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-destructive uppercase tracking-tight leading-tight">
                            {error}
                        </p>
                    </div>
                  )}
              </div>

              {/* FOOTER: Action Bar */}
              <div className="flex gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
                  <Button
                    variant="ghost"
                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-10 hover:bg-muted"
                    onClick={() => onOpenChange(false)}
                  >
                      Abort
                  </Button>
                  <Button
                    className="flex-1 h-10 shadow-md text-[10px] font-black uppercase tracking-widest gap-2"
                    disabled={loading || !newPassword}
                    onClick={onSubmit}
                  >
                      {loading ? (
                        "Re-Encrypting..."
                      ) : (
                        <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Update Credentials
                        </>
                      )}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    );
};