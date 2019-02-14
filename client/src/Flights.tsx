import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import {Badge, Button, Popconfirm, Progress, Table } from 'antd';

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
  loadingDeleteAll: boolean;
}

interface Station {
  station_id: string;
  percent: number;
}

interface Flight {
  flight_id: number;
  timestamp: number;
  stations: Station[];
  downloadInProgress: boolean;
  deleteInProgress: boolean;
}

const ButtonGroup = Button.Group;

class Flights extends Component<Props, State> {

  public state: State = {
    data: [],
    loading: false,
    loadingDeleteAll: false,
  };

  componentDidMount() {
    this.fetch();

    // Give each flight its own delete and download progress state
    const data = this.state.data;
    data.forEach((flight: Flight) => {
      flight.deleteInProgress = false;
      flight.downloadInProgress = false;
    });
    this.forceUpdate;
  }

  findFlightStateIndex= (record: Flight) => {
    return this.state.data.findIndex((el: Flight) =>
      el.flight_id === record.flight_id);
  }

  onClickDownload = (record: Flight) => {
    const index = this.findFlightStateIndex(record);

    // tl;dr: Ugly, it gets the job done and I'd like to go home at some point :)
    // Also, this only affects behavior if we use the shouldComponentUpdate()
    // lifecycle method, which we aren't
    this.state.data[index].downloadInProgress = true;
    this.forceUpdate()

    // Perform download

    this.state.data[index].downloadInProgress = false;
    this.forceUpdate()

  }

  onClickDelete = (record: Flight) => {
    const index = this.findFlightStateIndex(record);

    // tl;dr: Ugly, it gets the job done and I'd like to go home at some point :)
    // Also, this only affects behavior if we use the shouldComponentUpdate()
    // lifecycle method, which we aren't
    this.state.data[index].deleteInProgress = true;
    this.forceUpdate()

    // Perform download
    //
    this.state.data[index].deleteInProgress = false;
    this.forceUpdate()

}

  columns = [
    { title: 'Date', dataIndex: 'timestamp', key: 'timestamp' },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Flight) => (
       <span>
        <ButtonGroup>
         <Button
          type="primary"
          shape="round"
          icon="download"
          size="small"
          onClick={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickDownload(record);}}
          loading={this.state.data[this.findFlightStateIndex(record)].downloadInProgress}>
            Download
          </Button>
          <Popconfirm title="Are you sure you want to delete all flight data?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickDelete(record);}} okText="Yes" cancelText="No">
            <Button
             type="danger"
             shape="round"
             icon="delete"
             size="small"
             loading={this.state.data[this.findFlightStateIndex(record)].deleteInProgress}/>
          </Popconfirm>
        </ButtonGroup>
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
      { title: 'Data Station ID', width: '20%', dataIndex: 'station_id', key: 'station_id' },
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

  deleteAll = () => {
    console.log("Delete all flights");
    this.setState({loadingDeleteAll: true});

    this.setState({loadingDeleteAll: false});
  }

  render() {

    return (
      <div>
        <Table
          columns={this.columns}
          rowKey={(flight: Flight) => flight.flight_id.toString()}
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
