'use client';

/**
 * useFloatingEscapeStack — Escape dismiss via the shared Dialog escapeStack.
 *
 * Floating surfaces that use `useFloatingDismiss({ closeOnEscape: false })`
 * (Select, Combobox — listbox owns Escape on the trigger path) still push
 * onto the stack so nested Dialog + overlay ordering matches APG/Radix
 * (#1951, #2450): the topmost surface closes first.
 *
 * @layer utils / floating (WU-2 — 0.28.0)
 */

import { useEffect, useRef } from 'react';
import { escapeStack } from '../../complex/Dialog/escapeStack';

export function useFloatingEscapeStack(open: boolean, onDismiss: () => void): void {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const close = () => onDismissRef.current();
    escapeStack.push(close);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (escapeStack[escapeStack.length - 1] !== close) return;
      event.preventDefault();
      close();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      const idx = escapeStack.indexOf(close);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
  }, [open]);
}
