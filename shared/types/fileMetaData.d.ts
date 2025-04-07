/**
 * Represents metadata for a file attached to a question or answer.
 * This interface is designed for files processed on the frontend and sent as Base64 strings.
 *
 * - `fileId`: A unique identifier for the file (generated on the frontend).
 * - `filename`: The original name of the file.
 * - `contentType`: The MIME type of the file.
 * - `size`: The size of the file in bytes.
 * - `content`: The Base64 encoded content of the file.
 */
export interface FileMetaData {
  fileId: string;
  filename: string;
  contentType: string;
  mimetype?: string;
  size: number;
  content: string;
}

/**
 * Frontend-specific extension of FileMetaData for UI handling
 *
 * - `file`: The actual File object from the browser.
 * - `id`: Unique identifier for tracking in the UI.
 * - `preview`: Optional URL for image previews.
 * - `type`: File type category for UI rendering.
 */
export interface UIFileMetaData {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'pdf' | 'text';
}
