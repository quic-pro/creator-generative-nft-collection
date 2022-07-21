const {parentPort} = require('worker_threads');
const Jimp = require("jimp");


const OUTPUT_PATH = 'results/';
const IMAGE_SIZE = 600;


async function generate(startChunk, numberWorker, tasks) {
    const baseNumImg = startChunk + numberWorker * tasks.length;
    const startTime = Date.now();
    for (let j = 0; j < tasks.length; j++) {
        let images = [];

        for (let l = 0; l < tasks[j].length; l++) {
            images.push(await Jimp.read(tasks[j][l]));
        }

        for (let p = 1; p < images.length; p++) {
            await images[0].composite(images[p], 0, 0); // img compile
        }

        let numImg = baseNumImg + j;

        await images[0].resize(IMAGE_SIZE, IMAGE_SIZE); // resize img
        await images[0].write(OUTPUT_PATH + numImg.toString() + '.png'); // save img
        console.log(`[${numberWorker}]: #${j}(${numImg}) time: ${(Date.now() - startTime) / 1000}`);
    }
}


parentPort.on('message', ({startChunk, numberWorker, tasks}) => {
    generate(startChunk, numberWorker, tasks)
});
