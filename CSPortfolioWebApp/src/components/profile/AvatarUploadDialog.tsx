import { useState, useRef, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/Helper/getCroppedImg";

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

    // Prevent browser file open on drag
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
            <DialogContent
                className="
          max-w-lg overflow-hidden border bg-card shadow-card p-0
        "
            >
                {/* HEADER */}
                <DialogHeader className="border-b bg-gradient-primary px-6 py-4">
                    <DialogTitle className="text-lg font-semibold text-primary-foreground">
                        Update Profile Picture
                    </DialogTitle>
                </DialogHeader>

                {/* BODY */}
                <div className="flex flex-col items-center gap-6 p-6">
                    {/* Crop Area */}
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
              relative h-72 w-72 rounded-full border
              overflow-hidden transition-colors
              ${dragOver ? "border-primary bg-primary/10" : "bg-muted"}
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
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                                Drag image here
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex w-full items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Size</span>
                            <select
                                value={size}
                                disabled={!imageSrc}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="
                  rounded-md border bg-background px-2 py-1 text-sm
                  disabled:opacity-50
                "
                            >
                                {ALLOWED_SIZES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}×{s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="secondary"
                            className="ml-auto"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Select Image
                        </Button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => e.target.files && processFile(e.target.files[0])}
                    />
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
                        disabled={!imageSrc || loading}
                        onClick={handleUpload}
                    >
                        {loading ? "Uploading..." : "Save Avatar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
