'use strict';
let count = 0

var intervalId;
const datestring = new Date().toString()


// Put variables in global scope to make them available to the browser console.
const constraints = window.constraints = {
    audio: false,
    video: {
        facingMode: "environment"
    },
    height: 8000,
    width: 8000,
};

function handleSuccess(stream) {
    const video = document.querySelector('video');
    video.srcObject = stream;
    const videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    // make track variable available to browser console.
    [window.track] = stream.getVideoTracks();
    document.createElement("canvas");

    loadProperties(stream);
    document.querySelector('#stopVideo').addEventListener('click', e => stopStreamedVideo(stream));

}


function stopStreamedVideo(stream) {
    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => {
        track.stop();
    });
    clearInterval(intervalId)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takepicture(stream) {
    const capturedFramesElement = document.querySelector('#capturedFrames');
    const video = document.querySelector('video');
    const ctx = canvas.getContext("2d");
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
        count = count + 1
        var imagesRef = window.ref(window.storageRef, `${datestring}/${count}.jpg`);
        window.uploadBytes(imagesRef, blob).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
        const imageUrl = URL.createObjectURL(blob);
        const imgElem = new Image();
        imgElem.src = imageUrl;
        capturedFramesElement.appendChild(imgElem);
    });

}


async function loadProperties(stream) {
    const track = window.track;
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    console.log('Capabilities: ', capabilities);
    console.log('Settings: ', settings);

    // if (capabilities.facingMode
    // )

    await track.applyConstraints({
        advanced: [{
            exposureMode: "manual",
        }]
    });
    await track.applyConstraints({
        advanced: [{
            exposureTime: capabilities.exposureTime.max,
            iso: capabilities.iso.max
        }]
    });

    jsonDump(capabilities)
    jsonDump(settings)

    window.setTimeout(() => stopStreamedVideo(stream), 35000)
    window.setTimeout(() => {
        intervalId = window.setInterval(function () {
            takepicture(stream)
        }, capabilities.exposureTime.max / 10);
    }, 5000)




    //   for (const property of ['exposureMode', 'exposureTime', 'exposureCompensation', 'brightness', 'whiteBalanceMode']) {
    //     // Check whether camera supports exposure.
    //     if (!(property in settings)) {
    //       errorMsg(`Camera does not support ${property}.`);
    //       continue;
    //     }

    //     let element;

    //     if (Array.isArray(capabilities[property])) {
    //       // Map it to a select element.
    //       const select = document.querySelector(`select[name=${property}]`);
    //       element = select;
    //       if (capabilities[property] && !refreshValuesOnly) {
    //         for (const mode of capabilities[property]) {
    //           select.insertAdjacentHTML('afterbegin', `<option value="${mode}">${mode}</option>`);
    //         }
    //       }
    //     } else {
    //       // Map it to a slider element.
    //       const input = document.querySelector(`input[name=${property}]`);
    //       element = input;
    //       input.min = capabilities[property].min;
    //       input.max = capabilities[property].max;
    //       input.step = capabilities[property].step;
    //     }

    //     element.value = settings[property];
    //     element.disabled = false;
    //     if (!refreshValuesOnly) {
    //       element.oninput = async event => {
    //         try {
    //           const constraints = {advanced: [{[property]: element.value}]};
    //           await track.applyConstraints(constraints);
    //           console.log('Did successfully apply new constraints: ', constraints);
    //           console.log('New camera settings: ', track.getSettings());
    //         } catch (err) {
    //           console.error('applyConstraints() failed: ', err);
    //         }
    //       };
    //     }
    //   }
}

function handleError(error) {
    if (error.name === 'NotAllowedError') {
        errorMsg('Permissions have not been granted to use your camera, ' +
            'you need to allow the page access to your devices in ' +
            'order for the demo to work.');
    }
    errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

function jsonDump(json) {
    const errorElement = document.querySelector('#jsonDump');
    errorElement.innerHTML += `<p>${JSON.stringify(json, null, 2)}</p>`;
}

async function init(e) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
        e.target.disabled = true;
    } catch (e) {
        handleError(e);
    }
}

document.querySelector('#showVideo').addEventListener('click', e => init(e));

// // Create a root reference
// const storage = getStorage();

// // Create a reference to 'mountains.jpg'
// const mountainsRef = ref(storage, 'mountains.jpg');

// // Create a reference to 'images/mountains.jpg'
// const mountainImagesRef = ref(storage, 'images/mountains.jpg');

// // While the file names are the same, the references point to different files
// mountainsRef.name === mountainImagesRef.name;           // true
// mountainsRef.fullPath === mountainImagesRef.fullPath;   // false 