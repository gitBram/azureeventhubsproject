import './App.css';
import React, { useState } from 'react';
import Device from './components/Device';
import Button from 'react-bootstrap/Button';
import { AppContextProvider } from './hooks/AppContext'
import { BackendClient } from './clients/BackendClient';


function App() {
  const backendClient = new BackendClient(`http://localhost:${process.env.REACT_APP_EXPRESS_PORT || 5000}`);

  const [numDevices, setNumDevices] = useState(1);

  const addDevice = () => { 
    setNumDevices(numDevices + 1);
  }
  const removeDevice = () => {
    if (numDevices > 1) {
      setNumDevices(numDevices - 1);
    }
  }
  return (
    <AppContextProvider backendClient={backendClient}>
      <div className="App vw-100 vh-100">
        <div className="mw-100 d-flex flex-column justify-content-center align-items-center">
          <h1>
            Publisher App
          </h1>
          <div className='d-flex flex-wrap justify-content-center'>
            {
              [...Array(numDevices)].map((_, index) => (
                <Device key={index + 1} id={index + 1}/>
              ))
            }
          </div>
          <div>
            <Button className='m-2' onClick={() => addDevice()}>+</Button>
            <Button variant='danger' className='m-2' onClick={() => removeDevice()}>-</Button>
          </div>
        </div>
      </div>
    </AppContextProvider>
  );
}

export default App;
