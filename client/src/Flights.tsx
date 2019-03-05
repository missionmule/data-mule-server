import React, { Component } from 'react';
import {Badge, Button, notification, Popconfirm, Progress, Table } from 'antd';
import axios from 'axios';

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
  successful_downloads: number;
  total_files: number;
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
    this.fetchFlights();

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

  onClickDownload = async (record: Flight) => {
    const index = this.findFlightStateIndex(record);

    // tl;dr: Ugly, it gets the job done and I'd like to go home at some point :)
    // Also, this only affects behavior if we use the shouldComponentUpdate()
    // lifecycle method, which we aren't
    this.state.data[index].downloadInProgress = true;
    this.forceUpdate()

    await axios({
      url: 'http:192.168.4.1:5000/api/flights/download',
      method: 'POST',
      data: JSON.stringify({
        flight_id: record.flight_id,
      }),
      headers: {
            'Content-Type': 'application/json',
      },
      responseType: 'blob',
    }).then((response) => {
      if (response.status  === 204) { // Standard code: HTTP/1.1 10.2.5 204 No Content
        notification.info({
          message: 'Nothing to Download',
          description: 'There is no data to be downloaded from this flight. This is likely due to a no data station visits during this flight or a failed download.',
        });
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${record.timestamp}.zip`);
        document.body.appendChild(link);
        link.click();
      }
    }).catch((err) => {
      console.log(err)
    });

    this.state.data[index].downloadInProgress = false;
    this.forceUpdate()

  }

  onClickDelete = async (record: Flight) => {
    const index = this.findFlightStateIndex(record);

    // tl;dr: Ugly, but it gets the job done and I'd like to go home at some point :)
    // Also, this only affects behavior if we use the shouldComponentUpdate()
    // lifecycle method, which we aren't
    this.state.data[index].deleteInProgress = true;
    this.forceUpdate()

    // Perform delete
    await fetch('http://192.168.4.1:5000/api/flights/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        flight_id: record.flight_id,
      }),
    })

    // This is a little redundant, but it makes things a little more intelligible
    this.state.data[index].deleteInProgress = false;
    this.forceUpdate();

    this.setState({data: this.state.data.filter(function(flight) {
        return flight.flight_id !== record.flight_id;
    })});
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
          <Popconfirm title="Are you sure you want to delete this flight record including all data downloaded?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickDelete(record);}} okText="Yes" cancelText="No">
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

  fetchFlights = async () => {
    this.setState({ loading: true });

    const response = await fetch('http://192.168.4.1:5000/api/flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const body = JSON.parse(await response.text());

    this.setState({
      loading: false,
      data: body,
    });
  }

  statusBadge = (station: Station) => {
    const percent = station.successful_downloads/station.total_files*100;
    if (percent <= 0) {
      return <span><Badge status="error" />Failure</span>
    } else if (percent < 100) {
      return <span><Badge status="warning" />Incomplete</span>
    } else {
      return <span><Badge status="success" />Complete</span>
    }
  }

  expandedRowRender = (record: Flight) => {
    const columns = [
      { title: 'Data Station ID', width: '20%', dataIndex: 'station_id', key: 'station_id' },
      { title: 'Percent Downloaded', dataIndex: 'percent', key: 'percent', render: (text: string, record: Station) => (
        <span><Progress percent={record.total_files == 0 ? 100 : record.successful_downloads/record.total_files*100} /></span>
      )},
      { title: 'Downloaded Files', width: '15%', dataIndex: 'successful_downloads', key: 'successful_downloads'},
      { title: 'Total Files', width: '15%',dataIndex: 'total_files', key: 'total_files'},
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
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flexStart', width: '100%'}}>
          <h1 style={{ fontWeight: 600, fontSize: '20px'}}>Flights</h1>
        </div>
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
