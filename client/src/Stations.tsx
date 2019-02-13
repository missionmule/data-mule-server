import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Table } from 'antd';

import './Stations.css';

interface IMatch {
  url: string;
}

interface IProps {
  match: IMatch;
}

interface IState {}

interface Station {
  id: string;
  lastVisited: number;
  redownload: boolean;
}

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Last Visted', dataIndex: 'lastVisited', key: 'lastVisited' },
  { title: 'Redownload', dataIndex: 'redownload', key: 'redownload'},
  { title: 'Delete', key: 'operation', render: () => <a href="javascript:;">Delete</a> },
];

class Stations extends Component<IProps, IState> {

  state = {
    data: [],
    pagination: {},
    loading: false,
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = async () => {
    this.setState({ loading: true });

    const response = await fetch('/api/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results: 500 }),
    })

    const body = JSON.parse(await response.text());

    console.log(body);

    this.setState({
      loading: false,
      data: body,
    });

  }

  render() {

    return (
      <div>
        <Table
          columns={columns}
          rowKey={(station: Station) => station.id}
          dataSource={this.state.data }
          loading={this.state.loading}
          bordered
        />
      </div>
    );
  }

}
//
// <Route path={`${this.props.match.url}/:stationId`} component={Station} />
// <Route
//   exact
//   path={this.props.match.url}
//   render={() => <h3>Please select a topic.</h3>}
// />

export default Stations;
