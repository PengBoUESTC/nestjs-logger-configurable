"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
const constants_1 = require("./constants");
let LoggerModule = LoggerModule_1 = class LoggerModule {
    static register(options) {
        // TODO-PB checkInterval 配置应该放在哪里？？
        const { isGlobal, reqLogKey, infoLogKey, logConfigKey = 'LogConfig', checkInterval = 60000, } = options || {};
        const providers = [
            logger_service_1.LoggerService,
            {
                provide: constants_1.REQ_LOG_TOKEN,
                useValue: reqLogKey,
            },
            {
                provide: constants_1.INFO_LOG_TOKEN,
                useValue: infoLogKey,
            },
            {
                provide: constants_1.CHECK_PATH_INTERVAL_TOKEN,
                useValue: checkInterval,
            },
            {
                provide: constants_1.LOG_CONFIG_KEY,
                useValue: logConfigKey,
            },
        ];
        return {
            global: !!isGlobal,
            module: LoggerModule_1,
            providers: providers,
            exports: [...providers],
        };
    }
};
LoggerModule = LoggerModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [logger_service_1.LoggerService],
        exports: [logger_service_1.LoggerService],
    })
], LoggerModule);
exports.LoggerModule = LoggerModule;
