import React from 'react';

const ConsoleOutput = ({ loggedData }) => {
  return (
    <div className="console-output">
      <h2>Logged Events</h2>
      <ul>
        {loggedData.map((event, index) => (
          <li key={index}>
            Timestamp: {event.timestamp.toLocaleString()}, Event type: {event.type}, X: {event.x}, Y: {event.y}, Duration: {event.duration}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsoleOutput;
