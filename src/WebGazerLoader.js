import React, { useEffect, useState } from 'react';

const WebGazeLoader = ({ videoStream, onUpdateContext }) => {
  const [context, setContext] = useState({ x: -1, y: -1 });
  // const [calibrationNeeded, setCalibrationNeeded] = useState(true);

  useEffect(() => {
    // Load the WebGazer.js script
    const handleScriptLoad = () => {
      if (typeof window.webgazer !== 'undefined') {
        window.webgazer
          .setGazeListener((data, elapsedTime) => {
            if (data == null) {
              return;
            }
            setContext(window.webgazer.util.bound(data));
          })
          .begin();
      } else {
        console.error('WebGazer is not defined. The script may not have loaded correctly.');
      }
    };

    // Handle script load error
    const handleScriptError = () => {
      console.log('Error loading WebGazer.js script');
    };

    // Load the WebGazer.js script
    const script = document.createElement('script');
    script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.head.appendChild(script);

    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
    };
  }, []);

  useEffect(() => {
    if (videoStream) {
      const videoElement = document.getElementById('video');

      if (videoElement) {
        videoElement.srcObject = videoStream;
      }
    }
  }, [videoStream]);

  return (
    <div>
      <div>
        <h3>WebGazer.js Data</h3>
        <p>X: {context.x}</p>
        <p>Y: {context.y}</p>
      </div>
    </div>
  );
};

export default WebGazeLoader;
