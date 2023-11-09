import React, { useEffect, useState } from 'react';

const FaceApiLoader = ({videoStream}) => {
  const [ setFaceExpressionData] = useState([]);



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
        videoElement.srcObject = videoStream; // Set the provided video stream

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

                // Log face expression data to the console and update state
                if (detections.length > 0) {
                  const expressionData = detections[0].expressions;
                  console.log('Face Expressions:', expressionData);
                  setFaceExpressionData((prevData) => [
                    ...prevData,
                    {
                      timestamp: new Date().toLocaleDateString(),
                      ...expressionData,
                    },
                  ]);
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
  }, [setFaceExpressionData, videoStream]);

  return (
    <div>
      <h2>FaceAPI.js Live Facial Expression Tracking</h2>
      <video id="video" autoPlay muted playsInline />
      <canvas id="canvas" />
    </div>
  );
};

export default FaceApiLoader;




