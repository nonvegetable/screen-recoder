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
                click: () => selectSource()
            };
        })
    );

    videoOptionsMenu.popup();
}

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
}
