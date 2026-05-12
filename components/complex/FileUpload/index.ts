/**
 * FileUpload (Phase 10 — E01.1 of 0.19.0 Forms expansion) — barrel re-export.
 *
 * Single component + 3 type exports (no compound sub-components — content
 * comes via render-props children, see FileUpload.tsx JSDoc @example).
 */

export { FileUpload } from './FileUpload';

export type {
  FileUploadProps,
  FileUploadRenderProps,
  FileRejection,
  FileRejectionReason,
} from './FileUpload';
