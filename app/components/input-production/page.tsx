'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/interactive/Input';
import { InputGroup, InputGroupText } from '@/components/interactive/InputGroup';
import { NumberInput } from '@/components/interactive/NumberInput';
import { MaskedInput } from '@/components/interactive/MaskedInput';
import { PhoneInput } from '@/components/interactive/PhoneInput';
import { PasswordInput } from '@/components/interactive/PasswordInput';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function InputProductionPlaygroundPage() {
  const [bio, setBio] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | undefined>(1234.56);
  const [temperature, setTemperature] = useState<number | undefined>(21.5);
  const [submittedAmount, setSubmittedAmount] = useState<string | null>(null);
  const [nip, setNip] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Production form inputs
        </Heading>
        <Text className={styles.intro}>
          Everything a real CRM or admin product needs from its text fields. Layer 1 adds
          prefix/suffix, character counter, clear button, and loading state to <code>Input</code>.
          Layer 2 composes fields and buttons into grouped controls via <code>InputGroup</code>.
          Layer 3 ships specialised inputs — <code>NumberInput</code>, <code>MaskedInput</code>,{' '}
          <code>PhoneInput</code>, and <code>PasswordInput</code>.
        </Text>
      </header>

      {/* ============================================================ */}
      {/* LAYER 1 — Input enhancements */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 1 — Input enhancements
        </Heading>

        <div className={styles.row}>
          <Input name="price-simple" prefix="$" placeholder="0.00" />
          <Input name="weight" suffix="kg" placeholder="0" />
          <Input name="domain" prefix="https://" placeholder="example.com" />
          <Input name="handle" prefix="@" placeholder="jane" />
        </div>

        <Input
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={140}
          placeholder="I build things..."
        />

        <div className={styles.row}>
          <Input
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startIcon={<SearchIcon />}
            placeholder="Search anything..."
          />
          <Button onClick={simulateLoading}>Simulate loading</Button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAYER 2 — InputGroup */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 2 — InputGroup (multi-element widgets)
        </Heading>

        <InputGroup aria-label="Price in USD with decimals">
          <InputGroupText>$</InputGroupText>
          <Input name="group-price" placeholder="0" />
          <InputGroupText>.00</InputGroupText>
        </InputGroup>

        <InputGroup aria-label="Website URL with check button">
          <InputGroupText>https://</InputGroupText>
          <Input name="group-site" placeholder="example.com" />
          <Button variant="secondary">Check</Button>
        </InputGroup>

        <InputGroup aria-label="Email with domain hint">
          <InputGroupText>@</InputGroupText>
          <Input name="group-user" placeholder="jane" />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>
      </section>

      {/* ============================================================ */}
      {/* LAYER 3 — NumberInput */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 3 — NumberInput (locale-aware numeric)
        </Heading>

        <NumberInput
          label="Price (PLN)"
          name="pln-price"
          value={price}
          onValueChange={setPrice}
          currency="PLN"
          min={0}
          max={999999.99}
          helperText="Click to see raw value on focus, formatted on blur"
        />

        <NumberInput
          label="Temperature"
          name="temp"
          value={temperature}
          onValueChange={setTemperature}
          suffix="°C"
          decimals={1}
          min={-50}
          max={50}
        />

        <NumberInput
          label="Quantity"
          name="qty"
          defaultValue={1}
          min={1}
          max={100}
          decimals={0}
          helperText="Integer only (decimals={0})"
        />
      </section>

      {/* ============================================================ */}
      {/* LAYER 3 — NumberInput form integration */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 3 — NumberInput form submission
        </Heading>
        <Text variant="small" color="secondary">
          Native submit carries the CANONICAL numeric value (hidden input, period decimal, no
          grouping) — not the locale-formatted display string.
        </Text>
        <form
          aria-label="Number form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const amount = data.get('amount');
            setSubmittedAmount(amount === null ? '(absent)' : `"${String(amount)}"`);
          }}
        >
          <NumberInput
            label="Amount (PLN)"
            name="amount"
            locale="pl-PL"
            currency="PLN"
            defaultValue={1234.56}
            decimals={2}
            min={0}
            max={99999.99}
            helperText="Submit echoes FormData.get('amount')"
          />
          <NumberInput label="Disabled amount" name="disabled-amount" defaultValue={7} disabled />
          <Button type="submit" variant="secondary" size="sm">
            Submit number form
          </Button>
          {submittedAmount !== null && (
            <Text variant="small" color="muted" data-testid="number-form-echo">
              FormData.get(&apos;amount&apos;) = {submittedAmount}
            </Text>
          )}
        </form>
      </section>

      {/* ============================================================ */}
      {/* LAYER 3 — MaskedInput */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 3 — MaskedInput (pattern masks)
        </Heading>

        <MaskedInput
          label="NIP (tax ID)"
          name="nip"
          preset="nipPL"
          value={nip}
          onValueChange={setNip}
          placeholder="___-___-__-__"
          helperText="Polish tax ID — paste `1234567890` or type digits"
        />

        <MaskedInput
          label="Kod pocztowy"
          name="postcode"
          preset="postcodePL"
          value={postcode}
          onValueChange={setPostcode}
          placeholder="__-___"
        />

        <MaskedInput
          label="PESEL"
          name="pesel"
          preset="peselPL"
          placeholder="___________"
          helperText="11 digits, no separators"
        />

        <MaskedInput
          label="Credit card"
          name="cc"
          preset="creditCard"
          placeholder="____ ____ ____ ____"
        />

        <MaskedInput label="Date of birth" name="dob" preset="datePL" placeholder="DD.MM.YYYY" />
      </section>

      {/* ============================================================ */}
      {/* LAYER 3 — PhoneInput */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 3 — PhoneInput
        </Heading>

        <PhoneInput
          label="Telefon"
          name="phone-pl"
          value={phone}
          onValueChange={setPhone}
          placeholder="+48 ___ ___ ___"
          helperText="Default: Polish +48 mask"
        />

        <PhoneInput label="US phone" name="phone-us" preset="phoneUS" />

        <PhoneInput label="UK phone" name="phone-uk" mask="+44 #### ### ####" />
      </section>

      {/* ============================================================ */}
      {/* LAYER 3 — PasswordInput */}
      {/* ============================================================ */}

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Layer 3 — PasswordInput
        </Heading>

        <PasswordInput
          label="Current password"
          name="current-password"
          autoComplete="current-password"
          helperText="Click eye icon to toggle visibility"
          required
        />

        <PasswordInput
          label="New password"
          name="new-password"
          autoComplete="new-password"
          showStrength
          helperText="Try: `abc`, `abcdefgh`, `abcdefg1`, `Abcdefg1`, `Abcdefg1!@#4`"
          required
        />
      </section>
    </main>
  );
}
