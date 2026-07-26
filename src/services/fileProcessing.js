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
 * Extracts raw text from a plain text file (.txt)
 */
export function extractTextFromTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Extracts raw text from a PDF file using unpdf
 */
export async function extractTextFromPdf(file) {
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf);
    
    // unpdf returns string or object with text property depending on version
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
 * Extracts N frames from a video file at even intervals using HTML5 video and canvas
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

    video.onloadedmetadata = async () => {
      const duration = video.duration || 1;
      // Resize to max 640px width to keep base64 payload efficient
      const maxDim = 640;
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 360;

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

      // Intervals: 15%, 40%, 65%, 85%
      const timeStep = duration / (frameCount + 1);

      try {
        for (let i = 1; i <= frameCount; i++) {
          const seekTime = Math.min(duration - 0.1, Math.max(0.1, timeStep * i));
          video.currentTime = seekTime;
          
          await new Promise((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              ctx.drawImage(video, 0, 0, width, height);
              frames.push(canvas.toDataURL('image/jpeg', 0.8));
              res();
            };
            video.addEventListener('seeked', onSeeked);
          });
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = (err) => {
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
 * Main attachment processing dispatcher
 */
export async function processAttachment(file) {
  if (!file) return null;

  const fileName = file.name;
  const fileType = file.type || '';
  const extension = fileName.split('.').pop().toLowerCase();

  // Images
  if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    const dataUrl = await fileToBase64(file);
    return {
      type: 'image',
      fileName,
      images: [dataUrl],
      thumbnail: dataUrl
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

  // Plain Text
  if (fileType === 'text/plain' || extension === 'txt') {
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

  throw new Error(`Неподдерживаемый тип файла: .${extension}. Поддерживаются фото (jpg/png/webp), текстовые файлы (txt/pdf) и видео (mp4).`);
}
