'use strict'

const path = require('path');
const fs = require('fs');

var program = require('commander');
const prompt = require('prompt');


function readConf() {
    var config;
    try {
        config = fs.readFileSync('xatsw.conf', 'utf8');
        config = JSON.parse(config);
    } catch (e) {
        console.log('error while config reading:', e);
        config = {};
    }
    config.storages = config.storages || {};
    return config;
}

function saveConf(config) {
    fs.writeFileSync('xatsw.conf', JSON.stringify(config));
}


var config = readConf();

process.on('exit', function () { saveConf(config) });

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
            storage = this.options.storage || config.current_storage,
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
    .action(function (options) {
        new ProfileWorker(options).extract();
    });


program
    .command('load')
    .description('Loading profile from flash local storage')
    .option('-s, --storage [storage]', 'Where to store')
    .option('-t, --target [target]', 'From whence to store')
    .option('-n, --name [name]', 'Name of stored profile')
    .action(function (options) {
        new ProfileWorker(options).load();
    });


program
    .command('list-storage')
    .description('Shows full list of storages')
    .action(function () {
        for (var key in config.storages) {
            console.log('%s %s', key, config.storages[key]);
        }
    });


program
    .command('set-storage [name]')
    .description('Set current storage, used by default')
    .action(function (name) {
        if (config.storages[name]) {
            config.current_storage = name;
        } else {
            console.error('Storage with name %s doesn\'t exists', name);
        }
    })

program
    .command('add-storage [name] [path]')
    .description('Adding new storage to storage list')
    .action(function (name, path) {
        try {
            if (fs.lstatSync(path).isDirectory()) {                
                new Promise(function (resolve, reject) {
                    if (config.storages[name]) {
                        prompt.start();
                        return prompt.get([{
                            name: 'confirm',
                            pattern: /^[y|n]$/,
                            description: 'Storage with name ' + name +
                                ' is already exists. Rewrite?',
                            message: 'Please, type y or n',
                            required: true
                        }], function (err, res) {
                            if (err || res.confirm === 'n') {
                                reject();
                            }
                            resolve();
                        });
                    } 
                    resolve();
                }).then(function () {
                    config.storages[name] = path;
                }).catch(function () {
                    
                })
            } else {
                console.error('File %s is not directory', storage);
            }
        } catch (e) {
            console.error('File %s doesn\'t exists', storage);
        }
    });

program
    .command('remove-storage [name]')
    .description('Remove storage from storage list')
    .action(function (name) {
        delete config.storages[name];
     });

program.parse(process.argv);

