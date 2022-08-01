"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLogInfo = exports.formatLogReq = void 0;
const lodash_1 = require("lodash");
const qs_1 = require("qs");
function formatLogReq(request, data) {
    const { url = '', headers, method } = request;
    const query = (0, lodash_1.get)(request, 'query') || (0, qs_1.parse)(url.split('?')[1] || '');
    const body = (0, lodash_1.get)(request, 'body') || (0, lodash_1.get)(request, 'data');
    const cookies = (0, lodash_1.get)(request, 'cookies');
    const code = (0, lodash_1.get)(request, 'code');
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
exports.formatLogReq = formatLogReq;
function formatLogInfo(message, context) {
    if (!message)
        return context;
    if ((0, lodash_1.isEmpty)(context))
        return { message };
    return { message, context };
}
exports.formatLogInfo = formatLogInfo;
