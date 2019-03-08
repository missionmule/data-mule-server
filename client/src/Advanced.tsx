import React, { Component } from 'react';
import { notification, Switch, Table } from 'antd';

import './Advanced.css';

interface Props {
}

interface State {
}

class Advanced extends Component<Props, State> {

  public state: State = {};

  server = process.env.NODE_ENV === 'production' ? 'http://192.168.4.1' : 'http://localhost';

  render() {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flexStart', width: '100%'}}>
          <h1 style={{ fontWeight: 600, fontSize: '20px'}}>Data Stations</h1>
        </div>
      </div>
    );
  }

}

export default Advanced;
