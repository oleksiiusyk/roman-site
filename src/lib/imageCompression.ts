interface CompressedImages {
  full: Blob;
  thumbnail: Blob;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function resizeToCanvas(
  img: HTMLImageElement,
  maxSize: number,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let { width, height } = img;

    // Only downscale, never upscale
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to JPEG if format not supported
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Failed to compress image'));
            },
            'image/jpeg',
            quality
          );
        }
      },
      format,
      quality
    );
  });
}

export async function compressImage(file: File): Promise<CompressedImages> {
  const img = await loadImage(file);

  const [full, thumbnail] = await Promise.all([
    resizeToCanvas(img, 1920, 'image/webp', 0.82),
    resizeToCanvas(img, 480, 'image/webp', 0.75),
  ]);

  return { full, thumbnail };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
