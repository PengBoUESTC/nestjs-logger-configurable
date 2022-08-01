## nestjs 接入日志模块

- 基于 ```winston``` 库实现

## 使用

- ```LoggerModule``` 通过静态方法```register```返回一个动态模块```DynamicModule```。

- ```register```可接受的配置有

  1. ```isGlobal```: 模块是否是全局注册,
  2. ```reqLogKey```: ```reqLog```方法应该获取的日志打印配置,
  3. ```infoLogKey```: ```infoLog```方法应该获取的日志打印配置,
  4. ```checkInterval```: 日志打印路径检查周期,

- 为了实现 ```logger``` 打印的配置化，```loggerService```内部依赖 ```ConfigService``` 模块。因此 ```ConfigModule```要获取日志打印的的配置信息（logger配置的key为：```LogConfig```）。
  ```javascript
  const logConfig: LogConfig = this.configService.get('LogConfig') || [];
  ```

- ```logger```模块可支持的配置信息如下
```javascript
LogConfig: [
  {
    key: 'test_biz_log', // 用于获取当前配置下的 日志打印模版
    level: 'debug', // debug 类型不会打印多余的日志信息 日志打印级别 与 winston 一致
    jsonOptions: {}, // json 化配置
    labelOptions: {
      label: 'info_log', // 日志打印标签文案
    },
    // 日志打印路径
    path: {
      log: 'info', // 是否在控制台打印日志，以及日志打印级别
      dirname: '/export/Logs/xx/', // 写日志文件路径 日志打印模块会循环检查该路径是否存在，不存在会尝试创建
      filename: 'development.biz.log', // 写日志文件名 不存在会自动创建
    },
  },
]
```

```javascript
import { LoggerModule } from 'nestjs-logger-configurable';

@Module({
  imports: [
    LoggerModule.register({
      isGlobal: true,
      reqLogKey: 'req_log',
      infoLogKey: 'info_log',
    })
  ]
})

// 写日志
import { LoggerService } from 'nestjs-logger-configurable';

@Inejctable()
export class LoggerTest() {
  @Inject()
  private readonly loggerService: LoggerService;

  test() {
    // 直接通过 loggerService 提供的 api 进行日志打印
    // 以下两个 api 的日志打印模版也需要在 LogConfig 中进行配置，并通过 register 中的 两个参数指定配置 key
    this.loggerService.logInfo()  // 普通文案打印
    this.loggerService.logReq()  // 网络请求信息打印

    // 也可以在 构造函数中选择出将要使用的日志打印模版
    // 选择 LogConfig 配置中的配置模版进行信息打印
    const logger = this.loggerService.logger.get('test_biz_log');
    logger.log(logger.level, data);
  }
}
```