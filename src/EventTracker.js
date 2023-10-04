import React, { useState, useRef } from 'react';

const EventTracker = ({ handleEvent, handleExport }) => {
  const [events, setEvents] = useState([]);
  const containerRef = useRef(null);

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

      setEvents([...events, newEvent]);

      setTimeout(() => {
        handleEvent(newEvent);
      }, 100); // Delay the click event handling by 100 milliseconds
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('touchend', handleTouchEnd, { once: true });
    }
  };

  const handleRegularClick = (event) => {
    if (event.target.tagName.toLowerCase() !== 'button') {
      // Handle click events for elements other than buttons
      const newEvent = {
        timestamp: new Date(),
        type: 'click',
        x: event.clientX,
        y: event.clientY,
        duration: 0,
      };

      setEvents([...events, newEvent]);

      handleEvent(newEvent);
    }
  };

  const exportToCSV = () => {
    const csvData = 'Timestamp,Event Type,X,Y,Duration\n' + events.map((event) => {
      return `${event.timestamp},${event.type},${event.x},${event.y},${event.duration}`;
    }).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleExport();
  };

  return (
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
      onClick={handleRegularClick}
      onTouchStart={handleTouchStart}
    >
      {events.map((event, index) => (
        <div
          key={index}
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: event.type === 'click' ? 'green' : 'blue',
            borderRadius: '50%',
            position: 'absolute',
            left: event.x - 10,
            top: event.y - 10,
          }}
        />
      ))}
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
        Export to CSV touches
      </button>
    </div>
  );
};

export default EventTracker;
