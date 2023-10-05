import React, { useEffect, useState } from 'react';

const FaceApiLoader = () => {
    const [faceExpressionData, setFaceExpressionData] = useState([]);
    const [exportedCSVData, setExportedCSVData] = useState('');
    const [collectingData, setCollectingData] = useState(false);
    const [exportButtonDisabled, setExportButtonDisabled] = useState(true);

  useEffect(() => {
    let videoWidth, videoHeight, canvas, videoElement;

    const loadFaceApi = async () => {
      try {
        // Create a script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
        script.async = true;

        // Define a callback function to be executed when the script is loaded
        script.onload = () => {
          initializeFaceApi();
        };

        // Append the script to the document's head
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading face-api.js:', error);
      }
    };

    const initializeFaceApi = async () => {
      try {
        // Wait for face-api.js to be defined
        await new Promise((resolve) => {
          if (window.faceapi) {
            resolve();
          } else {
            window.addEventListener('face-api-ready', () => {
              resolve();
            });
          }
        });

        console.log('Loading models...');
        await Promise.all([
          window.faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          window.faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);

        console.log('Models loaded.');

        // Access the webcam and start tracking facial expressions
        videoElement = document.getElementById('video');

        // Wait for the video's metadata to be loaded
        videoElement.addEventListener('loadedmetadata', () => {
          // Now the video dimensions should be available
          videoWidth = videoElement.videoWidth;
          videoHeight = videoElement.videoHeight;
          console.log('Video dimensions:', videoWidth, videoHeight);

          // Create a canvas with the video dimensions
          canvas = document.getElementById('canvas');
          const context = canvas.getContext('2d');

          // Set the willReadFrequently attribute to true
          context.canvas.willReadFrequently = true;

          canvas.width = videoWidth;
          canvas.height = videoHeight;
          document.body.appendChild(canvas);

          // Detect facial expressions in real-time
          videoElement.addEventListener('play', () => {
            const displaySize = { width: videoWidth, height: videoHeight };
            window.faceapi.matchDimensions(canvas, displaySize);

            setInterval(async () => {
              // Ensure that all models are loaded before inference
              if (
                window.faceapi.nets.ssdMobilenetv1.params &&
                window.faceapi.nets.tinyFaceDetector.params &&
                window.faceapi.nets.faceLandmark68Net.params &&
                window.faceapi.nets.faceRecognitionNet.params &&
                window.faceapi.nets.faceExpressionNet.params
              ) {
                const detections = await window.faceapi.detectAllFaces(videoElement)
                  .withFaceLandmarks()
                  .withFaceDescriptors()
                  .withFaceExpressions();

                const resizedDetections = window.faceapi.resizeResults(detections, displaySize);

                const canvasContext = canvas.getContext('2d');
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                window.faceapi.draw.drawDetections(canvas, resizedDetections);
                window.faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                window.faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                // Log face expression data to the console
                if (detections.length > 0) {
                  const expressionData = detections[0].expressions;
                  console.log('Face Expressions:', expressionData);
                }
              }
            }, 100);
          });
        });

        // Make sure to set the video source after adding the event listener
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoElement.srcObject = stream;
          })
          .catch((error) => {
            console.error('Error accessing the webcam:', error);
          });
      } catch (error) {
        console.error('Error initializing face-api.js:', error);
      }
    };

    loadFaceApi();
  }, []);
  const startDataCollection = () => {
    setCollectingData(true);
    setFaceExpressionData([]); // Clear existing data when starting
    setExportButtonDisabled(true); // Disable export button when collecting data
  };

  const stopDataCollection = () => {
    setCollectingData(false);
    setExportButtonDisabled(false); // Enable export button when data collection stops
  };

  const exportExpressionDataToCSV = () => {
    if (faceExpressionData.length === 0) {
      return;
    }

    const columnNames = 'Date, Time, Happy, Sad, Surprised, Neutral, Fearful, Disgusted, Angry';
    const csvRows = faceExpressionData.map((entry) => [
      entry.timestamp,
      entry.happy.toFixed(2),
      entry.sad.toFixed(2),
      entry.surprised.toFixed(2),
      entry.neutral.toFixed(2),
      entry.fearful.toFixed(2),
      entry.disgusted.toFixed(2),
      entry.angry.toFixed(2),
    ]);

    const updatedCsvContent = [columnNames, ...csvRows.map((row) => row.join(','))].join('\n');
    setExportedCSVData(updatedCsvContent);

    // Create a Blob and trigger the download
    const blob = new Blob([updatedCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expression_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>FaceAPI.js Live Facial Expression Tracking</h2>
      <video id="video" autoPlay muted playsInline />
      <canvas id="canvas" />

      {/* Display the expression data in a table */}
      <h3>Expression Data</h3>
      <button onClick={startDataCollection} disabled={collectingData}>
        Start Data Collection
      </button>
      <button onClick={stopDataCollection} disabled={!collectingData}>
        Stop Data Collection
      </button>
      <button onClick={exportExpressionDataToCSV} disabled={exportButtonDisabled}>
        Export Expression Data to CSV
      </button>

      {/* Display exported CSV data */}
      {exportedCSVData && (
        <div>
          <h3>Exported CSV Data</h3>
          <textarea rows="10" cols="50" readOnly value={exportedCSVData} />
        </div>
      )}
    </div>
  );
};

export default FaceApiLoader;