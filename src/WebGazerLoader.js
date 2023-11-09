import React, { useEffect } from 'react';

const WebGazerLoader = ({ videoStream }) => {
  useEffect(() => {
    async function setupWebGazer() {
      // Load the WebGazer.js script
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Initialize WebGazer
      window.webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null) {
          return;
        }
        // Handle gaze data
        const gazeX = data.x;
        const gazeY = data.y;
        console.log(`Gaze coordinates: X=${gazeX}, Y=${gazeY}`);

        // Display gaze coordinates on the screen (for demonstration)
        const gazeDiv = document.getElementById('gaze-coordinates');
        gazeDiv.textContent = `Gaze coordinates: X=${gazeX}, Y=${gazeY}`;
      }).begin();

      if (videoStream) {
        const videoElement = document.getElementById('webgazerVideoFeed');
        videoElement.srcObject = videoStream;
      }
    }

    // Call the setupWebGazer function to initialize WebGazer
    setupWebGazer();

    // Check for media devices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      return;
    }

  }, [videoStream]);

  return (
    <div>
      <div id="gaze-coordinates" style={{ position: 'absolute', top: '10px', left: '10px' }}></div>
    </div>
  );
};

export default WebGazerLoader;
