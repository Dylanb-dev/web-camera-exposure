/*
 *  Copyright (c) 2022 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
let count = 0

// Put variables in global scope to make them available to the browser console.
const constraints = window.constraints = {
    audio: false,
    video: true,
    // video: {
    //     facingMode: { exact: "environment" }
    // },
    height: 320,
    width: 320,
};

function handleSuccess(stream) {
    const video = document.querySelector('video');
    const videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    video.srcObject = stream;

    // make track variable available to browser console.
    [window.track] = stream.getVideoTracks();

    loadProperties();
}

takePicture.addEventListener(
    "click",
    (ev) => {
        takepicture();
        ev.preventDefault();
    },
    false
);


function takepicture() {
    const video = document.querySelector('video');

    const context = canvas.getContext("2d");
    canvas.width = 320;
    canvas.height = 320;
    context.drawImage(video, 0, 0, 320, 320);
    const data = canvas.toDataURL("image/png");
    const capturedFramesElement = document.querySelector('#capturedFrames');
    count = count + 1
    capturedFramesElement.innerHTML += `<img id="photo${count}" alt="" width="320" height="320"/>`;
    const photoElement = document.querySelector(`#photo${count}`);
    photoElement.setAttribute('src', data)
}


async function loadProperties() {
    const track = window.track;
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    console.log('Capabilities: ', capabilities);
    console.log('Settings: ', settings);

    await track.applyConstraints({
        advanced: [{
            exposureMode: "manual",
        }]
    });
    await track.applyConstraints({
        advanced: [{
            exposureTime: capabilities.exposureTime.max
        }]
    });

    jsonDump(capabilities)
    jsonDump(settings)

    var intervalId = window.setInterval(function(){
        takepicture()
      }, capabilities.exposureTime.max/10);

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