#!/usr/bin/env node

const path = require('path');
const notifier = require('node-notifier');
const si = require('systeminformation');

// times
const second = 1000;
const minute = 60 * second;

const checkTime = 10 * second;

const times = [
    { fromPercent: 100, time: 10 * minute },
    { fromPercent: 20, time: 5 * minute },
    { fromPercent: 10, time: 2 * minute },
    { fromPercent: 5, time: 1 * minute },
];

const timer = {
    percent: 100,
    show: true,
    timeout: null,
};


function toMB(memoryStatus) {
    return Math.floor(memoryStatus.available / 1024 / 1024).toLocaleString();
}

function toPercent(memoryStatus) {
    return Math.floor(memoryStatus.available / memoryStatus.total * 100);
}

function showNotification(memoryStatus) {
    console.log(`${new Date().toLocaleString()} \t Free: ${toPercent(memoryStatus)}%, ${toMB(memoryStatus)} MB`);
    notifier.notify(
        {
          title: 'Status of your memory',
          message: `Free: ${toPercent(memoryStatus)}%, ${toMB(memoryStatus)} MB`,
          icon: path.resolve(__dirname, 'images', 'ram.png'),
          sound: true,
        },
        (err, response) => {
            if (err) {
                console.log(`Error: ${err}`);
            }
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
            timer.timeout = setTimeout(() => timer.show = true, timeByPercent.time);

            showNotification(memoryStatus);
        }

        setTimeout(check, checkTime);
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

Do you have the problem that your ram memory is getting full?
This cross platform tool (Linux, macOS, Windows) will notify you about an increased memory usage and you can intervene in time.
The higher the memory usage the more frequently MUC will remind you.

Logs:`);

check();
