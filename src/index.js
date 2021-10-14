import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as PIXI from 'pixi.js'
import reportWebVitals from './reportWebVitals';
import noScroll from './config/noScroll';
import Web3 from 'web3';

//Prevent the Page from Scrolling
noScroll();



//CONSTANTS
const SHIP_TYPE = {
	CARRIER: "carrier",
	BATTLESHIP: "battleship",
	CRUISER: "cruiser",
	SUBMARINE: "submarine",
  DESTROYER: "destroyer"
}

const AXIS = {
	X: "x",
	Y: "y",
	Z: "z",
}


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
const shipSpaces = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
let animateShipCounter = 0;
let playerTileMap = {};
let opponentTileMap = {};
let playerActiveTiles = [];
let playerOccupiedTiles = {};
let canDropShip = false;

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
    window.alert('non Ethereum browser detected. Download Metamask');
    return;
  }
  const web3 = window.web3;
  let accounts = await window.web3.eth.getAccounts(); // or requestAccounts()
  web3Accounts = accounts;
}

let tileClicked = (tileNumber) => {
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
    startButton.visible = true;
    connnectWalletButton.visible = false;
  } else {
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
  ship.attrs["occupiedTiles"] = [];
  ship.attrs["newCenterTile"] = 0;


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

  let battleship = createShip(SHIP_TYPE.BATTLESHIP);
  let carrier = createShip(SHIP_TYPE.CARRIER);
  let cruiser = createShip(SHIP_TYPE.CRUISER);
  let destroyer = createShip(SHIP_TYPE.DESTROYER);
  let submarine = createShip(SHIP_TYPE.SUBMARINE);



  //Set position
  battleship.x -= tileUnit * .5;
  carrier.x -= tileUnit * 1.5;
  cruiser.x -= tileUnit * 2.5;
  destroyer.x -= tileUnit * 3.5;
  submarine.x -= tileUnit * 4.5;

  //Fill in the player occupied tiles
  playerOccupiedTiles[SHIP_TYPE.BATTLESHIP] = getOccupiedTilesOnDrag(SHIP_TYPE.BATTLESHIP, AXIS.Y, 65);
  playerOccupiedTiles[SHIP_TYPE.CARRIER] = getOccupiedTilesOnDrag(SHIP_TYPE.CARRIER, AXIS.Y, 64);
  playerOccupiedTiles[SHIP_TYPE.CRUISER] = getOccupiedTilesOnDrag(SHIP_TYPE.CRUISER, AXIS.Y, 63);
  playerOccupiedTiles[SHIP_TYPE.DESTROYER] = getOccupiedTilesOnDrag(SHIP_TYPE.DESTROYER, AXIS.Y, 62);
  playerOccupiedTiles[SHIP_TYPE.SUBMARINE] = getOccupiedTilesOnDrag(SHIP_TYPE.SUBMARINE, AXIS.Y, 61);


  battleship.attrs["centerTile"] = 55;
  carrier.attrs["centerTile"] = 54;
  cruiser.attrs["centerTile"] = 53;
  destroyer.attrs["centerTile"] = 52;
  submarine.attrs["centerTile"] = 51;


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

let clearActiveTiles = (forPlayer) =>
{
 //disable the previously highlighted tiles
 for(var i = 0; i < playerActiveTiles.length; i++)
 {
   playerActiveTiles[i].alpha = 0;
 }
}

let freeUpPreviousShipLocationOnDrag = (shipType) =>
{
  //Make the previous location of the ship available for dropping
  playerOccupiedTiles[shipType] = [];
}

let changeShipAxis = (shipType, tilePosition) => 
{

}

let clampShipPosition = (tilePosition, shipType, axis, worldPosition) =>
{
  let tiles = getOccupiedTilesOnDrag(shipType, axis, tilePosition);
  if(worldPosition.x >520 || worldPosition.y >520 || worldPosition.x<-520 || worldPosition.y<-520) return false;

  for(var i = 0; i < tiles.length; i++)
  {
    if(tiles[i] < 1 || tiles[i] > 100) return false;
  }
  return true;
}

let moveShipToTilePosition = (ship, tilePosition, axis) => 
{
  let yOffset = ship.attrs.spaces % 2 == 0 ? tileUnit : tileUnit / 2;
  ship.position.x = playerTileMap[tilePosition].x + (tileUnit / 2);
  ship.position.y = playerTileMap[tilePosition].y + yOffset;
 
}

let onDragMove = (e, obj) => {
  if (obj.dragging) {
    freeUpPreviousShipLocationOnDrag(obj.attrs.name);
    var newPosition = obj.data.getLocalPosition(obj.parent);
    let tilePosition = getTileFromPosition(newPosition, 10, 10);


    if(!clampShipPosition(tilePosition, obj.attrs.name, AXIS.Y, newPosition)) return;
    


    moveShipToTilePosition(obj, tilePosition, AXIS.Y)
 


    let occupiedTiles = getOccupiedTilesOnDrag(obj.attrs.name, AXIS.Y, tilePosition);
    obj.attrs.occupiedTiles = occupiedTiles;
    obj.attrs.newCenterTile = tilePosition;
    displayActiveTiiles(occupiedTiles);
    console.log("Drag move")
  }
}


let displayActiveTiiles = (tiles) => 
{
  clearActiveTiles();
  let allOccupiedTiles = playerOccupiedTiles[SHIP_TYPE.BATTLESHIP]
  .concat(playerOccupiedTiles[SHIP_TYPE.CARRIER])
  .concat(playerOccupiedTiles[SHIP_TYPE.CRUISER])
  .concat(playerOccupiedTiles[SHIP_TYPE.DESTROYER])
  .concat(playerOccupiedTiles[SHIP_TYPE.SUBMARINE])
  canDropShip = true;

  for(var i = 0; i<tiles.length; i++)
  {
    if(tiles[i] > 100 || tiles[i] < 0) {
      canDropShip = false;
      continue;
    }
    if(allOccupiedTiles.includes(tiles[i])){
      canDropShip = false;
    }
  }
  let color = canDropShip ? 0xFF0000 : 0x00FF00;
  for(var i = 0; i<tiles.length; i++)
  {
    if(tiles[i] > 100 || tiles[i] < 0){
      continue;
    } 
    const color = new PIXI.filters.ColorMatrixFilter();
    if(canDropShip){
      color.saturate();
    }else{
      color.desaturate();
    }
    playerTileMap[tiles[i]].alpha = 0.5;
    playerTileMap[tiles[i]].filters = [color];
    playerActiveTiles.push(playerTileMap[tiles[i]]);
  }
}


let onDragEnd = (e, obj) => {
  obj.alpha = 0.5;
  obj.dragging = false;
  obj.data = null;
  clearActiveTiles();
  if(!canDropShip)
  {
    moveShipToTilePosition(obj, obj.attrs.centerTile, AXIS.Y);
    playerOccupiedTiles[obj.attrs.name] = getOccupiedTilesOnDrag(obj.attrs.name,AXIS.Y,obj.attrs.centerTile);
    return
  }
  obj.attrs.centerTile = obj.attrs.newCenterTile;
  console.log(obj.attrs.centerTile)
  playerOccupiedTiles[obj.attrs.name] = obj.attrs.occupiedTiles;
  console.log("Drag end!");
  console.log(playerOccupiedTiles[obj.attrs.name])
}

let getTileFromPosition = ({ x, y }, tX, tY) => {
  x = Math.round(x / 102)
  y = Math.round(y / 102)


  x = x >= 0 ? x + (tX / 2) : x + (tX / 2) + 1
  y = y >= 0 ? y + (tY / 2) : y + (tY / 2) + 1

  return ((x * y) + (tX - x) * (y - 1))
}


let getOccupiedTilesOnDrag = (shipType, axis, activeTile) =>
{
  let firstTilePosition;
  let incrementor;
  let numberOfTiles;
  let occupiedTiles = [];

  switch(axis)
  {
    case AXIS.X:
      incrementor = 1;
      break;
    case AXIS.Y:
      incrementor = 10;
      break;
  }
  switch(shipType){
    case SHIP_TYPE.BATTLESHIP:
      firstTilePosition = axis == AXIS.X ? activeTile - 1 : activeTile - 10;
      break;
    case SHIP_TYPE.CRUISER:
      firstTilePosition = axis == AXIS.X ? activeTile - 1 : activeTile - 10;
      break;
    case SHIP_TYPE.CARRIER:
      firstTilePosition = axis == AXIS.X ? activeTile - 2 : activeTile - 20;
      break;
    case SHIP_TYPE.SUBMARINE:
      firstTilePosition = axis == AXIS.X ? activeTile - 1 : activeTile - 10;
      break;
    case SHIP_TYPE.DESTROYER:
      firstTilePosition = axis == AXIS.X ? activeTile  : activeTile;
      break;
  }

  for(var i = 0; i < shipSpaces[shipType]; i++)
  {
    occupiedTiles.push(firstTilePosition + (incrementor * i));
  }
  return occupiedTiles;
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
