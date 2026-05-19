'use client';

import { useState } from 'react';
import { FileUpload, type FileRejection } from '@/components/complex/FileUpload';
import { FileChip } from '@/components/molecules/FileChip';
import { Form, FormSubmit } from '@/components/complex/Form';
import { Field, FieldLabel, FieldMessage } from '@/components/complex/Field';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function FileUploadPlayground() {
  // USE CASE 1: Basic single-file
  const [single, setSingle] = useState<File | null>(null);

  // USE CASE 2: Multiple with maxFiles
  const [multi, setMulti] = useState<File[]>([]);
  const [multiRejects, setMultiRejects] = useState<FileRejection[]>([]);

  // USE CASE 3: Accept filter (PDF only)
  const [pdfs, setPdfs] = useState<File[]>([]);

  // USE CASE 4: maxSize validation
  const [sized, setSized] = useState<File | null>(null);
  const [sizedRejects, setSizedRejects] = useState<FileRejection[]>([]);

  // USE CASE 5: Form integration
  const [submitted, setSubmitted] = useState<string | null>(null);

  // USE CASE 6: Error state
  const [errorRejects, setErrorRejects] = useState<FileRejection[]>([]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          FileUpload
        </Heading>
        <Text color="secondary">
          Drop zone + native file input wrapper. Native File API + HTML5 drag/drop. Render-props
          children for full control over zero state, drag-over visual, and browse trigger.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">complex/FileUpload</Badge>
          <Badge color="success">Phase 10</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic single file">
        <Heading level={2} size="lg">
          1. Basic single-file
        </Heading>
        <Text color="secondary">
          Single file, no constraints. Drop or click anywhere on the zone.
        </Text>
        <div className={styles.demo}>
          <FileUpload
            aria-label="Upload single file"
            onFiles={(files) => setSingle(files[0] ?? null)}
          >
            {({ isDragging, openPicker }) => (
              <div className={styles.zoneContent}>
                <Text>
                  {isDragging ? 'Release to upload' : 'Drag a file here or click to browse'}
                </Text>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Browse
                </Button>
              </div>
            )}
          </FileUpload>
          {single && (
            <div className={styles.fileList}>
              <FileChip
                name={single.name}
                size={single.size}
                mimeType={single.type}
                onRemove={() => setSingle(null)}
              />
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Multiple with limit">
        <Heading level={2} size="lg">
          2. Multiple files (max 5)
        </Heading>
        <Text color="secondary">
          Multiple selection with explicit cap. Excess files trigger <code>too-many-files</code>{' '}
          rejection.
        </Text>
        <div className={styles.demo}>
          <FileUpload
            aria-label="Upload up to 5 files"
            multiple
            maxFiles={5}
            onFiles={(files) => setMulti((prev) => [...prev, ...files])}
            onReject={setMultiRejects}
          >
            {({ isDragging, openPicker }) => (
              <div className={styles.zoneContent}>
                <Text>{isDragging ? 'Release to upload' : 'Drop up to 5 files'}</Text>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Browse
                </Button>
              </div>
            )}
          </FileUpload>
          {multi.length > 0 && (
            <div className={styles.fileList}>
              {multi.map((f, idx) => (
                <FileChip
                  key={`${f.name}-${idx}`}
                  name={f.name}
                  size={f.size}
                  mimeType={f.type}
                  onRemove={() => setMulti((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          )}
          {multiRejects.length > 0 && (
            <Inline gap={2}>
              <Badge color="warning">{multiRejects.length} rejected</Badge>
              <Text color="muted" variant="small">
                — exceeds limit
              </Text>
            </Inline>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="PDF only">
        <Heading level={2} size="lg">
          3. Accept filter — PDF only
        </Heading>
        <Text color="secondary">
          <code>accept=&quot;application/pdf&quot;</code> — non-PDF files rejected.
        </Text>
        <div className={styles.demo}>
          <FileUpload
            aria-label="Upload PDF documents"
            accept="application/pdf"
            multiple
            onFiles={(files) => setPdfs((prev) => [...prev, ...files])}
          >
            {({ isDragging, openPicker }) => (
              <div className={styles.zoneContent}>
                <Text>{isDragging ? 'Release to upload' : 'PDF documents only'}</Text>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Browse PDFs
                </Button>
              </div>
            )}
          </FileUpload>
          {pdfs.length > 0 && (
            <div className={styles.fileList}>
              {pdfs.map((f, idx) => (
                <FileChip key={`${f.name}-${idx}`} name={f.name} size={f.size} mimeType={f.type} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Max size">
        <Heading level={2} size="lg">
          4. Max size (1 MB)
        </Heading>
        <Text color="secondary">
          <code>maxSize=1_000_000</code> — oversize files rejected with <code>file-too-large</code>.
        </Text>
        <div className={styles.demo}>
          <FileUpload
            aria-label="Upload file under 1 megabyte"
            maxSize={1_000_000}
            onFiles={(files) => setSized(files[0] ?? null)}
            onReject={setSizedRejects}
          >
            {({ isDragging, openPicker }) => (
              <div className={styles.zoneContent}>
                <Text>{isDragging ? 'Release to upload' : 'Max 1 MB'}</Text>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Browse (≤1 MB)
                </Button>
              </div>
            )}
          </FileUpload>
          {sized && (
            <div className={styles.fileList}>
              <FileChip
                name={sized.name}
                size={sized.size}
                mimeType={sized.type}
                onRemove={() => setSized(null)}
              />
            </div>
          )}
          {sizedRejects.length > 0 && (
            <Inline gap={2} wrap>
              <Badge color="warning">Rejected</Badge>
              <Text color="muted" variant="small">
                {sizedRejects[0]?.file.name} — {sizedRejects[0]?.reasons.join(', ')}
              </Text>
            </Inline>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration">
        <Heading level={2} size="lg">
          5. Form integration (required + Field)
        </Heading>
        <Text color="secondary">
          FileUpload nested inside <code>&lt;Field&gt;</code> participates in native form
          validation. Required + FormData multipart.
        </Text>
        <div className={styles.formDemo}>
          <Form
            aria-label="Upload form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const file = data.get('attachment');
              setSubmitted(file instanceof File ? file.name : null);
            }}
          >
            <Field name="attachment">
              <FieldLabel>Attachment (required)</FieldLabel>
              <FileUpload
                name="attachment"
                aria-label="Attachment file"
                required
                accept="application/pdf,image/*"
                onFiles={() => undefined /* form value handled natively */}
              >
                {({ isDragging, openPicker }) => (
                  <div className={styles.zoneContent}>
                    <Text>
                      {isDragging ? 'Release to attach' : 'PDF or image — drop or browse'}
                    </Text>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        openPicker();
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Browse
                    </Button>
                  </div>
                )}
              </FileUpload>
              <FieldMessage match="valueMissing">Attachment is required</FieldMessage>
            </Field>
            <FormSubmit>Submit</FormSubmit>
            {submitted != null && (
              <Inline gap={2}>
                <Badge color="success">Submitted</Badge>
                <Text color="muted" variant="small">
                  {submitted}
                </Text>
              </Inline>
            )}
          </Form>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Error state">
        <Heading level={2} size="lg">
          6. Error state (image only, max 1 MB)
        </Heading>
        <Text color="secondary">
          Combined constraints — accept filter <em>and</em> maxSize. Each rejection carries an
          ordered <code>reasons</code> array (most specific first).
        </Text>
        <div className={styles.demo}>
          <FileUpload
            aria-label="Upload image under 1 megabyte"
            accept="image/*"
            maxSize={1_000_000}
            onReject={setErrorRejects}
          >
            {({ isDragging, isDragRejected, openPicker }) => (
              <div className={styles.zoneContent}>
                <Text color={isDragRejected ? 'muted' : 'primary'}>
                  {isDragRejected
                    ? 'Invalid file'
                    : isDragging
                      ? 'Release to upload'
                      : 'Drag an image < 1 MB'}
                </Text>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  variant={isDragRejected ? 'warning' : 'secondary'}
                  size="sm"
                >
                  Browse
                </Button>
              </div>
            )}
          </FileUpload>
          {errorRejects.length > 0 && (
            <div className={styles.rejectList}>
              {errorRejects.map((r, idx) => (
                <FileChip
                  key={`${r.file.name}-${idx}`}
                  name={r.file.name}
                  size={r.file.size}
                  mimeType={r.file.type}
                  variant="error"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Disabled state">
        <Heading level={2} size="lg">
          7. Disabled state
        </Heading>
        <Text color="secondary">
          <code>disabled</code> blocks drag, click, and picker. Drop zone remains focusable so AT
          can announce its state.
        </Text>
        <div className={styles.demo}>
          <FileUpload disabled aria-label="Disabled file upload">
            {({ disabled }) => (
              <div className={styles.zoneContent}>
                <Text color={disabled ? 'muted' : 'primary'}>Uploads currently disabled</Text>
              </div>
            )}
          </FileUpload>
        </div>
      </section>
    </main>
  );
}
