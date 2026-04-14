import Link from 'next/link';
import styles from './page.module.scss';

interface ComponentLink {
  href: string;
  name: string;
  description: string;
  phase: string;
  status: 'available' | 'pending';
}

const components: ComponentLink[] = [
  {
    href: '/components/stack',
    name: 'Stack',
    description: 'Vertical flex layout atom with gap, align, justify, divider.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/inline',
    name: 'Inline',
    description: 'Horizontal flex layout atom with wrap and collapseBelow.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/container',
    name: 'Container',
    description: 'Max-width centered wrapper with size + padding variants.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/section',
    name: 'Section',
    description:
      'Full-width semantic band with bg variants and tag override.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>bleizlabs-ui</h1>
        <p>
          Internal dev playground. Each link below renders a component in
          isolation against the live token system.
        </p>
      </header>
      <ul className={styles.grid}>
        {components.map((c) => (
          <li key={c.href} className={styles.card} data-status={c.status}>
            <Link href={c.href}>
              <span className={styles.phase}>{c.phase}</span>
              <strong>{c.name}</strong>
              <span className={styles.description}>{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
