import { useState, useRef, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/Helper/getCroppedImg";
import { UserCircle, UploadCloud, Move, ZoomIn, ShieldCheck, Image as ImageIcon, Check } from "lucide-react";
import {Label} from "@/components/ui/label.tsx";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ALLOWED_SIZES = [64, 128, 256, 512];

export const AvatarUploadDialog = ({ open, onOpenChange }: Props) => {
    const { uploadAvatar } = useAuth();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [size, setSize] = useState(512);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const prevent = (e: DragEvent) => e.preventDefault();
        window.addEventListener("dragover", prevent);
        window.addEventListener("drop", prevent);
        return () => {
            window.removeEventListener("dragover", prevent);
            window.removeEventListener("drop", prevent);
        };
    }, []);

    const onCropComplete = useCallback((_: any, cropped: any) => {
        setCroppedAreaPixels(cropped);
    }, []);

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels, size);
            const file = new File([blob], "avatar.png", { type: "image/png" });
            await uploadAvatar(file);
            onOpenChange(false);
            setImageSrc(null);
        } finally {
            setLoading(false);
        }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md overflow-hidden p-0 border-border/60 gap-0">
              {/* HEADER: Strategic Terminal Style */}
              <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/5">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                          <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                          <DialogTitle className="text-xl font-black uppercase tracking-tight">
                              Identity Branding
                          </DialogTitle>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              Profile Asset Calibration
                          </p>
                      </div>
                  </div>
              </DialogHeader>

              {/* BODY: The Calibration Chamber */}
              <div className="flex flex-col items-center gap-6 p-6">
                  <div
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`
                            relative h-64 w-64 rounded-full border-2 border-dashed
                            overflow-hidden transition-all duration-300 shadow-inner
                            ${dragOver ? "border-primary bg-primary/5 scale-105" : "border-border/60 bg-muted/20"}
                            ${imageSrc ? "border-solid border-primary/40" : ""}
                        `}
                  >
                      {imageSrc ? (
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2">
                            <UploadCloud className="h-10 w-10 text-muted-foreground/40" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drop Image Here</p>
                                <p className="text-[9px] text-muted-foreground/60">PNG, JPG or WEBP supported</p>
                            </div>
                        </div>
                      )}
                  </div>

                  {/* INTERFACE CONTROLS */}
                  <div className="w-full space-y-4">
                      <div className="flex flex-col gap-2">
                          <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-1.5">
                              <ShieldCheck className="h-3 w-3" /> Output Resolution (px)
                          </Label>
                          <div className="grid grid-cols-4 gap-2">
                              {ALLOWED_SIZES.map((s) => (
                                <button
                                  key={s}
                                  disabled={!imageSrc}
                                  onClick={() => setSize(s)}
                                  className={`
                                            py-2 rounded-md border text-[10px] font-mono font-bold transition-all
                                            ${size === s
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background text-muted-foreground border-border/60 hover:border-primary/40"}
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                        `}
                                >
                                    {s}
                                </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-muted-foreground/60">
                              <div className="flex items-center gap-1">
                                  <Move className="h-3 w-3" />
                                  <span className="text-[9px] font-bold uppercase">Drag to Pan</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <ZoomIn className="h-3 w-3" />
                                  <span className="text-[9px] font-bold uppercase">Scroll to Zoom</span>
                              </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-black uppercase tracking-widest border-muted-foreground/20"
                            onClick={() => fileInputRef.current?.click()}
                          >
                              <ImageIcon className="h-3 w-3 mr-2" /> Browse
                          </Button>
                      </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files && processFile(e.target.files[0])}
                  />
              </div>

              {/* FOOTER: Professional Action Bar */}
              <div className="flex gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
                  <Button
                    variant="ghost"
                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-10"
                    onClick={() => onOpenChange(false)}
                  >
                      Abort
                  </Button>
                  <Button
                    className="flex-1 h-10 shadow-md text-[10px] font-black uppercase tracking-widest gap-2"
                    disabled={!imageSrc || loading}
                    onClick={handleUpload}
                  >
                      {loading ? "Processing..." : (
                        <><Check className="h-3.5 w-3.5" /> Deploy Avatar</>
                      )}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    );
};