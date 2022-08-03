import { DynamicModule } from '@nestjs/common';
export interface LoggerOptions {
    isGlobal?: boolean;
    reqLogKey: string;
    infoLogKey: string;
    logConfigKey?: string;
    checkInterval?: number;
}
export declare class LoggerModule {
    static register(options: LoggerOptions): DynamicModule;
}
