import { isEmpty } from 'lodash';
import { stat, mkdir } from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AxiosRequestConfig } from 'axios';
import * as Transport from 'winston-transport';
import { LabelOptions, JsonOptions, Format } from 'logform';
import { transports, format, Container, LoggerOptions } from 'winston';

import { formatLogReq, formatLogInfo } from './formatLog';
import {
  REQ_LOG_TOKEN,
  INFO_LOG_TOKEN,
  LOG_CONFIG_KEY,
  CHECK_PATH_INTERVAL_TOKEN,
} from './constants';

const { combine, label, json } = format;

export interface Config {
  level: 'alert' | 'error' | 'warning' | 'info';
  key: string;
  labelOptions?: LabelOptions;
  jsonOptions?: JsonOptions;
  path: {
    log?: string;
    filename: string;
    dirname?: string;
  };
}

export type LogConfig = Array<Config>;

@Injectable()
export class LoggerService {
  readonly logger: Container;
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQ_LOG_TOKEN)
    private readonly reqLogKey: string,
    @Inject(INFO_LOG_TOKEN)
    private readonly infoLogKey: string,
    @Inject(CHECK_PATH_INTERVAL_TOKEN)
    private readonly checkInterval: number,
    @Inject(LOG_CONFIG_KEY)
    private readonly logConfigKey: string,
  ) {
    this.logger = this.initLogger();
  }

  private initLogger(): Container {
    const container = new Container();
    const logConfig: LogConfig = this.configService.get(this.logConfigKey) || [];

    logConfig.forEach((config: Config) => {
      const { key, level = 'info', path } = config || {};
      if (isEmpty(path)) return [];
      const loggerOptions: LoggerOptions = {
        level,
      };
      const format = this.getFormate(config);
      if (format) {
        loggerOptions.format = format;
      }
      container.add(key, loggerOptions);
      // 设置日志打印文件路径
      const { dirname = __dirname } = path;
      this.pathCheck(dirname, 0, () => {
        const transports = this.getTransports(config);
        container.get(key).clear();
        transports.forEach((transport) => {
          // clear() Remove all transports
          container.get(key).add(transport);
        });
      });
    });
    return container;
  }

  // 定时目录检查
  private pathCheck(path: string, wait, callBack) {
    const timer = setTimeout(() => {
      stat(path, (err) => {
        // 目录存在直接返回
        if (!err || err.code !== 'ENOENT') {
          // 持续检查日志文件是否存在
          this.pathCheck(path, this.checkInterval, callBack);
          if (callBack) callBack();
          return;
        }
        // 目录不存在自主创建
        mkdir(path, (err) => {
          this.pathCheck(path, this.checkInterval, callBack);
          if (err) {
            // 目录创建失败
            console.log(`日志目录 ${path}不存在，自动创建失败`);
          } else if (callBack) {
            // 持续检查日志文件是否存在
            callBack();
          }
        });
      });
      clearTimeout(timer);
    }, wait);
  }

  private getFormate(config: Config): Format | undefined {
    const { labelOptions, jsonOptions } = config || {};
    const formats = [];
    if (labelOptions) {
      formats.push(label(labelOptions));
    }
    if (jsonOptions) {
      formats.push(json(jsonOptions));
    }
    if (!formats.length) return;

    return combine(...formats);
  }

  private getTransports(config: Config): Array<Transport> {
    const { path } = config || {};
    if (isEmpty(path)) return [];
    const { log, filename, dirname = __dirname } = path;
    const _transports: Array<Transport> = [
      new transports.File({ dirname, filename: filename }),
    ];
    if (log) {
      _transports.push(new transports.Console({ level: log }));
    }
    return _transports;
  }

  // 网络请求日志打印
  logReq(
    request: Request | AxiosRequestConfig,
    data: any,
    loggerKey = this.reqLogKey,
  ) {
    const logger = this.logger.get(loggerKey);
    if (!logger) return;
    const info = formatLogReq(request, data);

    logger.log(logger.level, info);
  }

  // 字符串日志打印
  logInfo(
    message: string,
    context: Record<string, any> = {},
    loggerKey = this.infoLogKey,
  ) {
    const logger = this.logger.get(loggerKey);
    if (!logger) return;
    const info = formatLogInfo(message, context);

    logger.log(logger.level, info);
  }
}
