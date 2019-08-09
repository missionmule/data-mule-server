import React, { Component } from 'react';
import { Button, Form, InputNumber, List, notification, Popconfirm } from 'antd';
import axios from 'axios';

import './Advanced.css';

interface Props {
}

interface State {
  logDeleteIsLoading: boolean;
  logDownloadIsLoading: boolean;
  factoryResetIsLoading: boolean;
  wakeupTimeout: number | undefined;
  wakeupTimeoutIsLoading: boolean;
  connectionTimeout: number | undefined;
  connectionTimeoutIsLoading: boolean;
  downloadTimeout: number | undefined;
  downloadTimeoutIsLoading: boolean;
  shutdownTimeout: number | undefined;
  shutdownTimeoutIsLoading: boolean;
}
const ButtonGroup = Button.Group;

class Advanced extends Component<Props, State> {

  public state: State = {
    logDeleteIsLoading: false,
    logDownloadIsLoading: false,
    factoryResetIsLoading: false,
    wakeupTimeout: 1,
    wakeupTimeoutIsLoading: false,
    connectionTimeout: 1,
    connectionTimeoutIsLoading: false,
    downloadTimeout: 1,
    downloadTimeoutIsLoading: false,
    shutdownTimeout: 1,
    shutdownTimeoutIsLoading: false,
  };

  componentWillMount() {
    this.fetchAll();
  }

  server = process.env.NODE_ENV === 'production' ? 'http://192.168.4.1' : 'http://localhost';

  onClickDownloadLogs = async () => {

    this.setState({ logDownloadIsLoading: true });

    await axios({
      url: this.server + ':5000/api/logs/download',
      method: 'POST',
      data: {},
      headers: {
            'Content-Type': 'application/json',
      },
      responseType: 'blob',
    }).then((response) => {
      if (response.status  === 204) { // Standard code: HTTP/1.1 10.2.5 204 No Content
        notification.info({
          message: 'Nothing to Download',
          description: 'There is no flight log available.',
        });
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'flight-log.zip');
        document.body.appendChild(link);
        link.click();
      }
    }).catch((err) => {
      console.log(err)
    });

