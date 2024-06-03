import {configure, getLogger, LogLevel} from '@log4js2/core';

configure({
    level: LogLevel.INFO,
    layout: '%d [%p] %c %F:%M:%line - %m %ex',
    appenders: ['Console'],
    loggers: [{
        tag: 'App',
        logLevel : LogLevel.INFO
    } as any]
});
const logger = getLogger('app');
console.info=console.log=logger.info.bind(logger)
console.warn=logger.warn.bind(logger)
console.error=logger.error.bind(logger)