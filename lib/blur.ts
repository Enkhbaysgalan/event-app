export async function getBlurDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Tiny canvas — blur doesn't need resolution
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 8, 8);
        resolve(canvas.toDataURL("image/webp", 0.5));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}