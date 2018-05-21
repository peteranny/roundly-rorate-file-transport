# roundly-rotate-file-transport

A transport for [winston](https://github.com/winstonjs/winston) which logs to a rotating file, one log per round, limiting the total number of logs.

## Install
```
npm install roundly-rotate-file-transport
```

## Usage
``` js
const winston = require('winston');
const RoundlyRotateFileTransport = require('roundly-rotate-file-transport');

const logger = winston.createLogger({
    transports: [
        new RoundlyRotateFileTransport({
            /* --- options --- */
            filename: `${__dirname}/my-log.log`,
            max_files: 10,
        }),
    ],
});

logger.info('Hello World!');
```

Every invocation of `RoundlyRotateFileTransport` will preserve the current file naming `options.filename` by renaming it to a timestamped filename. And then create another new file with the name `options.name`. Only the latest `options.max_files` timestamped files will be kept.

``` js
const opt = { filename: `demo.log`, max_files: 2 }; // keep 2 timestamped files

new RoundlyRotateFileTransport(opt);
// Files: demo.log                                  <- current log

new RoundlyRotateFileTransport(opt); // second call
// Files: demo.log                                  <- current log
//        demo_1526883332317_2018-5-21_14:15:32.log <- last log

new RoundlyRotateFileTransport(opt); // third call
// Files: demo.log                                  <- current log
//        demo_1526883332317_2018-5-21_14:15:32.log
//        demo_1526883336146_2018-5-21_14:15:36.log <- last log

new RoundlyRotateFileTransport(opt); // forth call
// Files: demo.log                                  <- current log
//        demo_1526883336146_2018-5-21_14:15:36.log
//        demo_1526884516910_2018-5-21_14:35:16.log <- last log
```

## Options

* **options.filename** The filename you want to log to. Assign the path if you want to keep the file in another directory.
* **options.max_files** The max number of log files you want to keep. Defaults to 0.

##### AUTHOR: [Peter Shih](https://github.com/peteranny)
