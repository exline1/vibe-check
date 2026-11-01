import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Converts a File or Blob object into a base64 Data URL string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Fast client-side image optimization & compression using HTML5 Canvas / createImageBitmap.
 * Scales large photos (e.g. 10MB 4K) down to max 1600px and compresses to quality JPEG/WebP.
 * Shrinks payload by 90-98% in < 50ms, drastically speeding up upload and AI response time.
 */
export async function optimizeImage(file, maxDimension = 1600, quality = 0.82) {
  // SVG: preserve vector format as base64 data url directly
  if (file.type === 'image/svg+xml') {
    return fileToBase64(file);
  }

  // Small animated GIF (< 2MB): keep intact to preserve frame animations
  if (file.type === 'image/gif' && file.size < 2 * 1024 * 1024) {
    return fileToBase64(file);
  }

  // If already lightweight (< 150KB) and JPEG/WebP, keep as is for speed
  if (file.size < 150 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return fileToBase64(file);
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let drawable = null;

    // Fast non-blocking decode off the main thread if createImageBitmap is available
    if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
      try {
        drawable = await window.createImageBitmap(file);
        sourceWidth = drawable.width;
        sourceHeight = drawable.height;
      } catch (bitmapErr) {
        drawable = null;
      }
    }

    // Fallback: standard Image object
    if (!drawable) {
      const dataUrl = await fileToBase64(file);
      drawable = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });
      sourceWidth = drawable.naturalWidth || drawable.width || 800;
      sourceHeight = drawable.naturalHeight || drawable.height || 600;
    }

    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' });
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);

    // Clean up bitmap resources if applicable
    if (drawable && typeof drawable.close === 'function') {
      drawable.close();
    }

    // Use JPEG for best compression & speed, or PNG if transparent small
    const isPng = file.type === 'image/png';
    let outputFormat = isPng ? 'image/png' : 'image/jpeg';
    let result = canvas.toDataURL(outputFormat, quality);

    // If PNG output is still hefty (> 1.2MB), convert to JPEG 0.85
    if (isPng && result.length > 1.2 * 1024 * 1024) {
      result = canvas.toDataURL('image/jpeg', quality);
    }

    return result;
  } catch (err) {
    console.warn("Optimized image compression fallback to standard base64:", err);
    return fileToBase64(file);
  }
}

/**
 * Creates an ultra-lightweight thumbnail (~2-5KB) for instant UI previews & chat bubbles
 */
export async function createThumbnail(sourceDataUrlOrFile, size = 120) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const src = typeof sourceDataUrlOrFile === 'string'
      ? sourceDataUrlOrFile
      : URL.createObjectURL(sourceDataUrlOrFile);

    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = src;
    });

    const minDim = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const sx = ((img.naturalWidth || img.width) - minDim) / 2;
    const sy = ((img.naturalHeight || img.height) - minDim) / 2;

    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
    
    if (typeof sourceDataUrlOrFile !== 'string') {
      URL.revokeObjectURL(src);
    }

    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    return typeof sourceDataUrlOrFile === 'string' ? sourceDataUrlOrFile : '';
  }
}

/**
 * Extracts raw text from a plain text file (.txt, .md, .csv, .log, .json)
 * Reads only the first 256KB to keep memory light and parsing instantaneous
 */
export function extractTextFromTxt(file) {
  return new Promise((resolve, reject) => {
    const blobToRead = file.size > 256 * 1024 ? file.slice(0, 256 * 1024) : file;
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = (err) => reject(err);
    reader.readAsText(blobToRead);
  });
}

/**
 * Extracts raw text from a PDF file using unpdf.
 * Optimized: reads first 10 pages or stops once sufficient word count is achieved,
 * preventing long parsing freezes on large books/catalogs.
 */
export async function extractTextFromPdf(file) {
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    
    // Fast path: read first 10 pages
    const maxPagesToRead = Math.min(pdf.numPages || 1, 10);
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= maxPagesToRead; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageString = textContent.items
          .map(item => ('str' in item ? item.str : ''))
          .join(' ');
        
        if (pageString.trim()) {
          pageTexts.push(pageString);
        }

        // Stop early if we have gathered plenty of text (> 20,000 chars)
        const currentTotalLength = pageTexts.reduce((acc, p) => acc + p.length, 0);
        if (currentTotalLength > 20000) break;
      } catch (pageErr) {
        console.warn(`Error reading PDF page ${pageNum}:`, pageErr);
      }
    }

    const fullText = pageTexts.join('\n\n');
    if (fullText.trim().length > 0) {
      return fullText;
    }

    // Fallback: standard extractText
    const result = await extractText(pdf);
    if (typeof result === 'string') return result;
    if (result && typeof result.text === 'string') return result.text;
    if (result && Array.isArray(result.text)) return result.text.join('\n');
    return String(result || '');
  } catch (err) {
    console.error("Error extracting PDF text:", err);
    throw new Error("Не удалось прочитать PDF файл. Попробуйте другой файл.");
  }
}

