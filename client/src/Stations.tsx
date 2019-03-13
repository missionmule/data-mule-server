import React, { Component } from 'react';
import { Button, Drawer, Form, Col, Row, Input, Select, Icon, notification, Switch, Table } from 'antd';

import './Stations.css';
import NewDataStationForm from './NewDataStationForm';

interface Match {
  url: string;
}

interface Props {
  match: Match;
}

interface State {
  data: any[];
  pagination: object;
  loading: boolean;
  insertStationLoading: boolean;
  drawerVisible: boolean;
}

interface Station {
  station_id: string;
  last_visited: number;
  redownload: boolean;
}

class Stations extends Component<Props, State> {

  public state: State = {
    data: [],
    pagination: {},
    loading: false,
    insertStationLoading: false,
    drawerVisible: false,
  };

  componentDidMount() {
    this.fetchAll();
  }

  server = process.env.NODE_ENV === 'production' ? 'http://192.168.4.1' : 'http://localhost';

  toggleRedownload = async (station: Station, checked: boolean, e: Event) => {

    e.preventDefault();
    e.stopPropagation();

    const oldRedownload = station.redownload;

    fetch(this.server + ':5000/api/stations/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        station_id: station.station_id,
        redownload: (station.redownload ? 0 : 1),
      }),
    })

    // Refetch station data
    // Yeah, it's not the most efficient, but it simplifies the system and
    // eliminates the risk of the state and database falling out of sync.
    await this.fetchAll();

    // Give alert to the user to confirm
    if (Boolean(oldRedownload) === false) {
      notification['success']({
        message: `Redownload Ordered`,
        description: `A redownload for the data station with ID ${station.station_id} has been successfully scheduled for the next flight.`,
      });
    } else {
      notification['error']({
        message: `Redownload Canceled`,
        description: `The scheduled redownload for data station with ID ${station.station_id} has been successfully canceled.`,
      });
    }

    // Ugly, bug fixes weird bug where redownload is ordered, but no visual is made unless the user refreshes
    this.fetchAll();

  }

  findStationStateIndex= (record: Station) => {
    return this.state.data.findIndex((el: Station) =>
      el.station_id === record.station_id);
  }

  columns = [
    { title: 'ID', dataIndex: 'station_id', key: 'station_id' },
    { title: 'Last Visted', dataIndex: 'last_visited', key: 'last_visited' },
    { title: 'Redownload', dataIndex: 'redownload', key: 'redownload',
      render: (text: string, record: Station) => (
        <span >
          <Switch
            onClick={(checked: boolean, event: Event) => {this.toggleRedownload(record, checked, event)}}
            checked={Boolean(this.state.data[this.findStationStateIndex(record)].redownload)}
          />
        </span>
      ),
    },
  ];

  fetchAll = async () => {
    this.setState({ loading: true });

    const response = await fetch(this.server + ':5000/api/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const body = JSON.parse(await response.text());

    this.setState({
      loading: false,
      data: body,
    });

  }

  showDrawer = () => {
    this.setState({
      drawerVisible: true,
    });
  };

  onClose = () => {
    this.setState({
      drawerVisible: false,
    });
  };

  insertStation = async (values: any) => {
    await fetch(this.server + ':5000/api/stations/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        station_id: values.station_id,
      }),
    })

    this.fetchAll();

    this.setState({
      insertStationLoading: false,
    });
  }

  render() {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flexStart', width: '100%'}}>
          <h1 style={{ fontWeight: 600, fontSize: '20px'}}>Data Stations</h1>
          <Button type="primary" onClick={this.showDrawer}>
            <Icon type="plus" /> New data station
          </Button>
        </div>
        <Table
          columns={this.columns}
          rowKey={(station: Station) => station.station_id}
          dataSource={this.state.data}
          loading={this.state.loading}
          bordered
        />
        <Drawer
          title="Add a new data station"
          width={360}
          onClose={this.onClose}
          visible={this.state.drawerVisible}
          style={{
            overflow: 'auto',
            height: 'calc(100% - 108px)',
            paddingBottom: '108px',
          }}
        >
          <NewDataStationForm closeDrawer = {this.onClose} insertStation = {this.insertStation}/>
        </Drawer>
      </div>
    );
  }

}

export default Stations;
