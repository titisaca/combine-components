import React, { useEffect, useState, useRef, useCallback } from 'react';

const FaceAndGazeTracker = ({gazeData,onGazeDataUpdate}) => {
  const [faceExpressionData, setFaceExpressionData] = useState([]);
  // const [ setGazeData] = useState({ x: -1, y: -1 });
  const [exportedCSVData, setExportedCSVData] = useState('');
  // const [collectingData, setCollectingData] = useState(false);
  // const [exportButtonDisabled, setExportButtonDisabled] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoStreamRef = useRef(null);

  // const initializeFaceApi = useCallback(async () => {
  //   // if (!window.faceapi) {
  //   //   console.error('faceapi is not available. Make sure it is loaded.');
  //   //   return;
  //   // }
  //   const videoWidth = videoRef.current.videoWidth;
  //   const videoHeight = videoRef.current.videoHeight;
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext('2d');

  //   context.canvas.willReadFrequently = true;
  //   canvas.width = videoWidth;
  //   canvas.height = videoHeight;
  //   document.body.appendChild(canvas);

  //   videoRef.current.addEventListener('play', () => {
  //     const displaySize = { width: videoWidth, height: videoHeight };
  //     window.faceapi.matchDimensions(canvas, displaySize);

  //     setInterval(async () => {
  //       // Ensure that all models are loaded before inference
  //       if (
  //         window.faceapi.nets.ssdMobilenetv1.params &&
  //         window.faceapi.nets.tinyFaceDetector.params &&
  //         window.faceapi.nets.faceLandmark68Net.params &&
  //         window.faceapi.nets.faceRecognitionNet.params &&
  //         window.faceapi.nets.faceExpressionNet.params
  //       ) {
  //         const detections = await window.faceapi.detectAllFaces(videoRef.current)
  //           .withFaceLandmarks()
  //           .withFaceDescriptors()
  //           .withFaceExpressions();

  //         const resizedDetections = window.faceapi.resizeResults(detections, displaySize);

  //         const canvasContext = canvas.getContext('2d');
  //         canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  //         window.faceapi.draw.drawDetections(canvas, resizedDetections);
  //         window.faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  //         window.faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

  //         // Log face expression data to the console
  //         if (detections.length > 0) {
  //           const expressionData = detections[0].expressions;
  //           console.log('Face Expressions:', expressionData);
  //           setFaceExpressionData((prevData) => [...prevData, expressionData]);
  //         }
  //       }
  //     }, 100);
  //   });
  // }, []);
 
  const initializeWebGazer = useCallback((onGazeDataUpdate) => {
    // WebGazer initialization using the same video stream
    const handleScriptLoad = () => {
      if (typeof window.webgazer !== 'undefined') {
        window.webgazer
          .setGazeListener((data, elapsedTime) => {
            if (data !== null) {
              // setGazeData(data);
              onGazeDataUpdate(data);
            }
          })
          .begin();
      } else {
        console.error('WebGazer is not defined. The script may not have loaded correctly.');
      }
    };

    const handleScriptError = () => {
      console.error('Error loading WebGazer.js script');
    };

    const script = document.createElement('script');
    script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.head.appendChild(script);
  },[]);

  useEffect(() => {
    // Access the webcam and set up the video stream
    // let videoWidth, videoHeight, canvas;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoStreamRef.current = stream;
        videoRef.current.srcObject = videoStreamRef.current;
        videoRef.current.addEventListener('loadedmetadata', () => {
          // initializeFaceApi();
        });
        initializeWebGazer(onGazeDataUpdate);
      })
      .catch((error) => {
        console.error('Error accessing the webcam:', error);
      });

    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [ initializeWebGazer, onGazeDataUpdate]);

  // const startDataCollection = () => {
  //   setCollectingData(true);
  //   setFaceExpressionData([]);
  //   setExportButtonDisabled(true);
  //   // Your data collection logic here
  // };

  // const stopDataCollection = () => {
  //   setCollectingData(false);
  //   setExportButtonDisabled(false);
  //   // Your data collection stop logic here
  // };
  const exportGazeData = () => {
    // Use gazeDataFromChild and export it here
    // if (gazeDataFromChild) {
      // Your export logic
    
    if (faceExpressionData.length === 0) {
      return;
    }

    const columnNames = 'Date, Time, Happy, Sad, Surprised, Neutral, Fearful, Disgusted, Angry, x, y';
    const csvRows = faceExpressionData.map((entry) => [
      entry.timestamp,
      entry.happy.toFixed(2),
      entry.sad.toFixed(2),
      entry.surprised.toFixed(2),
      entry.neutral.toFixed(2),
      entry.fearful.toFixed(2),
      entry.disgusted.toFixed(2),
      entry.angry.toFixed(2),
      gazeData.x.toFixed(2),
      gazeData.y.toFixed(2),
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
      <h2>Face Expression and Gaze Tracking</h2>
      <video ref={videoRef} autoPlay muted playsInline />
      <canvas ref={canvasRef} />

      {/* Display the expression and gaze data in a table */}
      <h3>Expression Data</h3>
      <div>
        {faceExpressionData.map((expression, index) => (
          <p key={index}>{expression}</p>
        ))}
      </div>
      <h3>Gaze Data</h3>
      <p>X: {gazeData.x}</p>
      <p>Y: {gazeData.y}</p>

      {/* <button onClick={startDataCollection} disabled={collectingData}>
        Start Data Collection
      </button>
      <button onClick={stopDataCollection} disabled={!collectingData}>
        Stop Data Collection
      </button>
      <button onClick={exportExpressionDataToCSV} disabled={exportButtonDisabled}>
        Export Data to CSV
      </button>f */}

      {exportedCSVData && (
        <div>
          <h3>Exported CSV Data</h3>
          <textarea rows="10" cols="50" readOnly value={exportGazeData} />
        </div>
      )}
    </div>
  );
};

export default FaceAndGazeTracker;
