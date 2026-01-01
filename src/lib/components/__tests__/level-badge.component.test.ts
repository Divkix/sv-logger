import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import LevelBadge from '../level-badge.svelte';

describe('LevelBadge', () => {
  afterEach(() => {
    cleanup();
  });

  describe('renders correct color for each level', () => {
    it('renders debug level with slate background', () => {
      render(LevelBadge, { props: { level: 'debug' } });

      const badge = screen.getByText('DEBUG');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-slate');
    });

    it('renders info level with blue background', () => {
      render(LevelBadge, { props: { level: 'info' } });

      const badge = screen.getByText('INFO');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-blue');
    });

    it('renders warn level with amber background', () => {
      render(LevelBadge, { props: { level: 'warn' } });

      const badge = screen.getByText('WARN');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-amber');
    });

    it('renders error level with red background', () => {
      render(LevelBadge, { props: { level: 'error' } });

      const badge = screen.getByText('ERROR');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-red');
    });

    it('renders fatal level with purple background', () => {
      render(LevelBadge, { props: { level: 'fatal' } });

      const badge = screen.getByText('FATAL');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-purple');
    });
  });

  describe('displays level text uppercase', () => {
    it('displays debug as DEBUG', () => {
      render(LevelBadge, { props: { level: 'debug' } });
      expect(screen.getByText('DEBUG')).toBeInTheDocument();
    });

    it('displays info as INFO', () => {
      render(LevelBadge, { props: { level: 'info' } });
      expect(screen.getByText('INFO')).toBeInTheDocument();
    });

    it('displays warn as WARN', () => {
      render(LevelBadge, { props: { level: 'warn' } });
      expect(screen.getByText('WARN')).toBeInTheDocument();
    });

    it('displays error as ERROR', () => {
      render(LevelBadge, { props: { level: 'error' } });
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });

    it('displays fatal as FATAL', () => {
      render(LevelBadge, { props: { level: 'fatal' } });
      expect(screen.getByText('FATAL')).toBeInTheDocument();
    });
  });
});
