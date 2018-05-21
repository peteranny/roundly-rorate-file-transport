const Transport = require('winston-transport');
const path = require('path');
const fs = require('fs');
const MESSAGE = require('triple-beam').MESSAGE;
const os = require('os');

function prepareDirectory(dirpath) {
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
}

function moveMainFileIntoRotation(dirpath, filename, next_filename) {
    const filepath = path.resolve(dirpath, filename);
    if (fs.existsSync(filepath)) {
        const next_filepath = path.resolve(dirpath, next_filename);
        fs.renameSync(filepath, next_filepath);
    }
}

function cleanRedundantRotationFiles(dirpath, regex, max_files) {
    const logfiles = fs.readdirSync(dirpath).filter(filename => regex.test(filename));
    logfiles.sort();
    while (logfiles.length > max_files) {
        const filename_to_delete = logfiles.shift();
        const filepath_to_delete = path.resolve(dirpath, filename_to_delete);
        fs.unlinkSync(filepath_to_delete);
    }
}

function getTimestampedLogFilename(filename) {
    const parts = filename.split('.log');
    parts[0] = `${parts[0]}_${Date.now()}_${new Date().toLocaleString().replace(/\s/g, '_')}`;
    return parts.join('.log');
}

getTimestampedLogFilename.getRegExp = filename => {
    const parts = filename.split('.log');
    parts[0] = `${parts[0]}.*`;
    return new RegExp(`^${parts.join('.log')}$`);
};

function rotateFiles(dirpath, filename, getNextFilename, max_files) {
    moveMainFileIntoRotation(dirpath, filename, getNextFilename(filename));
    cleanRedundantRotationFiles(dirpath, getNextFilename.getRegExp(filename), max_files);
}

module.exports = class CustomTransport extends Transport {
    constructor(opts) {
        super(opts);

        if (opts && opts.filename) {
            const log_dirpath = path.dirname(opts.filename);
            prepareDirectory(log_dirpath);

            const max_log_files = opts.max_files > 0 ? opts.max_files : 0;
            const log_filename = path.basename(opts.filename);
            rotateFiles(log_dirpath, log_filename, getTimestampedLogFilename, max_log_files);

            const log_filepath = path.resolve(log_dirpath, log_filename);
            this.logStream = fs.createWriteStream(log_filepath);
        }
    }

    log(info, callback) {
        this.logStream.write(info[MESSAGE] + os.EOL);
        this.emit('logged', info);
        callback();
    }
};