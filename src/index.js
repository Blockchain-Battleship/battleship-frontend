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
let playerShips = {};
let opponentShips = {};
let tileUnit = 108;
let initPlayerShips;
let initOpponentShips;
let shipSpaces = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
let animateShipCounter = 0;
let playerTileMap = {};
let opponentTileMap = {};
let playerActiveTiles = [];

//FUNCTIONS
let createButton = (texture) => {
  let textureButton = PIXI.Texture.from(texture);
  let button = new PIXI.Sprite(textureButton);
  button.anchor.set(0.5);
  button.interactive = true;
  button.buttonMode = true;
  return button;
}


//FUNCTIONS
let switchContainer = (view = "main") => {
  titleScreen.visible = false;
  mainScreen.visible = false;
  console.log("view is ", view);
  switch (view) {
    case "title":
      titleScreen.visible = true;
      break;
    case "main":
      mainScreen.visible = true;
      break;
  }
}


let connectWallet = async () => {
  if (window.ethereum) {
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

let tileClicked = (tileNumber) => {
  alert("clicked on " + tileNumber);
}

let setupGrid = (position, forPlayer) => {
  let grid = new PIXI.Sprite.from("/images/grid.png");
  grid.width = 400;
  grid.height = 400;
  grid.x = position.x;
  grid.y = position.y;
  grid.anchor.set(0.5);

  
  var tileId = 1;
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      (function (tId) {
        let frame = new PIXI.Graphics();
        frame.beginFill(0x00FF00);
        frame.alpha = 0;
        frame.lineStyle({ color: 0xffffff, width: 1.5, alignment: 0, alpha: 0 });
        frame.drawRect(0, 0, tileUnit, tileUnit);
        frame.interactive = true;
        frame.buttonMode = true;
        frame.on("pointerup", () => tileClicked(tId));
        frame.position.set((tileUnit * j) - (tileUnit * 5), tileUnit * i - (tileUnit * 5));
        grid.addChild(frame);
        if(forPlayer){
          playerTileMap[tId] = frame;
        }else{
          opponentTileMap[tId] = frame;
        }
      })(tileId)  
      tileId++;
    }
  }
  return grid;
}

let checkWalletConntection = () => {
  if (!web3Accounts || web3Accounts.length == 0) {
    console.log("not connected");
    startButton.visible = false;
    connnectWalletButton.visible = true;
  } else {
    console.log("connected")
    startButton.visible = true;
    connnectWalletButton.visible = false;
  }
}

let createShip = (shipType) => {
  let path = `/images/ships/${shipType}.png`;
  let ship = PIXI.Sprite.from(path);
  ship.alpha = 0.5;
  ship.interactive = true;
  ship.anchor.set(0.5);
  ship.attrs = {};
  ship.attrs["name"] = shipType;
  ship.attrs["spaces"] = shipSpaces[shipType]
  ship.on('mousedown', (e) => onDragStart(e, ship))
    .on('touchstart', (e) => onDragStart(e, ship))
    .on('mouseup', (e) => onDragEnd(e, ship))
    .on('mouseupoutside', (e) => onDragEnd(e, ship))
    .on('touchend', (e) => onDragEnd(e, ship))
    .on('touchendoutside', (e) => onDragEnd(e, ship))
    .on('mousemove', (e) => onDragMove(e, ship))
    .on('touchmove', (e) => onDragMove(e, ship));
  let yOffset = ship.attrs.spaces % 2 == 0 ? tileUnit : tileUnit / 2;
  ship.y += yOffset;
  return ship;
}

let setupShips = (forPlayer) => {

  let grid;
  let ships;

  let battleship = createShip("battleship");
  let carrier = createShip("carrier");
  let cruiser = createShip("cruiser");
  let destroyer = createShip("destroyer");
  let submarine = createShip("submarine");



  //Set position
  battleship.x -= tileUnit * .5;
  carrier.x -= tileUnit * 1.5;
  cruiser.x -= tileUnit * 2.5;
  destroyer.x -= tileUnit * 3.5;
  submarine.x -= tileUnit * 4.5;


  if (forPlayer) {
    initPlayerShips = true;
    grid = playerGrid;
    ships = playerShips;
  } else {
    initOpponentShips = true;
    grid = opponentGrid;
    ships = opponentShips;
  }
  //Assign Ships
  ships.battleship = battleship;
  ships.carrier = carrier;
  ships.cruiser = cruiser;
  ships.destroyer = destroyer;
  ships.submarine = submarine;

  //Attach to grid
  grid.addChild(battleship);
  grid.addChild(carrier);
  grid.addChild(cruiser);
  grid.addChild(destroyer);
  grid.addChild(submarine);

}



