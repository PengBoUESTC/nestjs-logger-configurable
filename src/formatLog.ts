import { get, isEmpty } from 'lodash';
import { parse } from 'qs';
import { Request } from 'express';
import { AxiosRequestConfig } from 'axios';

export function formatLogReq(
  request: Request | AxiosRequestConfig,
  data: any,
): Record<string, string | number> {
  const { url = '', headers, method } = request;
  const query = get(request, 'query') || parse(url.split('?')[1] || '');
  const body = get(request, 'body') || get(request, 'data');
  const cookies = get(request, 'cookies');
  const code = get(request, 'code');
  return {
    log_time: Date.now(),
    'req.url': url,
    'req.method': JSON.stringify(method),
    'req.code': JSON.stringify(code),
    'req.query': JSON.stringify(query),
    'req.body': JSON.stringify(body),
    'req.headers': JSON.stringify(headers),
    'req.cookies': JSON.stringify(cookies),
    'res.data': JSON.stringify(data),
  };
}

export function formatLogInfo(message: string, context: Record<string, any>) {
  if (!message) return context;
  if (isEmpty(context)) return { message };
  return { message, context };
}
