import React from 'react';
import Script from 'react-load-script';
import { WebGazeContext } from './WebGazeContext';
class WebGazeLoader extends React.Component {
  constructor() {
    super();
    this.state = {
      context: { x: -1, y: -1 },
      calibrationNeeded: true, // Set this to true to start calibration
    };
  }

  handleScriptLoad = () => {
    // Check if 'webgazer' is available in the window object
    if (typeof window.webgazer !== 'undefined') {
      window.webgazer
        .setGazeListener((data, elapsedTime) => {
          if (data == null) {
            return;
          }
          this.setState({ context: window.webgazer.util.bound(data) });
        })
        .begin();
    } else {
      console.error('Webgazer is not defined. The script may not have loaded correctly.');
    }
  };

  handleScriptError = () => {
    console.log('error');
  }

  render() {
    return (
      <div>
        <WebGazeContext.Provider value={this.state.context}>
          <Script
            url="https://webgazer.cs.brown.edu/webgazer.js"
            onLoad={this.handleScriptLoad}
            onError={this.handleScriptError}
          />
          {/* <MainApp /> */}
        </WebGazeContext.Provider>
      </div>
    );
  }
}

export default WebGazeLoader;
