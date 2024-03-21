//buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectionBtn = document.getElementById('videoSelectionBtn');
videoSelectionBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

//get video sources that are available
async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['windows', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source){
    videoSelectionBtn.innerText = source.name;

    const constrains = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    const stream = await navigator.mediaDevices
        .getUserMedia(constrains);

    videoElement.srcObject = stream;
    videoElement.play();

    const options = { mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}

const { writeFile } = require('fs');

async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: 'vid-${Date.now()}.webm'
    });

    console.log(filePath);
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}
