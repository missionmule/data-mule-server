import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';

import Station from './Station';

import './Stations.css';

// interface IProps {
//   match: string;
// }
//
// interface IState {}

class Stations extends Component<any, any> {
  render() {
    return (
      <div>
        <h2>Stations</h2>
        <ul>
          <li>
            <Link to={`${this.props.match.url}/123`}>Rendering with React</Link>
          </li>
          <li>
            <Link to={`${this.props.match.url}/124`}>Components</Link>
          </li>
          <li>
            <Link to={`${this.props.match.url}/125`}>Props v. State</Link>
          </li>
        </ul>
        <Route path={`${this.props.match.url}/:stationId`} component={Station} />
        <Route
          exact
          path={this.props.match.url}
          render={() => <h3>Please select a topic.</h3>}
        />
      </div>
    );
  }

}

export default Stations;
