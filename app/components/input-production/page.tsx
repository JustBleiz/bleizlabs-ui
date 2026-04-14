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
          Input Production Hardening
        </Heading>
        <Text className={styles.intro}>
          Phase 4 expansion (E08). Bootstrap-level form input feature parity
          for CRM / platform production use. Three layers per D26:
          Layer 1 = Input prefix/suffix/counter/clearable/loading props,
          Layer 2 = InputGroup + InputGroupText widgets, Layer 3 =
          specialized inputs (NumberInput, MaskedInput, PhoneInput,
          PasswordInput).
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
          <Input label="Price" name="price-simple" prefix="$" placeholder="0.00" />
          <Input label="Weight" name="weight" suffix="kg" placeholder="0" />
          <Input label="Domain" name="domain" prefix="https://" placeholder="example.com" />
          <Input label="Email handle" name="handle" prefix="@" placeholder="jane" />
        </div>

        <Input
          label="Bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={140}
          showCounter
          helperText="Tell us something about yourself"
          placeholder="I build things..."
        />

        <div className={styles.row}>
          <Input
            label="Search"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            loading={loading}
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
          <Input label="Price" name="group-price" hideLabel placeholder="0" />
          <InputGroupText>.00</InputGroupText>
        </InputGroup>

        <InputGroup aria-label="Website URL with check button">
          <InputGroupText>https://</InputGroupText>
          <Input label="Website" name="group-site" hideLabel placeholder="example.com" />
          <Button variant="secondary">Check</Button>
        </InputGroup>

        <InputGroup aria-label="Email with domain hint">
          <InputGroupText>@</InputGroupText>
          <Input label="Username" name="group-user" hideLabel placeholder="jane" />
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

        <MaskedInput
          label="Date of birth"
          name="dob"
          preset="datePL"
          placeholder="DD.MM.YYYY"
        />
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