/**
 * Extracts N frames from a video file at even intervals using HTML5 video and canvas.
 * Optimized with fastSeek keyframe snapping, 480px max dimension, and seek timeouts.
 */
export function extractVideoFrames(file, frameCount = 4) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames = [];

    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const overallTimeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      if (frames.length > 0) {
        resolve(frames);
      } else {
        reject(new Error("Таймаут обработки видео. Файл слишком большой или неподдерживаемый кодек."));
      }
    }, 15000);

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        // Optimized 480px width for fast AI vision processing & low payload size
        const maxDim = 480;
        let width = video.videoWidth || 480;
        let height = video.videoHeight || 270;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const timeStep = duration / (frameCount + 1);

        for (let i = 1; i <= frameCount; i++) {
          const seekTime = Math.min(duration - 0.1, Math.max(0.1, timeStep * i));

          await new Promise((res) => {
            let settled = false;
            const onSeeked = () => {
              if (settled) return;
              settled = true;
              video.removeEventListener('seeked', onSeeked);
              try {
                ctx.drawImage(video, 0, 0, width, height);
                frames.push(canvas.toDataURL('image/jpeg', 0.72));
              } catch (drawErr) {}
              res();
            };

            video.addEventListener('seeked', onSeeked);

            // Use fastSeek if supported for instant nearest keyframe jump
            if (typeof video.fastSeek === 'function') {
              try {
                video.fastSeek(seekTime);
              } catch (e) {
                video.currentTime = seekTime;
              }
            } else {
              video.currentTime = seekTime;
            }

            // Fallback timeout per seek step
            setTimeout(() => {
              if (!settled) {
                settled = true;
                video.removeEventListener('seeked', onSeeked);
                res();
              }
            }, 1200);
          });
        }

        clearTimeout(overallTimeout);
        URL.revokeObjectURL(url);

        if (frames.length === 0) {
          throw new Error("Не удалось извлечь кадры из видео");
        }
        resolve(frames);
      } catch (err) {
        clearTimeout(overallTimeout);
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = (err) => {
      clearTimeout(overallTimeout);
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось загрузить видеофайл"));
    };
  });
}

/**
 * Truncates long text to max word count
 */
function truncateText(text, maxWords = 2500) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return { text, truncated: false, wordCount: words.length };
  }
  const truncatedText = words.slice(0, maxWords).join(' ') + '...';
  return { text: truncatedText, truncated: true, wordCount: words.length };
}

/**
 * Main attachment processing dispatcher.
 * Handles parallel processing, fast client-side image compression, and thumbnail generation.
 */
export async function processAttachment(file) {
  if (!file) return null;

  const fileName = file.name || 'file';
  const fileType = file.type || '';
  const extension = fileName.split('.').pop().toLowerCase();

  // Images
  if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(extension)) {
    const optimizedImage = await optimizeImage(file, 1600, 0.82);
    const thumbnail = await createThumbnail(optimizedImage, 120);

    return {
      type: 'image',
      fileName,
      images: [optimizedImage],
      thumbnail: thumbnail || optimizedImage,
      optimized: true
    };
  }

  // Videos
  if (fileType.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(extension)) {
    const frames = await extractVideoFrames(file, 4);
    return {
      type: 'video',
      fileName,
      images: frames, // Array of 4 frame base64 images
      thumbnail: frames[0] || '',
      warning: 'Анализ сделан по 4 отдельным кадрам без звука'
    };
  }

  // Plain Text & Structured Text
  if (fileType === 'text/plain' || ['txt', 'md', 'log', 'csv', 'json'].includes(extension)) {
    const rawText = await extractTextFromTxt(file);
    const { text: extractedText, truncated, wordCount } = truncateText(rawText, 2500);
    return {
      type: 'text',
      fileName,
      extractedText,
      wordCount,
      truncated
    };
  }

  // PDF Document
  if (fileType === 'application/pdf' || extension === 'pdf') {
    const rawText = await extractTextFromPdf(file);
    const { text: extractedText, truncated, wordCount } = truncateText(rawText, 2500);
    return {
      type: 'pdf',
      fileName,
      extractedText,
      wordCount,
      truncated
    };
  }

  throw new Error(`Неподдерживаемый тип файла: .${extension}. Поддерживаются фото (jpg/png/webp), текстовые файлы (txt/pdf/md) и видео (mp4).`);
}
