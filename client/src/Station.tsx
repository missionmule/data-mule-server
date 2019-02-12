import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';

import './Station.css';

// interface IProps {
//   match: string;
// }
//
// interface IState {}

class Station extends Component<any, any> {
  render() {
    return (
      <div>
        <h3>{this.props.match.params.stationId}</h3>
      </div>
    );
  }

}

export default Station;
