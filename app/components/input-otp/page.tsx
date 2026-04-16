'use client';

import { useState, type FormEvent } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/complex/InputOTP';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function InputOTPPlayground() {
  const [basicValue, setBasicValue] = useState('');
  const [controlledValue, setControlledValue] = useState('');
  const [alphanumericValue, setAlphanumericValue] = useState('');
  const [completions, setCompletions] = useState<string[]>([]);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleComplete = (code: string) => {
    setCompletions((prev) => [code, ...prev].slice(0, 5));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = formData.get('verification') as string;
    setSubmittedCode(code);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          InputOTP — Phase 10 CI18
        </Heading>
        <Text variant="lead" color="muted">
          One-time password / verification code entry. Single semantic input
          stretched across decorative cells. Zero-dep reimplementation of the
          guilhermerodz <code>input-otp</code> idiom per D5/D25. Native
          iOS/Android SMS autofill via{' '}
          <code>autoComplete=&quot;one-time-code&quot;</code>.
        </Text>
      </header>

      {/* 1. Basic uncontrolled 6-digit numeric */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            1. Basic — 6-digit numeric (uncontrolled)
          </Heading>
          <Text variant="small" color="muted">
            Auto-defaults to <code>maxLength</code> Slots when no children are
            passed.
          </Text>
        </header>
        <Stack gap={3}>
          <InputOTP
            maxLength={6}
            aria-label="Verification code"
            onChange={setBasicValue}
            onComplete={handleComplete}
          />
          <Inline gap={2} align="center">
            <Badge label="value" color="default" />
            <Text variant="small" className={styles.mono}>
              {basicValue || <em>(empty)</em>}
            </Text>
          </Inline>
        </Stack>
      </section>

      {/* 2. With separator — XXX-XXX layout */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            2. Grouped with separator — XXX-XXX
          </Heading>
          <Text variant="small" color="muted">
            Explicit composition: two Groups split by a Separator.
          </Text>
        </header>
        <InputOTP maxLength={6} aria-label="Grouped code">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </section>

      {/* 3. Controlled + onComplete */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            3. Controlled + onComplete log
          </Heading>
          <Text variant="small" color="muted">
            onComplete fires once per transition to full length. Clear resets.
          </Text>
        </header>
        <Stack gap={3}>
          <InputOTP
            maxLength={4}
            value={controlledValue}
            onChange={setControlledValue}
            onComplete={handleComplete}
            aria-label="PIN"
          />
          <Inline gap={2} align="center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setControlledValue('')}
              disabled={controlledValue === ''}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setControlledValue('1234')}
            >
              Set 1234
            </Button>
          </Inline>
          {completions.length > 0 ? (
            <div className={styles.completionsLog}>
              <Text variant="small" weight="semibold">
                Recent completions:
              </Text>
              <ul className={styles.completionsList}>
                {completions.map((code, i) => (
                  <li key={`${code}-${i}`} className={styles.mono}>
                    {code}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Stack>
      </section>

      {/* 4. Alphanumeric pattern */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            4. Alphanumeric — license key style
          </Heading>
          <Text variant="small" color="muted">
            <code>pattern=&quot;alphanumeric&quot;</code> accepts 0-9 A-Z a-z.
            inputMode switches to <code>text</code>.
          </Text>
        </header>
        <Stack gap={3}>
          <InputOTP
            maxLength={8}
            pattern="alphanumeric"
            aria-label="License key"
            onChange={setAlphanumericValue}
          />
          <Inline gap={2} align="center">
            <Badge label="value" color="default" />
            <Text variant="small" className={styles.mono}>
              {alphanumericValue || <em>(empty)</em>}
            </Text>
          </Inline>
        </Stack>
      </section>

      {/* 5. Error state */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            5. Invalid state
          </Heading>
          <Text variant="small" color="muted">
            <code>aria-invalid</code> maps to red borders + error focus ring.
          </Text>
        </header>
        <Stack gap={2}>
          <InputOTP
            maxLength={6}
            defaultValue="1234"
            aria-invalid
            aria-label="Code (invalid)"
            aria-describedby="otp-error-msg"
          />
          <Text
            id="otp-error-msg"
            variant="small"
            className={styles.errorMsg}
            role="alert"
          >
            Incorrect code. Please try again.
          </Text>
        </Stack>
      </section>

      {/* 6. Disabled / read-only */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            6. Disabled + Read-only
          </Heading>
          <Text variant="small" color="muted">
            Disabled blocks focus + input; readOnly keeps focus but rejects
            keystrokes.
          </Text>
        </header>
        <Stack gap={4}>
          <Stack gap={2}>
            <Text variant="small" weight="semibold">
              Disabled
            </Text>
            <InputOTP
              maxLength={6}
              defaultValue="123456"
              disabled
              aria-label="Disabled code"
            />
          </Stack>
          <Stack gap={2}>
            <Text variant="small" weight="semibold">
              Read-only
            </Text>
            <InputOTP
              maxLength={6}
              defaultValue="000000"
              readOnly
              aria-label="Read-only code"
            />
          </Stack>
        </Stack>
      </section>

      {/* 7. Form participation */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            7. Form participation
          </Heading>
          <Text variant="small" color="muted">
            <code>name</code> prop enables native form submit. Required
            validation handled by the browser.
          </Text>
        </header>
        <form onSubmit={handleFormSubmit} className={styles.form}>
          <Stack gap={3}>
            <InputOTP
              maxLength={6}
              name="verification"
              required
              aria-label="Verification code"
            />
            <Inline gap={2}>
              <Button type="submit" size="sm" variant="primary">
                Verify
              </Button>
              <Button
                type="reset"
                size="sm"
                variant="secondary"
                onClick={() => setSubmittedCode(null)}
              >
                Reset
              </Button>
            </Inline>
            {submittedCode !== null ? (
              <Text variant="small" color="muted">
                Submitted:{' '}
                <span className={styles.mono}>{submittedCode}</span>
              </Text>
            ) : null}
          </Stack>
        </form>
      </section>

      {/* 8. Keyboard + paste walkthrough */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            8. Keyboard + paste walkthrough
          </Heading>
        </header>
        <Stack gap={2}>
          <InputOTP maxLength={6} aria-label="Keyboard test code" />
          <ul className={styles.keyboardList}>
            <li>
              <code>digit</code> — insert at caret, advance
            </li>
            <li>
              <code>non-matching char</code> — silently rejected
            </li>
            <li>
              <code>Backspace</code> — delete current / move back
            </li>
            <li>
              <code>ArrowLeft / ArrowRight / Home / End</code> — navigate
            </li>
            <li>
              <code>Cmd/Ctrl+V</code> — paste &quot;123-456&quot; strips hyphen
              + fills
            </li>
            <li>
              <code>Tab</code> — native tabstop exit
            </li>
          </ul>
        </Stack>
      </section>
    </main>
  );
}
