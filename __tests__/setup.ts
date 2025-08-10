import { vi } from 'vitest';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
};

// Mock setTimeout to avoid actual delays in tests
vi.mock('timers', () => ({
  setTimeout: vi.fn((fn) => {
    fn();
    return 1;
  })
}));
