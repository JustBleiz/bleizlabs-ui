'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileChip } from '@/components/molecules/FileChip';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
};

const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'oferta-2026-q2.pdf', size: 245_760, mimeType: 'application/pdf' },
  { id: '2', name: 'screenshot-dashboard.png', size: 1_474_560, mimeType: 'image/png' },
  { id: '3', name: 'recording-call-2026-05-04.mp4', size: 82_944_000, mimeType: 'video/mp4' },
  { id: '4', name: 'archive-projektu-q1.zip', size: 524_288_000, mimeType: 'application/zip' },
];

export default function FileChipPlaygroundPage() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [retryCount, setRetryCount] = useState(0);

  const handleRemove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          FileChip
        </Heading>
        <p className={styles.intro}>
          File attachment chip with three variants: <code>uploaded</code> (default — MIME icon +
          remove), <code>uploading</code> (Spinner replaces icon, remove hidden), <code>error</code>{' '}
          (error border + retry button). Auto-detects the MIME category for the leading icon (image,
          video, audio, text, archive, document). File size renders human-readably (B / KB / MB / GB
          / TB).
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Uploaded files (controlled list with remove)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            {files.map((file) => (
              <FileChip
                key={file.id}
                name={file.name}
                size={file.size}
                mimeType={file.mimeType}
                removeLabel={`Usuń plik ${file.name}`}
                onRemove={() => handleRemove(file.id)}
              />
            ))}
            {files.length === 0 && (
              <p className={styles.bodyText}>
                Wszystkie pliki usunięto. Odśwież stronę aby przywrócić.
              </p>
            )}
          </div>
          <p className={styles.bodyText}>
            Default <code>uploaded</code> variant — MIME icon auto-detected from{' '}
            <code>mimeType</code>. Click the X to remove a file. The remove button is a real{' '}
            <code>{'<button>'}</code> (icon-only via Button atom), <code>aria-label</code> per file
            for SR clarity.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Read-only (no remove handler)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <FileChip name="raport-finansowy-q1.pdf" size={487_424} mimeType="application/pdf" />
            <FileChip name="logo-firmowe.svg" size={12_288} mimeType="image/svg+xml" />
          </div>
          <p className={styles.bodyText}>
            When <code>onRemove</code> is omitted, the trailing X disappears — the chip becomes
            read-only. Useful for &ldquo;already attached, cannot be removed&rdquo; lists or
            finalised offers.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Uploading state
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <FileChip
              name="big-archive.zip"
              size={524_288_000}
              mimeType="application/zip"
              variant="uploading"
              uploadingLabel="Wysyłanie pliku"
            />
          </div>
          <p className={styles.bodyText}>
            <code>variant=&quot;uploading&quot;</code> replaces the MIME icon with a Spinner (
            <code>role=&quot;status&quot;</code> via Spinner atom) and hides the remove button — an
            in-flight upload is cancelled via its own mechanism, not this chip.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Error state with retry
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <FileChip
              name="failed-upload.docx"
              size={82_944}
              mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              variant="error"
              retryLabel={`Ponów (${retryCount})`}
              removeLabel="Anuluj"
              onRetry={() => setRetryCount((n) => n + 1)}
              onRemove={() => undefined}
            />
          </div>
          <p className={styles.bodyText}>
            Error border + tinted icon. Retry button shown when <code>onRetry</code> supplied;
            remove button still available so user can discard the failed attempt entirely.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. MIME category auto-detection
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <FileChip name="document.pdf" size={245_760} mimeType="application/pdf" />
            <FileChip name="photo.jpg" size={1_474_560} mimeType="image/jpeg" />
            <FileChip name="video.mp4" size={20_971_520} mimeType="video/mp4" />
            <FileChip name="podcast.mp3" size={5_242_880} mimeType="audio/mpeg" />
            <FileChip name="readme.txt" size={4096} mimeType="text/plain" />
            <FileChip name="bundle.zip" size={2_097_152} mimeType="application/zip" />
            <FileChip name="unknown.xyz" size={1024} />
          </div>
          <p className={styles.bodyText}>
            Six MIME categories — <code>image</code> / <code>video</code> /<code>audio</code> /{' '}
            <code>text</code> / <code>archive</code> /<code>document</code>. Unknown or missing{' '}
            <code>mimeType</code> falls back to the generic document icon.
          </p>
        </div>
      </section>
    </main>
  );
}
