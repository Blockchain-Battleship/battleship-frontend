import React, { Component } from 'react';
import * as PIXI from 'pixi.js'



export default class Game extends Component {
    constructor(props){
        super(props);
        this.state = {
            initiated : false
        }
        console.log("Hello");

    }

    resize = ()=>{

        // to the bottom-right corner
        const rect = new PIXI.Graphics().beginFill(0xff0000).drawRect(-100, -100, 100, 100);
        
        // Add it to the stage
        this.props.app.stage.addChild(rect);
        
    
        // Resize the renderer
	    this.props.app.renderer.resize(window.innerWidth, window.innerHeight);
  
        // You can use the 'screen' property as the renderer visible
        // area, this is more useful than view.width/height because
        // it handles resolution
        rect.position.set(this.props.app.screen.width, this.props.app.screen.height);

    }

    async componentDidMount(){
        console.log("Game", this.props);
        this.resize();
    }

 

    render() {
        return (
            <div className="Game">
                
        </div>)
        }
}


