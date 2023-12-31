import React, { useState, useRef, useEffect, useCallback } from 'react';
// import ConsoleOutput from './ConsoleOutput';
import './App.css';
import FaceApiLoader from './FaceApiLoader';
import WebGazerLoader from './WebGazerLoader';
import VideoStream from './VideoStream';

const App = () => {
  const [loggedData, setLogData] = useState([]);
  const containerRef = useRef(null);
  const [isLogging, setIsLogging] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('');

  const [stream, setStream] = useState(null);

  const handleStream = useCallback((stream) => {
    // // Clone the original stream to create a new, independent stream for FaceApiLoader
    const clonedStreamForFaceApi = stream.clone();

    // Clone the original stream to create a new, independent stream for WebGazerLoader
    const clonedStreamForWebGazer = stream.clone();

    // Set the cloned streams for the respective components
    setStream({ faceApiStream: clonedStreamForFaceApi, webGazerStream: clonedStreamForWebGazer });
    // setStream(stream);

  }, []);

  useEffect(() => {
    if (
      'DeviceMotionEvent' in window &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      setPermissionStatus('pending');
    }
  }, []);

  const handleEvent = (eventData) => {
    setLogData((prevData) => [...prevData, eventData]);
  };

  const handleTouchStart = (event) => {
    const touchStartTime = Date.now();

    const handleTouchEnd = () => {
      const touchEndTime = Date.now();
      const duration = touchEndTime - touchStartTime;

      const newEvent = {
        timestamp: new Date(),
        type: 'touch',
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        duration: duration,
      };

      handleEvent(newEvent);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('touchend', handleTouchEnd, { once: true });
    }
  };
  // ...

  const logSensorData = () => {
    if (isLogging) {
      setIsLogging(false);
      return;
    }

    setIsLogging(true);

    const logData = (event) => {
      const accelerometerData = event.accelerationIncludingGravity;
      const gyroscopeData = event.rotationRate;

      // Format the timestamp with 3 decimal places for milliseconds
      const timestamp = new Date().toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        fractionalSecondDigits: 3,
      });

      const motionEvent = {
        timestamp: timestamp,
        type: 'motion',
        acceleration: accelerometerData,
        rotationRate: gyroscopeData,
      };

      handleEvent(motionEvent);

      if (isLogging) {
        window.requestAnimationFrame(logData);
      }
    };

    if (permissionStatus === 'granted') {
      window.addEventListener('devicemotion', logData);
    }
  };

  const requestDeviceMotionAccess = () => {
    if (
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      DeviceMotionEvent.requestPermission().then((permissionState) => {
        setPermissionStatus(permissionState);
        if (permissionState === 'granted') {
          console.log('Device motion access granted.');
        }
      });
    }
  };

  const exportToCSV = () => {
    if (loggedData.length === 0) {
      return;
    }

    const csvRows = [];
    const columnNames = 'Timestamp,Event Type,X,Y,Duration,Acceleration_X,Acceleration_Y,Acceleration_Z,Gyroscope_Alpha,Gyroscope_Beta,Gyroscope_Gamma';

    csvRows.push(columnNames);

    loggedData.forEach((event) => {
      const timestamp = new Date(event.timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        fractionalSecondDigits: 3,
      });

      const eventType = event.type;

      let row = `"${timestamp}",${eventType},${event.x},${event.y},${event.duration},"","","","","",""`;

      if (event.type === 'motion') {
        row = `"${timestamp}",${eventType},${event.x},${event.y},${event.duration},${event.acceleration.x},${event.acceleration.y},${event.acceleration.z},${event.rotationRate.alpha},${event.rotationRate.beta},${event.rotationRate.gamma}`;
      }

      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'transparent',
        }}
        onTouchStart={handleTouchStart}
      ></div>
      <button
        className="export-button"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
        }}
        onClick={exportToCSV}
      >
        Export to CSV
      </button>
      <h1>Accelerometer and Gyroscope Demo</h1>
      <button
        id="start_demo"
        className={`btn ${isLogging ? 'btn-danger' : 'btn-success'}`}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '300px',
        }}
        onClick={logSensorData}
      >
        {isLogging ? 'Stop logging' : 'Start logging'}
      </button>
      {permissionStatus === 'granted' ? (
        <p>Permission status: Granted</p>
      ) : permissionStatus === 'pending' ? (
        <button style={{
          position: 'absolute',
          bottom: '10px',
          left: '100px',
        }} onClick={requestDeviceMotionAccess}>Request Device Motion Access</button>
      ) : (
        <p>
          Permission status: Denied. Enable motion and orientation access in your browser settings.
        </p>
      )}

      <VideoStream onStream={handleStream} />

      <main>

        {stream && (<>
          <FaceApiLoader videoStream={stream.faceApiStream} />
          <WebGazerLoader videoStream={stream.webGazerStream} />
        </>)}


      </main>

    </div>
  );
};

export default App;
