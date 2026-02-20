/**
 * TinyPNG API Service
 *
 * Compresses PNG and JPEG images using the TinyPNG API.
 * In development, requests are proxied through Vite's dev server.
 * In production, you'll need a serverless function to handle the API calls.
 */

export interface TinyPNGResult {
  blob: Blob;
  inputSize: number;
  outputSize: number;
  inputType: string;
  outputType: string;
}

export interface TinyPNGError {
  error: string;
  message: string;
}

/**
 * Compresses an image using the TinyPNG API
 * @param file - The image file to compress (PNG or JPEG)
 * @returns The compressed image blob and metadata
 */
export async function compressWithTinyPNG(file: File): Promise<TinyPNGResult> {
  console.log(`[TinyPNG] Starting compression: ${file.name} (${file.size} bytes)`);

  // Step 1: Upload the image to TinyPNG for compression
  const uploadResponse = await fetch('/api/tinypng?path=shrink', {
    method: 'POST',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    const errorData = (await uploadResponse.json()) as TinyPNGError;
    console.error('[TinyPNG] Upload failed:', errorData);
    throw new Error(errorData.message || `TinyPNG error: ${uploadResponse.status}`);
  }

  // Get the location of the compressed image
  const locationUrl = uploadResponse.headers.get('Location');
  if (!locationUrl) {
    throw new Error('TinyPNG did not return a location header');
  }

  // Parse the response to get compression stats
  const uploadResult = await uploadResponse.json();
  console.log('[TinyPNG] Compression complete:', uploadResult);

  // Step 2: Download the compressed image
  // The location URL is absolute — extract the path (e.g., /output/abc123)
  // and pass it as a query parameter to our proxy.
  const outputPath = new URL(locationUrl).pathname;

  const downloadResponse = await fetch(`/api/tinypng?path=${encodeURIComponent(outputPath.replace(/^\//, ''))}`, {
    method: 'GET',
  });

  if (!downloadResponse.ok) {
    throw new Error(`Failed to download compressed image: ${downloadResponse.status}`);
  }

  const compressedBlob = await downloadResponse.blob();

  console.log(
    `[TinyPNG] Downloaded: ${compressedBlob.size} bytes (saved ${file.size - compressedBlob.size} bytes)`
  );

  return {
    blob: compressedBlob,
    inputSize: uploadResult.input?.size || file.size,
    outputSize: compressedBlob.size,
    inputType: uploadResult.input?.type || file.type,
    outputType: uploadResult.output?.type || file.type,
  };
}


