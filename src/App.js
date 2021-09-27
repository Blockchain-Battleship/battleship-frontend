import Game from './Game';
import React, { Component } from 'react';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
        initiated : false
    }

}
render() {
  return (
    <div>
      <Game app={this.props.app}/>
    </div>
  )
  }
}

