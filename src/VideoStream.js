import { useEffect } from 'react';

const VideoStream = ({ onStream }) => {
  useEffect(() => {
    // Check for media devices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      return;
    }

    // Define constraints for video (you can modify this as needed)
    const constraints = {
      video: {
        facingMode: 'user', // or 'environment' for rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    const startStream = async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        onStream(userMediaStream);
      } catch (error) {
        console.error('Error accessing the webcam:', error);
      }
    };

    startStream(); // Start the camera stream when the component mounts
  }, [onStream]);

  return null; // No need to render anything, as this component manages the stream.
};

export default VideoStream;