let animateShips = (delta) => {
  if (initPlayerShips) {
    animateShipCounter += delta;
    //playerShips.battleship.height = (shipSpaces.battleship * tileUnit) + Math.cos(elapsed * 100000) *5;
    //playerShips.battleship.width = tileUnit + Math.cos(elapsed * 100000) *5;
    playerShips.battleship.y += Math.cos(animateShipCounter * 100000) / 10;
    playerShips.carrier.y += Math.cos(animateShipCounter * 100000) / 10;
    playerShips.cruiser.y += Math.cos(animateShipCounter * 100000) / 10;
    playerShips.destroyer.y += Math.cos(animateShipCounter * 100000) / 10;
    playerShips.submarine.y += Math.cos(animateShipCounter * 100000) / 10;
  }


}

let onDragStart = (e, obj) => {
  //obj.anchor.set(0.5)
  obj.data = e.data;
  obj.alpha = 0.2;
  obj.dragging = true;
}

let onDragMove = (e, obj) => {
  if (obj.dragging) {
    var newPosition = obj.data.getLocalPosition(obj.parent);
    let tilePosition = getTileFromPosition(newPosition, 10, 10);
    if(newPosition.x >520 || newPosition.y >520 || newPosition.x<-520 || newPosition.y<-520) return;
    console.log("Player Tile Map",playerTileMap);
    console.log("Opponent Tile Map",opponentTileMap);
    console.log("Ship Attr", obj.attrs)

    //disable the previously highlighted tiles
    for(var i = 0; i < playerActiveTiles.length; i++)
    {
      playerActiveTiles[i].alpha = 0;
    }
    playerTileMap[tilePosition].alpha = 0.5;
    playerActiveTiles.push(playerTileMap[tilePosition]);
    console.log("New Position", newPosition);
    console.log("tile", tilePosition);

    let yOffset = obj.attrs.spaces % 2 == 0 ? tileUnit : tileUnit / 2;
    obj.position.x = playerTileMap[tilePosition].x + (tileUnit / 2);
    obj.position.y = playerTileMap[tilePosition].y + yOffset;
  
 
  }
}


let onDragEnd = (e, obj) => {
  obj.alpha = 0.5;
  obj.dragging = false;
  obj.data = null;
}

let getTileFromPosition = ({ x, y }, tX, tY) => {
  x = Math.round(x / 102)
  y = Math.round(y / 102)

  console.log("======", { x, y })

  x = x >= 0 ? x + (tX / 2) : x + (tX / 2) + 1
  y = y >= 0 ? y + (tY / 2) : y + (tY / 2) + 1



  return ((x * y) + (tX - x) * (y - 1))
}







//Initialize Pixi
const app = new PIXI.Application({ autoResize: true });
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
titleBackground.drawRect(0, 0, app.view.width, app.view.height);
titleScreen.addChild(titleBackground);
titleScreen.addChild(logoImage);

//Setup the Menu Screen 
mainScreenBackground = new PIXI.Graphics();
mainScreenBackground.beginFill(0x0b1028);
mainScreenBackground.drawRect(0, 0, app.view.width, app.view.height);
mainScreen.addChild(mainScreenBackground);

//setup Grids
playerGrid = setupGrid({ x: (app.view.width / 2) - 220, y: 400 }, true);
opponentGrid = setupGrid({ x: (app.view.width / 2) + 220, y: 400 }, false);
mainScreen.addChild(playerGrid);
mainScreen.addChild(opponentGrid);

//Set up Ships for Player
setupShips(true);


//Setup the text
titleText = new PIXI.Text("Blockchain Battleship");
titleText.anchor.set(0.5);
titleText.x = app.view.width / 2;
titleText.y = app.view.height / 2;
titleText.visible = false;
titleText.style = new PIXI.TextStyle({ fill: 0xFFFFF, fontSize: 40, fontFamily: 'Arial', fontStyle: 'bold', stroke: '0xFFFFF', strokeThickness: 3 });
titleScreen.addChild(titleText);

//Setup Connect Wallet Button
connnectWalletButton = createButton("/images/button_connect-wallet.png");
connnectWalletButton.x = app.view.width / 2;
connnectWalletButton.y = (app.view.height / 2) + 100;
connnectWalletButton.on("pointerup", () => connectWallet());
titleScreen.addChild(connnectWalletButton);


//Setup Start Button
startButton = createButton("/images/button_start.png");
startButton.x = app.view.width / 2;
startButton.y = (app.view.height / 2) + 100;
startButton.on("pointerup", () => switchContainer("main"));
titleScreen.addChild(startButton);







































ticker = PIXI.Ticker.shared;
ticker.autoStart = false;
ticker.stop();
ticker.speed = 0.0000004;
ticker.start();

ticker.add(checkWalletConntection);
ticker.add(animateShips);

ReactDOM.render(
  <React.StrictMode>

  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
