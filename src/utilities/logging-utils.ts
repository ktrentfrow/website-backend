import type { LoggerOptions } from 'bunyan';
import type Logger from 'bunyan';
import { createLogger as bunyanCreateLogger } from 'bunyan';
import fs from 'fs';

export class LoggingUtils {
	public static createLogger(logOptions: LoggerOptions): Logger {
		if (logOptions.streams != null && logOptions.streams.length > 0) {
			for (const s of logOptions.streams) {
				if (s.path != null) {
					const parts = s.path.split('/');
					parts.splice(parts.length - 1);
					fs.mkdirSync(parts.join('/'), { recursive: true });
				}
			}
		}

		return bunyanCreateLogger(logOptions);
	}
}