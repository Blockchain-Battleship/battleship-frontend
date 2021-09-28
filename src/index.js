import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as PIXI from 'pixi.js'
import reportWebVitals from './reportWebVitals';
import noScroll from './config/noScroll';
import Web3 from 'web3';

//Prevent the Page from Scrolling
noScroll();



//VARIABLES
let web3Accounts;
let ticker;
let titleScreen;
let titleBackground;
let mainScreen;
let mainScreenBackground;
let titleText;
let connnectWalletButton;
let startButton;
let logoImage;
let playerGrid;
let opponentGrid;

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

let setupGrid = (position) => {
  let grid = new PIXI.Sprite.from("/images/grid.png");
  grid.width = 500;
  grid.height = 500;
  grid.x = position.x;
  grid.y = position.y;
  grid.anchor.set(0.5);

  // let frame = new PIXI.Graphics();
  // //frame.beginFill(0x666666);
  // frame.lineStyle({ color: 0xffffff, width: 1, alignment: 0 });
  // frame.drawRect(0, 0, grid.width / 5, 208);
  //frame.position.set(320 - 100, 180 - 100);
  //grid.addChild(frame);
  // let frame = new PIXI.Graphics();
  // frame.beginFill(0x666666);
  // frame.lineStyle({ color: 0xffffff, width: 10, alignment: 0 });
  // frame.drawRect(0, 0, 100, 100);
  // frame.position.set((frame.width / 5)  * 1, (frame.width / 5) * 1);
  // grid.addChild(frame);
  //Add grids to the box.
  let texture;
  for(var i = 0; i < 10; i++)
  {
    
    for(var j = 0; j < 10; j++)
    {
      let frame = new PIXI.Graphics();
      let tileUnit = 108;
      //frame.beginFill(0x666666);
      frame.lineStyle({ color: 0xffffff, width: 2, alignment: 0 });
      frame.drawRect(0, 0, tileUnit, tileUnit);
      frame.position.set((tileUnit * j) - (tileUnit * 5), tileUnit * i - (tileUnit * 5));
      grid.addChild(frame);
    }
  }
  return grid;
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

//setup Logo Image
let logoTexture = PIXI.Texture.from("/images/logo.png");
logoImage = new PIXI.Sprite(logoTexture);
logoImage.x = (app.view.width / 2);
logoImage.y = (app.view.height / 2) - 100;
logoImage.anchor.set(0.5)

//Setup the Title Screeen
titleBackground = new PIXI.Graphics();
titleBackground.beginFill(0x000000); 
titleBackground.drawRect(0,0, app.view.width, app.view.height);
titleScreen.addChild(titleBackground);
titleScreen.addChild(logoImage);

//Setup the Menu Screen 
mainScreenBackground = new PIXI.Graphics();
mainScreenBackground.beginFill(0x00000);
mainScreenBackground.drawRect(0,0,app.view.width, app.view.height);
mainScreen.addChild(mainScreenBackground);

//setup Grids
playerGrid = setupGrid({x: (app.view.width / 2) - 300, y: 400});
opponentGrid = setupGrid({x: (app.view.width / 2) + 300, y: 400});


mainScreen.addChild(playerGrid);
mainScreen.addChild(opponentGrid);

//Setup the text
titleText = new PIXI.Text("Blockchain Battleship");
titleText.anchor.set(0.5);
titleText.x = app.view.width/2;
titleText.y = app.view.height/2;
titleText.visible = false;
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