    this.setState({ logDownloadIsLoading: false });
  }

  onClickDeleteLogs = async () => {
    this.setState({ logDeleteIsLoading: true });

    // Perform delete
    await fetch(this.server + ':5000/api/logs/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setState({ logDeleteIsLoading: false });
  }

  onClickFactoryReset = async () => {
    this.setState({ factoryResetIsLoading: true });

    // Perform delete
    await fetch(this.server + ':5000/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    await this.fetchAll();

    notification.info({
      message: 'Factory Reset Complete',
      description: 'All flight records and downloaded sensor data have been permanently deleted.',
    });

    this.setState({ factoryResetIsLoading: false });
  }

  fetchAll = async () => {
    this.setState({
      wakeupTimeoutIsLoading: true,
      connectionTimeoutIsLoading: true,
      downloadTimeoutIsLoading: true,
      shutdownTimeoutIsLoading: true,
    });

    const response = await fetch(this.server + ':5000/api/timeouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const body = JSON.parse(await response.text());

    this.setState({
      wakeupTimeout: body[0].time_in_min,
      wakeupTimeoutIsLoading: false,
      connectionTimeout: body[1].time_in_min,
      connectionTimeoutIsLoading: false,
      downloadTimeout: body[2].time_in_min,
      downloadTimeoutIsLoading: false,
      shutdownTimeout: body[3].time_in_min,
      shutdownTimeoutIsLoading: false,
    });

  }

  updateTimeout = async (timeout_id: string, time_in_min: number) => {

    fetch(this.server + ':5000/api/timeouts/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeout_id: timeout_id,
        time_in_min: time_in_min,
      }),
    })

  }


  handleChangeWakeupTimeoutSubmit = async () => {
    const MIN_WAKEUP_TIMEOUT = 1;
    const MAX_WAKEUP_TIMEOUT = 10;
    const timeoutValue = this.state.wakeupTimeout;

    if (timeoutValue !== undefined && typeof timeoutValue === 'number' && timeoutValue <= MAX_WAKEUP_TIMEOUT && timeoutValue >= MIN_WAKEUP_TIMEOUT) {
      this.setState({ wakeupTimeoutIsLoading: true });
      await this.updateTimeout('wakeup', timeoutValue);
      // Gives visual cue for database saving
      setTimeout(() => {
        this.setState({ wakeupTimeoutIsLoading: false });
      }, 1000);
    } else {
      console.log("Invalid input")
    }
  }

  handleChangeConnectionTimeoutSubmit = async () => {
    const MIN_CONNECTION_TIMEOUT = 1;
    const MAX_CONNECTION_TIMEOUT = 10;
    const timeoutValue = this.state.connectionTimeout;

    if (timeoutValue !== undefined && typeof timeoutValue === 'number' && timeoutValue <= MAX_CONNECTION_TIMEOUT && timeoutValue >= MIN_CONNECTION_TIMEOUT) {
      this.setState({ connectionTimeoutIsLoading: true });
      await this.updateTimeout('connection', timeoutValue);
      // Gives visual cue for database saving
      setTimeout(() => {
        this.setState({ connectionTimeoutIsLoading: false });
      }, 1000);
    } else {
      console.log("Invalid input")
    }

  }

  handleChangeDownloadTimeoutSubmit = async () => {
    const MIN_DOWNLOAD_TIMEOUT = 5;
    const MAX_DOWNLOAD_TIMEOUT = 30;
    const timeoutValue = this.state.downloadTimeout;

    if (timeoutValue !== undefined && typeof timeoutValue === 'number' && timeoutValue <= MAX_DOWNLOAD_TIMEOUT && timeoutValue >= MIN_DOWNLOAD_TIMEOUT) {
      this.setState({ downloadTimeoutIsLoading: true });
      await this.updateTimeout('download', timeoutValue);

      // Gives visual cue for database saving
      setTimeout(() => {
        this.setState({ downloadTimeoutIsLoading: false });
      }, 1000);
    } else {
      console.log("Invalid input")
    }


  }

  handleChangeShutdownTimeoutSubmit = async () => {
    const MIN_SHUTDOWN_TIMEOUT = 1;
    const MAX_SHUTDOWN_TIMEOUT = 10;
    const timeoutValue = this.state.shutdownTimeout;

    if (timeoutValue !== undefined && typeof timeoutValue === 'number' && timeoutValue <= MAX_SHUTDOWN_TIMEOUT && timeoutValue >= MIN_SHUTDOWN_TIMEOUT) {
      this.setState({ shutdownTimeoutIsLoading: true });
      await this.updateTimeout('shutdown', timeoutValue);
      // Gives visual cue for database saving
      setTimeout(() => {
        this.setState({ shutdownTimeoutIsLoading: false });
      }, 1000);
    } else {
      console.log("Invalid input")
    }

    // TODO remove this when real DB call is set up
    setTimeout(() => {
      this.setState({ shutdownTimeoutIsLoading: false });
    }, 3000);
  }

  render() {

    const items = [
      {
        title: 'Logs',
        description: 'Download or delete flight logs',
        action: [
          <ButtonGroup>
           <Button
            type="primary"
            shape="round"
            icon="download"
            size="small"
            onClick={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickDownloadLogs();}}
            loading={this.state.logDownloadIsLoading}>
              Download
            </Button>
            <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickDeleteLogs();}} okText="Yes" cancelText="No">
              <Button
               type="danger"
               shape="round"
               icon="delete"
               size="small"
               loading={this.state.logDeleteIsLoading}/>
            </Popconfirm>
          </ButtonGroup>
        ]
      },
      {
        title: 'Configure Wakeup Timeout',
        description: 'Set maximum allowed wakeup time (1-10 min.) Recommended: 4 min.',
        action: [
          <Form layout="inline">
            <Form.Item>
              <InputNumber
                min={1}
                max={10}
                value={this.state.wakeupTimeout}
                disabled={this.state.wakeupTimeoutIsLoading}
                onChange={(value: any) => {this.setState({ wakeupTimeout: value});}} />
            </Form.Item>
            <Form.Item style={{ marginRight: 0}}>
            <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.handleChangeWakeupTimeoutSubmit();}} okText="Yes" cancelText="No">
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.wakeupTimeoutIsLoading}>
                Save
              </Button>
            </Popconfirm>
            </Form.Item>
          </Form>
        ]
      },
      {
        title: 'Configure Connection Timeout',
        description: 'Set maximum time to connect to data station (1-10 min.) Recommended: 4 min.',
        action: [
          <Form layout="inline">
            <Form.Item>
              <InputNumber
                min={1}
                max={10}
                value={this.state.connectionTimeout}
                disabled={this.state.connectionTimeoutIsLoading}
                onChange={(value: any) => {this.setState({ connectionTimeout: value});}} />
            </Form.Item>
            <Form.Item style={{ marginRight: 0}}>
            <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.handleChangeConnectionTimeoutSubmit();}} okText="Yes" cancelText="No">
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.connectionTimeoutIsLoading}>
                Save
              </Button>
            </Popconfirm>
            </Form.Item>
          </Form>
        ]
      },
      {
        title: 'Configure Download Timeout',
        description: 'Set maximum allowed download time (5-30 min.) Recommended: 10 min.',
        action: [
          <Form layout="inline" onSubmit={(e: any) => {e.preventDefault(); e.stopPropagation(); this.handleChangeDownloadTimeoutSubmit();}}>
            <Form.Item>
              <InputNumber
                min={5}
                max={30}
                value={this.state.downloadTimeout}
                disabled={this.state.downloadTimeoutIsLoading}
                onChange={(value: any) => {this.setState({ downloadTimeout: value});}} />
            </Form.Item>
            <Form.Item style={{ marginRight: 0}}>
            <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.handleChangeDownloadTimeoutSubmit();}} okText="Yes" cancelText="No">
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.downloadTimeoutIsLoading}>
                Save
              </Button>
            </Popconfirm>
            </Form.Item>
          </Form>
        ]
      },
      {
        title: 'Configure Shutdown Timeout',
        description: 'Set maximum allowed shutdown time (1-10 min.) Recommended: 2 min.',
        action: [
          <Form layout="inline">
            <Form.Item>
              <InputNumber
                min={1}
                max={10}
                value={this.state.shutdownTimeout}
                disabled={this.state.shutdownTimeoutIsLoading}
                onChange={(value: any) => {this.setState({ shutdownTimeout: value});}} />
            </Form.Item>
            <Form.Item style={{ marginRight: 0}}>
            <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.handleChangeShutdownTimeoutSubmit();}} okText="Yes" cancelText="No">
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.shutdownTimeoutIsLoading}>
                Save
              </Button>
            </Popconfirm>
            </Form.Item>
          </Form>
        ]
      },
      {
        title: 'Factory Reset',
        description: 'Delete all data and flight records',
        action: [
          <Popconfirm title="Are you sure?" onConfirm={(e: any) => {e.preventDefault(); e.stopPropagation(); this.onClickFactoryReset();}} okText="Yes" cancelText="No">
            <Button
             type="danger"
             icon="warning"
             size="small"
             loading={this.state.factoryResetIsLoading}>
              Reset
            </Button>
          </Popconfirm>
        ]
      },
    ]
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flexStart', width: '100%'}}>
          <h1 style={{ fontWeight: 600, fontSize: '20px'}}>Advanced</h1>
        </div>
        <div style={{ textAlign: 'left' }}>
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item: { title: String; description: String; action: React.ReactNode[] }) => (
              <List.Item actions={item.action}>
                <List.Item.Meta
                title={item.title}
                description={item.description}
                />
              </List.Item>
            )}
          />
        </div>

      </div>
    );
  }

}

export default Advanced;
