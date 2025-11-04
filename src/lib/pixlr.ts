/**
 * Pixlr Editor Integration
 * Opens images in Pixlr's online editor
 */

interface PixlrOptions {
  image: string;
  title?: string;
  method?: 'get' | 'post';
  service?: 'express' | 'editor' | 'e';
}

/**
 * Opens an image in Pixlr editor
 * @param options Configuration for Pixlr editor
 * @returns Promise that resolves when editor is opened
 */
export function openPixlrEditor(options: PixlrOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      image,
      title = 'Edit Image',
      method = 'get',
      service = 'e' // 'e' is the modern Pixlr E editor
    } = options;

    try {
      // Create a unique identifier for this edit session
      const sessionId = `pixlr_${Date.now()}`;

      // Build Pixlr URL with parameters
      const pixlrUrl = new URL(`https://pixlr.com/${service}/`);

      // Add image parameter (for base64, we need to use POST method via form)
      if (image.startsWith('data:')) {
        // For base64 images, we need to use a different approach
        // Open Pixlr and let user upload or create
        window.open(pixlrUrl.toString(), '_blank', 'width=1200,height=800');

        // Provide instructions to user
        alert('Pixlr editor will open in a new window. Please:\n1. Create a new image or upload your generated image\n2. Make your edits\n3. Download the edited image\n4. Upload it back to your post');

        resolve(image); // Return original image
      } else {
        // For URL-based images
        pixlrUrl.searchParams.append('image', image);
        pixlrUrl.searchParams.append('title', title);
        pixlrUrl.searchParams.append('method', method);

        // Open in new window
        window.open(pixlrUrl.toString(), '_blank', 'width=1200,height=800');

        // Note: Pixlr doesn't provide a callback mechanism for free tier
        // User will need to download and re-upload manually
        resolve(image);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert base64 image to blob URL for Pixlr
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Download image for manual Pixlr editing
 */
export function downloadImageForPixlr(imageUrl: string, filename = 'generated-image.jpg') {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
