import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../src/utils/Logger';
import * as core from '@actions/core';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}));

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Test warning message'));
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(core.error).toHaveBeenCalledWith(expect.stringContaining('Test error message'));
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(core.debug).toHaveBeenCalledWith(expect.stringContaining('Test debug message'));
  });

  it('should format messages with arguments', () => {
    logger.info('Test message', { key: 'value' }, 123);
    expect(core.info).toHaveBeenCalledWith(
      expect.stringMatching(/Test message.*{"key":"value"}.*123/)
    );
  });

  it('should include timestamp in formatted messages', () => {
    logger.info('Test message');
    expect(core.info).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test message/)
    );
  });
});
