import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AxiosRequestConfig } from 'axios';
import { LabelOptions, JsonOptions } from 'logform';
import { Container } from 'winston';
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
export declare type LogConfig = Array<Config>;
export declare class LoggerService {
    private readonly configService;
    private readonly reqLogKey;
    private readonly infoLogKey;
    private readonly checkInterval;
    private readonly logConfigKey;
    readonly logger: Container;
    constructor(configService: ConfigService, reqLogKey: string, infoLogKey: string, checkInterval: number, logConfigKey: string);
    private initLogger;
    private pathCheck;
    private getFormate;
    private getTransports;
    logReq(request: Request | AxiosRequestConfig, data: any, loggerKey?: string): void;
    logInfo(message: string, context?: Record<string, any>, loggerKey?: string): void;
}
