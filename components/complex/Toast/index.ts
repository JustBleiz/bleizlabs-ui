/**
 * Toast (Phase 10 CI15) — barrel re-export.
 *
 * Mount `<Toaster />` ONCE in root layout. Call `toast(...)` from anywhere
 * (React tree, event handlers, module scope). Imperative API bypasses React
 * Context per zero-dep singleton architecture.
 *
 *   // app/layout.tsx
 *   import { Toaster } from '@/components/complex/Toast';
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           {children}
 *           <Toaster position="bottom-right" />
 *         </body>
 *       </html>
 *     );
 *   }
 *
 *   // any component / helper / utility
 *   import { toast } from '@/components/complex/Toast';
 *   await saveData();
 *   toast.success('Saved');
 */

export { Toaster } from './Toaster';
export type { ToasterProps, ToasterPosition, ToasterDir } from './Toaster';

export {
  toast,
  useToastQueue,
  pauseAllTimers,
  resumeAllTimers,
} from './toastStore';

export type {
  ToastOptions,
  ToastItem,
  ToastVariant,
  ToastAction,
} from './toastStore';
