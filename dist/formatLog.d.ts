import { Request } from 'express';
import { AxiosRequestConfig } from 'axios';
export declare function formatLogReq(request: Request | AxiosRequestConfig, data: any): Record<string, string | number>;
export declare function formatLogInfo(message: string, context: Record<string, any>): Record<string, any>;
