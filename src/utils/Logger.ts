import * as core from '@actions/core';

export class Logger {
  info(message: string, ...args: any[]): void {
    core.info(this.formatMessage(message, args));
  }

  warn(message: string, ...args: any[]): void {
    core.warning(this.formatMessage(message, args));
  }

  error(message: string, ...args: any[]): void {
    core.error(this.formatMessage(message, args));
  }

  debug(message: string, ...args: any[]): void {
    core.debug(this.formatMessage(message, args));
  }

  private formatMessage(message: string, args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs =
      args.length > 0
        ? ` ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`
        : '';

    return `[${timestamp}] ${message}${formattedArgs}`;
  }
}
