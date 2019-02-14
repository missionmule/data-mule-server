import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import {Badge, Dropdown, Icon, Progress, Switch, Table } from 'antd';

import './Flights.css';

interface Match {
  url: string;
}

interface Props {
  match: Match;
}

interface State {
  data: any[];
  loading: boolean;
}

interface Station {
  station_id: string;
  percent: number;
}

interface Flight {
  flight_id: string;
  timestamp: number;
  stations: Station[];
}


class Flights extends Component<Props, State> {

  public state: State = {
    data: [],
    loading: false,
  };

  componentDidMount() {
    this.fetch();
  }

  onChange = async (checked: boolean) => {
    console.log("here")
  }

  // flightStatus = (text: any, record: Flight, index: Number) => {
  //   for (let i = 0; i < 15; i++) {
  //     if (record.stations[i].percent !== 100) {
  //       return <Icon type="star" theme="filled" />
  //     }
  //   }
  //   return <Icon type="check-circle" theme="filled" />
  // }

  columns = [
    { title: 'Date', dataIndex: 'timestamp', key: 'timestamp' },
    {
      title: 'Action',
      key: 'action',
      render: () => (
       <span>
         <a href="javascript:;">Delete</a>
       </span>
      ),
    },
  ];

  fetch = async () => {
    this.setState({ loading: true });

    const response = await fetch('/api/flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const body = JSON.parse(await response.text());

    this.setState({
      loading: false,
      data: body,
    });
  }

  statusBadge = (station: Station) => {
    if (station.percent <= 0) {
      return <span><Badge status="error" />Failure</span>
    } else if (station.percent < 100) {
      return <span><Badge status="warning" />Incomplete</span>
    } else {
      return <span><Badge status="success" />Complete</span>
    }
  }

  expandedRowRender = (record: Flight) => {
    const columns = [
      { title: 'Station ID', dataIndex: 'station_id', key: 'station_id' },
      { title: 'Percent Downloaded', dataIndex: 'percent', key: 'percent', render: (text: string, record: Station) => (
        <span><Progress percent={record.percent} /></span>
      )},
      { title: 'Status', rowKey: 'status', render: (text: string, record: Station) => (this.statusBadge(record)) },
    ];

    const data: Station[] = record.stations;

    return (
      <Table
        rowKey={(record) => record.station_id}
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    );
  };

  render() {

    return (
      <div>
        <Table
          columns={this.columns}
          rowKey={(flight: Flight) => flight.flight_id}
          dataSource={this.state.data }
          loading={this.state.loading}
          expandedRowRender={(record: Flight) => (this.expandedRowRender(record))}
          bordered
        />
      </div>
    );
  }

}

export default Flights;
