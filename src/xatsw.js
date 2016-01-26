'use strict'

const path = require('path');
const fs = require('fs');

const commandLineCommands = require('command-line-commands');
const prompt = require('prompt');

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

const cli = commandLineCommands([
    { 
        name: 'extract', 
        definitions: [ 
            { name: 'name', type: String }, 
            { name: 'storage', type: String },
            { name: 'target', type: String },
        ] 
    },
    { 
        name: 'load', 
        definitions: [ 
            { name: 'name', type: String }, 
            { name: 'storage', type: String },
            { name: 'target', type: String },
        ] 
    },
]);

const command = cli.parse();

switch (command.name) {
    case 'extract':
    case 'load':
        const storeName = command.options.name,
            storage = command.options.storage,
            target = command.options.target;

        

        new Promise(function (resolve, reject) {
            if (storeName) {
                resolve(storeName);
            }
            reject()
        }).catch(function (e) {
            return askName(storage);
        }).then(function (storeName) {

            const nameInStore = path.join(storage, storeName), 
                nameInTarget = path.join(target, 'chat.sol');


            const load = command.name == 'load';

            const copyTo = fs.createWriteStream(load ? nameInStore : nameInTarget);
            fs.createReadStream(load ? nameInTarget : nameInStore).pipe(copyTo);
        });

        break;
}
