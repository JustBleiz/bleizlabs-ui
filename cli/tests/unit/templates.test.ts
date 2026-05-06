import { describe, it, expect } from 'vitest';
import {
  renderWrapperTsx,
  renderWrapperTsxTypeOnly,
  renderWrapperScss,
  renderRootBarrel,
  renderAgentsManagedBlock,
  renderClaudeManagedBlock,
  renderGlobalsScss,
  MARKER_REGEX_TS,
  MARKER_BEGIN_MD,
  MARKER_END_MD,
} from '../../src/lib/templates.js';
import type { ManifestFamily, ComponentManifest } from '../../src/lib/registry-loader.js';

const sampleFamily: ManifestFamily = {
  family: 'Card',
  category: 'display',
  path: 'display/Card',
  exports: ['Card', 'CardHeader', 'CardBody'],
  types: ['CardProps', 'CardHeaderProps'],
  hooks: [],
};

const sampleHookFamily: ManifestFamily = {
  family: 'Sidebar',
  category: 'complex',
  path: 'complex/Sidebar',
  exports: ['Sidebar', 'SidebarTrigger'],
  types: ['SidebarProps'],
  hooks: ['useSidebar'],
};

const sampleTypeOnlyFamily: ManifestFamily = {
  family: 'spacing',
  category: 'types',
  path: 'types/spacing',
  exports: [],
  types: ['SpaceIndex'],
  hooks: [],
};

describe('templates', () => {
  describe('renderWrapperTsx', () => {
    it('emits marker + multi-export block', () => {
      const out = renderWrapperTsx(sampleFamily, '0.10.0');
      expect(out).toMatch(MARKER_REGEX_TS);
      expect(out).toContain('// @bleizlabs/ui-generated v0.10.0');
      expect(out).toContain('Card,');
      expect(out).toContain('CardHeader,');
      expect(out).toContain('CardBody,');
      expect(out).toContain('type CardProps,');
      expect(out).toContain('type CardHeaderProps,');
      expect(out).toContain("from '@bleizlabs/ui';");
    });

    it('includes hook in value-exports section', () => {
      const out = renderWrapperTsx(sampleHookFamily, '0.10.0');
      expect(out).toContain('Sidebar,');
      expect(out).toContain('useSidebar,');
      expect(out).toContain('type SidebarProps,');
    });

    it('orders value exports before types', () => {
      const out = renderWrapperTsx(sampleFamily, '0.10.0');
      const idxValue = out.indexOf('Card,');
      const idxType = out.indexOf('type CardProps,');
      expect(idxValue).toBeLessThan(idxType);
    });
  });

  describe('renderWrapperTsxTypeOnly', () => {
    it('uses export type {} syntax', () => {
      const out = renderWrapperTsxTypeOnly(sampleTypeOnlyFamily, '0.10.0');
      expect(out).toContain('export type {');
      expect(out).toContain('SpaceIndex,');
      expect(out).not.toContain('export {\n');
    });
  });

  describe('renderWrapperScss', () => {
    it('emits marker + example variant scaffold', () => {
      const out = renderWrapperScss(sampleFamily, '0.10.0');
      expect(out).toMatch(MARKER_REGEX_TS); // SCSS uses same marker
      expect(out).toContain('Project styling slot for Card wrapper');
      expect(out).toContain('Example:');
    });
  });

  describe('renderRootBarrel', () => {
    it('groups components by category, sorts within category, lists utilities + types', () => {
      const manifest: ComponentManifest = {
        schemaVersion: '1',
        libVersion: '0.10.0',
        generatedAt: '2026-05-06T00:00:00.000Z',
        categories: {},
        components: [
          { family: 'Zebra', category: 'display', path: 'display/Zebra', exports: ['Zebra'], types: [], hooks: [] },
          sampleFamily, // Card / display
          { family: 'Stack', category: 'layout', path: 'layout/Stack', exports: ['Stack'], types: [], hooks: [] },
          sampleHookFamily, // Sidebar / complex
        ],
        utilities: [
          { family: 'cn', category: 'utils', path: 'utils/cn', exports: ['cn'], types: [], hooks: [] },
        ],
        typesOnly: [sampleTypeOnlyFamily],
      };
      const out = renderRootBarrel(manifest);
      expect(out).toMatch(MARKER_REGEX_TS);

      // Category-nested paths
      expect(out).toContain("from './display/Card'");
      expect(out).toContain("from './display/Zebra'");
      expect(out).toContain("from './layout/Stack'");
      expect(out).toContain("from './complex/Sidebar'");

      // Sorted by category first (complex < display < layout), then by family within
      const idxSidebar = out.indexOf("from './complex/Sidebar'");
      const idxCard = out.indexOf("from './display/Card'");
      const idxZebra = out.indexOf("from './display/Zebra'");
      const idxStack = out.indexOf("from './layout/Stack'");
      expect(idxSidebar).toBeLessThan(idxCard);
      expect(idxCard).toBeLessThan(idxZebra); // alphabetical within display
      expect(idxZebra).toBeLessThan(idxStack);

      // Utilities under utils/ (category field carries this)
      expect(out).toContain("from './utils/cn'");
      // Types under types/ (category field carries this)
      expect(out).toContain("from './types/spacing'");
    });
  });

  describe('renderAgentsManagedBlock', () => {
    it('wraps content with BEGIN/END markers', () => {
      const out = renderAgentsManagedBlock('0.10.0');
      expect(out).toMatch(MARKER_BEGIN_MD);
      expect(out).toMatch(MARKER_END_MD);
      expect(out).toContain('TL;DR');
      expect(out).toContain('@bleizlabs/ui — Agent Working Rules');
    });
  });

  describe('renderClaudeManagedBlock', () => {
    it('references AGENTS.md + Claude-specific section', () => {
      const out = renderClaudeManagedBlock('0.10.0');
      expect(out).toContain('@AGENTS.md');
      expect(out).toContain('Claude Code specific');
    });
  });

  describe('renderGlobalsScss', () => {
    it('contains @use lib styles + seed slot + theme imports', () => {
      const out = renderGlobalsScss('0.10.0');
      expect(out).toContain("@use '@bleizlabs/ui/styles' with");
      expect(out).toContain('$seed-mode');
      expect(out).toContain("@use './_styles/theme'");
      expect(out).toContain("@use './_styles/overrides'");
    });
  });
});
