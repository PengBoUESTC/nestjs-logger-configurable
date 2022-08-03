"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const lodash_1 = require("lodash");
const fs_1 = require("fs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const winston_1 = require("winston");
const formatLog_1 = require("./formatLog");
const constants_1 = require("./constants");
const { combine, label, json } = winston_1.format;
let LoggerService = class LoggerService {
    constructor(configService, reqLogKey, infoLogKey, checkInterval, logConfigKey) {
        this.configService = configService;
        this.reqLogKey = reqLogKey;
        this.infoLogKey = infoLogKey;
        this.checkInterval = checkInterval;
        this.logConfigKey = logConfigKey;
        this.logger = this.initLogger();
    }
    initLogger() {
        const container = new winston_1.Container();
        const logConfig = this.configService.get(this.logConfigKey) || [];
        logConfig.forEach((config) => {
            const { key, level = 'info', path } = config || {};
            if ((0, lodash_1.isEmpty)(path))
                return [];
            const loggerOptions = {
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
    pathCheck(path, wait, callBack) {
        const timer = setTimeout(() => {
            (0, fs_1.stat)(path, (err) => {
                // 目录存在直接返回
                if (!err || err.code !== 'ENOENT') {
                    // 持续检查日志文件是否存在
                    this.pathCheck(path, this.checkInterval, callBack);
                    if (callBack)
                        callBack();
                    return;
                }
                // 目录不存在自主创建
                (0, fs_1.mkdir)(path, (err) => {
                    this.pathCheck(path, this.checkInterval, callBack);
                    if (err) {
                        // 目录创建失败
                        console.log(`日志目录 ${path}不存在，自动创建失败`);
                    }
                    else if (callBack) {
                        // 持续检查日志文件是否存在
                        callBack();
                    }
                });
            });
            clearTimeout(timer);
        }, wait);
    }
    getFormate(config) {
        const { labelOptions, jsonOptions } = config || {};
        const formats = [];
        if (labelOptions) {
            formats.push(label(labelOptions));
        }
        if (jsonOptions) {
            formats.push(json(jsonOptions));
        }
        if (!formats.length)
            return;
        return combine(...formats);
    }
    getTransports(config) {
        const { path } = config || {};
        if ((0, lodash_1.isEmpty)(path))
            return [];
        const { log, filename, dirname = __dirname } = path;
        const _transports = [
            new winston_1.transports.File({ dirname, filename: filename }),
        ];
        if (log) {
            _transports.push(new winston_1.transports.Console({ level: log }));
        }
        return _transports;
    }
    // 网络请求日志打印
    logReq(request, data, loggerKey = this.reqLogKey) {
        const logger = this.logger.get(loggerKey);
        if (!logger)
            return;
        const info = (0, formatLog_1.formatLogReq)(request, data);
        logger.log(logger.level, info);
    }
    // 字符串日志打印
    logInfo(message, context = {}, loggerKey = this.infoLogKey) {
        const logger = this.logger.get(loggerKey);
        if (!logger)
            return;
        const info = (0, formatLog_1.formatLogInfo)(message, context);
        logger.log(logger.level, info);
    }
};
LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(constants_1.REQ_LOG_TOKEN)),
    __param(2, (0, common_1.Inject)(constants_1.INFO_LOG_TOKEN)),
    __param(3, (0, common_1.Inject)(constants_1.CHECK_PATH_INTERVAL_TOKEN)),
    __param(4, (0, common_1.Inject)(constants_1.LOG_CONFIG_KEY)),
    __metadata("design:paramtypes", [config_1.ConfigService, String, String, Number, String])
], LoggerService);
exports.LoggerService = LoggerService;
