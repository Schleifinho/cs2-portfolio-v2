export default function getCroppedImg(imageSrc: string, crop: any, size: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get context");

            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                size,
                size
            );

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject("Failed to convert canvas to blob");
            }, "image/png");
        };
        image.onerror = reject;
    });
}
