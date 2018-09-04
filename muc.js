#!/usr/bin/env node

const path = require('path');
const notifier = require('node-notifier');
const si = require('systeminformation');

// times
const checkTime = 1 * 60 * 1000;

const times = [
    { fromPercent: 100, time: 10 * 60 * 1000 },
    { fromPercent: 20, time: 5 * 60 * 1000 },
    { fromPercent: 10, time: 2 * 60 * 1000 },
    { fromPercent: 5, time: 1 * 60 * 1000 },
];

const timer = {
    percent: 100,
    show: true,
    timeout: null,
};


function toMB(memoryStatus) {
    return Math.floor(memoryStatus.free / 1024 / 1024).toLocaleString();
}

function toPercent(memoryStatus) {
    return Math.floor(memoryStatus.free / memoryStatus.total * 100);
}

function showNotification(memoryStatus) {
    console.log(`${new Date().toLocaleString()} \t Free: ${toPercent(memoryStatus)}%, ${toMB(memoryStatus)} MB`);
    notifier.notify(
        {
          title: 'Status of your memory',
          message: `Free: ${toPercent(memoryStatus)}%, ${toMB(memoryStatus)} MB`,
          icon: path.resolve(__dirname, 'ram.png'),
          sound: true,
        },
        (err, response) => {
            if (err) {
                console.log(`Error: ${err}`);
            }

            setTimeout(check, checkTime);
        }
    );
}

function check() {
    si.mem((memoryStatus) => {
        const percent = toPercent(memoryStatus);
        const mb = toMB(memoryStatus);

        const timeByPercent = times.reduce((currentTime, time) => percent <= time.fromPercent ? time : currentTime);

        if (timeByPercent.fromPercent > timer.percent) {
            if (timer.timeout) {
                clearTimeout(timer.timeout);
            }
            timer.show = true;
        }

        if (timer.show) {
            timer.index = timeByPercent.fromPercent;
            timer.show = false;
            timer.timeout = setTimeout(() => time.show = true, timeByPercent.time);

            showNotification(memoryStatus);
        }
    });
}

console.log(`
 __  __ _    _  _____ 
|  \\/  | |  | |/ ____|
| \\  / | |  | | |     
| |\\/| | |  | | |     
| |  | | |__| | |____ 
|_|  |_|\\____/ \\_____|
        
Memory  Usage  Checker

Do you have problem that your ram is still full?
This tool will report you usage of your memory and you can intervene in time.
You can check the status in notification or in console.
The more full memory you have, the more the MUC reminds you.

Logs:`)

check();