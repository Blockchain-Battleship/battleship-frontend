import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as PIXI from 'pixi.js'
import reportWebVitals from './reportWebVitals';

const pixiApp = new PIXI.Application({autoResize:true, resolution: devicePixelRatio });
document.body.appendChild(pixiApp.view);


ReactDOM.render(
  <React.StrictMode>
    <App app={pixiApp} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
