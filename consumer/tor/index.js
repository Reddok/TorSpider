const fs = require('fs'),
    spawn = require('child_process').spawn,
    mkdirp = require('mkdirp'),
    copy = require('copy-dir'),
    path = require('path');

/*Тут все синхронне тому що все одно, поки не буде створений робочий тор, нічого працювати не буде. Все очікує на нього*/

function createTor (options) {

    const {controlPort} = options,
        instancePath = path.join('./tor/instances', `${controlPort}`),
        execPath = './tor/tor';

    let torProcess;

    try{
        fs.access(instancePath, fs.constants.F_OK);
    } catch(err) {
        createInstance(instancePath, options);
    }


    torProcess = spawn('tor.exe',['-f', path.join('../../', instancePath, 'torrc')], {cwd: execPath});

    return new Promise( (res, rej) => {

        torProcess.stdout.on('data', data => {
            const regexp = /Bootstrapped 100%: Done/;
            if(regexp.test(data)) res(torProcess);
        });

        torProcess.on('exit', (code) => rej(new Error(`Tor exited with code ${code}`)));

        torProcess.stderr.on('data', data => {
            console.log("Tor err: ", data.toString());
        });

    }) ;
}


function createInstance(instancePath, options) {
    const configContent = createConfig(options);

    mkdirp.sync(instancePath);
    fs.writeFileSync(path.join(instancePath, 'torrc'), configContent);
    copy.sync('./tor/dataExample', path.join(instancePath, 'data'));
}

function createConfig(options) {
    let {controlPort, socksPort, countries=['ru', 'ua', 'by', 'kz']} = options,
        base = '';

    base += `ControlPort ${controlPort}\r\n`;
    base += `SocksPort ${socksPort}\r\n`;
    base += `ExitNodes ${countries.map(c => `{${c}}`).join(',')}\r\n`;
    base += `DataDirectory ../instances/${controlPort}/data\r\n`;
    base += 'HashedControlPassword 16:7306F3AC283F5AD460119CF3F45CAFB627E0800418C521FEFEE1416163';

    return base;
}

module.exports = createTor;