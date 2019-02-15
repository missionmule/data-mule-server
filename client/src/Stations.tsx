import React, { Component } from 'react';
import { notification, Switch, Table } from 'antd';

import './Stations.css';

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
  };

  componentDidMount() {
    this.fetch();
  }

  toggleRedownload = async (station: Station) => {

    const oldRedownload = station.redownload;

    fetch('/api/stations/update', {
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
    await this.fetch();

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
        <span onClick={e => {e.preventDefault(); e.stopPropagation(); this.toggleRedownload(record);}}>
          <Switch checked={Boolean(this.state.data[this.findStationStateIndex(record)].redownload)}/>
        </span>
      ),
    },
  ];

  fetch = async () => {
    this.setState({ loading: true });

    const response = await fetch('/api/stations', {
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

  render() {
    return (
      <div>
        <Table
          columns={this.columns}
          rowKey={(station: Station) => station.station_id}
          dataSource={this.state.data}
          loading={this.state.loading}
          bordered
        />
      </div>
    );
  }

}

export default Stations;
