const fs = require('fs');
const {Worker} = require('worker_threads');


const COMPUTER_NUMBER = 0;
const COUNT_COMPUTER = 2;
const COUNT_THREADS = 8;

class Generator {
    constructor(numberOfWorkers) {
        this.numberOfWorkers = numberOfWorkers;
        this.workers = [];

        this.createWorkers();
    }

    createWorkers() {
        for (let i = 0; i < this.numberOfWorkers; ++i) {
            this.workers.push(new Worker(__dirname + '/worker.js'));
        }
    }

    start(startGlobalChunk, endGlobalChunk, tasks) {
        const sizeChunk = (endGlobalChunk - startGlobalChunk) / this.numberOfWorkers;
        for (let i = 0; i < this.numberOfWorkers; ++i) {
            console.log(`[${i}]: Chunk ${startGlobalChunk + sizeChunk * i} - ${startGlobalChunk + sizeChunk * (i + 1)}`);
            this.workers[i].postMessage({startChunk: startGlobalChunk, numberWorker: i, tasks: tasks.slice(startGlobalChunk + sizeChunk * i, startGlobalChunk + sizeChunk * (i + 1))});
        }
        console.log();
    }
}


async function main() {
    const dirInDir = fs.readdirSync('mocks/', {withFileTypes: true})
        .filter((item) => item.isDirectory())
        .map((item) => 'mocks/' + item.name + '/'); // mass of folders

    const pass = []; // mass of images in folders
    for (let i = 0; i < dirInDir.length; i++) {
        pass[i] = fs.readdirSync(dirInDir[i], {withFileTypes: true})
            .filter((item) => !item.isDirectory())
            .map((item) => dirInDir[i] + item.name);
    }

    let result = pass[0].map(function (item) {
        return [item];
    });

    for (let k = 1; k < pass.length; k++) { // mass image versions
        let next = [];
        result.forEach(function (item) {
            pass[k].forEach(function (word) {
                let line = item.slice(0);
                line.push(word);
                next.push(line);
            })
        });
        result = next;
    }

    const generator = new Generator(COUNT_THREADS);

    const chunkSize = result.length / COUNT_COMPUTER;
    const startChunk = COMPUTER_NUMBER * chunkSize;
    const endChunk = (COMPUTER_NUMBER + 1) * chunkSize;

    console.log('Number of images:', result.length);
    console.log(`Chunk: ${startChunk} - ${endChunk}\n`);

    const startTime = Date.now();
    console.log(`Start timestamp: ${startTime}\n`);
    generator.start(startChunk, endChunk, result);

}

main();
