import React, { useState, useRef, useEffect } from 'react';
import ConsoleOutput from './ConsoleOutput';
import './App.css';

const App = () => {
  const [loggedData, setLogData] = useState([]);
  const containerRef = useRef(null);
  const [isLogging, setIsLogging] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('');

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

  const logSensorData = () => {
    if (isLogging) {
      setIsLogging(false);
      return;
    }

    setIsLogging(true);

    const logData = (event) => {
      const accelerometerData = event.accelerationIncludingGravity;
      const gyroscopeData = event.rotationRate;
      const motionEvent = {
        timestamp: new Date(),
        type: 'motion',
        acceleration: accelerometerData,
        rotationRate: gyroscopeData,
      };

      handleEvent(motionEvent);

      if (isLogging) {
        // Request the next animation frame to continue logging
        window.requestAnimationFrame(logData);
      }
    };

    if (permissionStatus === 'granted') {
      // Start logging when permission is granted
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

    const columnNames = 'Timestamp,Event Type,X,Y,Duration,Acceleration_X,Acceleration_Y,Acceleration_Z,Gyroscope_Alpha,Gyroscope_Beta,Gyroscope_Gamma';
    const csvContent = `${columnNames}\n${loggedData.map((event) => {
      if (event.type === 'touch') {
        return `${event.timestamp},touch,${event.x},${event.y},${event.duration},,,,,,`;
      } else if (event.type === 'motion') {
        return `${event.timestamp},motion,,,,${event.acceleration.x},${event.acceleration.y},${event.acceleration.z},${event.rotationRate.alpha},${event.rotationRate.beta},${event.rotationRate.gamma}`;
      }
      return '';
    }).join('\n')}`;

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
      {/* Button integrated into the touch area */}
      <button
        className="export-button"
        style={{
          position: 'absolute',
          bottom: '10px', // Adjust the position as needed
          left: '10px',
        }}
        onClick={exportToCSV}
      >
        Export to CSV
      </button>
      <ConsoleOutput loggedData={loggedData} />
      <h1>Accelerometer and Gyroscope Demo</h1>
      <button
        id="start_demo"
        className={`btn ${isLogging ? 'btn-danger' : 'btn-success'}`}
        style={{
          position: 'absolute',
          bottom: '10px', // Adjust the position as needed
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
          bottom: '10px', // Adjust the position as needed
          left: '100px',
        }} onClick={requestDeviceMotionAccess}>Request Device Motion Access</button>
      ) : (
        <p>
          Permission status: Denied. Enable motion and orientation access in your browser settings.
        </p>
      )}
    </div>
  );
};

export default App;
