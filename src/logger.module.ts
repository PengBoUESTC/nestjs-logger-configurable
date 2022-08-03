import { Module, DynamicModule } from '@nestjs/common';

import { LoggerService } from './logger.service';
import {
  REQ_LOG_TOKEN,
  INFO_LOG_TOKEN,
  LOG_CONFIG_KEY,
  CHECK_PATH_INTERVAL_TOKEN,
} from './constants';
export interface LoggerOptions {
  isGlobal?: boolean;
  reqLogKey: string;
  infoLogKey: string;
  logConfigKey?: string;
  checkInterval?: number;
}

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  static register(options: LoggerOptions): DynamicModule {
    // TODO-PB checkInterval 配置应该放在哪里？？
    const {
      isGlobal,
      reqLogKey,
      infoLogKey,
      logConfigKey = 'LogConfig',
      checkInterval = 60000,
    } = options || {};
    const providers = [
      LoggerService,
      {
        provide: REQ_LOG_TOKEN,
        useValue: reqLogKey,
      },
      {
        provide: INFO_LOG_TOKEN,
        useValue: infoLogKey,
      },
      {
        provide: CHECK_PATH_INTERVAL_TOKEN,
        useValue: checkInterval,
      },
      {
        provide: LOG_CONFIG_KEY,
        useValue: logConfigKey,
      },
    ];
    return {
      global: !!isGlobal,
      module: LoggerModule,
      providers: providers,
      exports: [...providers],
    };
  }
}
