'use strict'

const path = require('path');
const fs = require('fs');

var program = require('commander');
const prompt = require('prompt');


function readConf() {
    try {
        var config = fs.readFileSync('xatsw.conf', 'utf8');
        config = JSON.parse(config);
        return config;
    } catch (e) {
        console.log('error while config reading:', e);
        return {}; 
    }
}

function saveConf(config) {
    fs.writeFileSync('xatsw.conf', JSON.stringify(config));
}


var config = readConf();

function askName(path) {
    return new Promise(function (resolve, reject) {
        prompt.start();
        prompt.get([
            {
                name: 'storeName',
                type: 'string',
                description: 'set the name of loading profile',
                pattern: `.[^${path.sep}]`,
                messages: {
                    pattern: 'Please, enter valid filename',
                    conform: 'File shouldn\'t exist.'
                },
                conform: function (value) {
                    try {
                        fs.accessSync(path.join(path, value));
                        return false;
                    } catch (e) {
                        return true;
                    }
                }
            }
        ], function (err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res.storeName);
        });
    });
}



class ProfileWorker {

    constructor(options) {
        this.options = options;
    }

    processArgs() {
        const storeName = this.options.name,
            storage = this.options.storage,
            target = this.options.target;

        

        return new Promise(function (resolve, reject) {
            if (storeName) {
                resolve(storeName);
            }
            reject()
        }).catch(function (e) {
            return askName(storage);
        }).then(function (storeName) {
            return Promise.resolve({ 
                inStorage: path.join(storage, storeName),
                inTarget: path.join(target, 'chat.sol')
            });
        });

    }

    load() {
        this.processArgs()
            .then(function (names) {
                const wstream = fs.createWriteStream(names.inStorage);
                fs.createReadStream(names.inTarget).pipe(wstream);
            })
    }

    extract() {
        this.processArgs()
            .then(function (names) {
                const wstream = fs.createWriteStream(names.inTarget);
                fs.createReadStream(names.inStorage).pipe(wstream);
            })
            
    }
}

program
    .version('0.1.0');

program
    .command('extract')
    .description('Extracting existing profile to flash local storage')
    .option('-s, --storage [storage]', 'Where to store')
    .option('-t, --target [target]', 'From whence to store')
    .option('-n, --name [name]', 'Name of stored profile')
    .action(function(options) {
        new ProfileWorker(options).extract();
    });


program
    .command('load')
    .description('Loading profile from flash local storage')
    .option('-s, --storage [storage]', 'Where to store')
    .option('-t, --target [target]', 'From whence to store')
    .option('-n, --name [name]', 'Name of stored profile')
    .action(function(options) {
        new ProfileWorker(options).load();
    });


program.parse(process.argv);

saveConf(config);
