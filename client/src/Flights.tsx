import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import {Icon, Switch, Table } from 'antd';

import './Flights.css';

interface Match {
  url: string;
}

interface Props {
  match: Match;
}

interface State {}

interface Station {
  station_id: string;
  percent: number;
}
interface Flight {
  flight_id: string;
  timestamp: number;
  stations: {
    [key: string]: Station
  };
}


class Flights extends Component<Props, State> {

  state = {
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

  render() {

    return (
      <div>
        <Table
          columns={this.columns}
          rowKey={(flight: Flight) => flight.flight_id}
          dataSource={this.state.data }
          loading={this.state.loading}
          bordered
        />
      </div>
    );
  }

}

export default Flights;
