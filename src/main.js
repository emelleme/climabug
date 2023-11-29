const ecobugImage = document.getElementById('climabug-image');
const audioElement = document.getElementById('climabug-audio');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audioElement);

source.connect(analyser);
analyser.connect(audioCtx.destination);

// This function will be called repeatedly to update the Ecobug's brightness
function updateBrightness() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  // Calculate an average value of the array
  let average = dataArray.reduce((a, b) => a + b) / dataArray.length;

  // Convert the average to a percentage of max 256 and then to a 0-1 range for brightness
  let brightness = average / 256;

  // Apply the brightness as a filter on the image
  ecobugImage.style.filter = `brightness(${brightness})`;
}

// Function to start updating the brightness
function startUpdatingBrightness() {
  audioCtx.resume().then(() => {
    requestAnimationFrame(function update() {
      updateBrightness();
      requestAnimationFrame(update);
    });
  });
}

// Event listeners to start/stop the brightness update based on audio playback
audioElement.addEventListener('play', startUpdatingBrightness);
audioElement.addEventListener('pause', () => {
  audioCtx.suspend();
});
audioElement.addEventListener('ended', () => {
  audioCtx.suspend();
});

// Start the audio
audioElement.play();

document.getElementById('climabug-test-btn').addEventListener('click', () => {
  // Request access to the microphone
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Function to update the Climabug's brightness based on the microphone input
      function updateBrightnessFromMic() {
        analyser.getByteFrequencyData(dataArray);

        // Calculate an average value of the array
        let average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Map the average volume to a 0-1 range (adjust as needed)
        let brightness = average / 128;

        // Apply the brightness as a filter on the image
        ecobugImage.style.filter = `brightness(${Math.min(brightness, 1)})`;

        // Keep updating the brightness
        requestAnimationFrame(updateBrightnessFromMic);
      }

      // Start the loop to update the brightness
      updateBrightnessFromMic();
    })
    .catch(err => {
      console.error('Access to the microphone was denied!', err);
    });
});
