import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as PIXI from 'pixi.js'
import reportWebVitals from './reportWebVitals';
import pageScroll from './config/pageScroll';
import Web3 from 'web3';

pageScroll();


//VARIABLES
let web3Accounts;
let ticker;
let titleScreen;
let redRect;
let mainScreen;
let greenRect;
let titleText;
let connnectWalletButton;
let startButton;

//FUNCTIONS
let createButton = (texture) =>
{
  let textureButton = PIXI.Texture.from(texture);
  let button = new PIXI.Sprite(textureButton);
  button.anchor.set(0.5);
  button.interactive = true;
  button.buttonMode = true;
  return button;
}


//FUNCTIONS
let switchContainer = (view = "main") =>
{
  titleScreen.visible = false;
  mainScreen.visible = false;
  console.log("view is ", view);
  switch(view)
  {
    case "title":
      titleScreen.visible = true;
      break;
    case "main":
      mainScreen.visible = true;
      break;
  }
}


let connectWallet = async() => {
  if(window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('non Ethereum browser detected. Download Metamask')
  }
  const web3 = window.web3;
  let accounts = await window.web3.eth.getAccounts(); // or requestAccounts()
  console.log(accounts);
  web3Accounts = accounts;
}


let checkWalletConntection = () =>
{
  if(!web3Accounts || web3Accounts.length == 0){
    console.log("not connected");
    startButton.visible = false;
    connnectWalletButton.visible = true;
  }else{
    console.log("connected")
    startButton.visible = true;
    connnectWalletButton.visible = false;
  }
}












//Initialize Pixi
const app = new PIXI.Application({autoResize:true });
document.body.appendChild(app.view);

//Set to full screen
app.renderer.resize(window.innerWidth, window.innerHeight);


//Add the Screens
titleScreen = new PIXI.Container();
mainScreen = new PIXI.Container();
mainScreen.visible = false;
app.stage.addChild(titleScreen);
app.stage.addChild(mainScreen);

//Setup the Title Screeen
redRect = new PIXI.Graphics();
redRect.beginFill(0xFF0000); 
redRect.drawRect(0,0, app.view.width, app.view.height);
titleScreen.addChild(redRect);

//Setup the Menu Screen 
greenRect = new PIXI.Graphics();
greenRect.beginFill(0x00FF00);
greenRect.drawRect(0,0,app.view.width, app.view.height);
mainScreen.addChild(greenRect);

//Setup the text
titleText = new PIXI.Text("Blockchain Battleship");
titleText.anchor.set(0.5);
titleText.x = app.view.width/2;
titleText.y = app.view.height/2;
titleText.style = new PIXI.TextStyle({ fill: 0xFFFFF, fontSize:40, fontFamily: 'Arial', fontStyle: 'bold', stroke: '0xFFFFF', strokeThickness: 3});
titleScreen.addChild(titleText);

//Setup Connect Wallet Button
connnectWalletButton = createButton("/images/button_connect-wallet.png");
connnectWalletButton.x = app.view.width / 2;
connnectWalletButton.y = (app.view.height / 2) + 100 ;
connnectWalletButton.on("pointerup", ()=>connectWallet());
titleScreen.addChild(connnectWalletButton);


//Setup Start Button
startButton = createButton("/images/button_start.png");
startButton.x = app.view.width / 2;
startButton.y = (app.view.height / 2) + 100 ;
startButton.on("pointerup", ()=>switchContainer("main"));
titleScreen.addChild(startButton);





































ticker = PIXI.Ticker.shared;
ticker.autoStart = false;
ticker.stop();
ticker.speed = 0.0000004;
ticker.start();

ticker.add(checkWalletConntection);

ReactDOM.render(
<React.StrictMode>

</React.StrictMode>,
document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
