import React, { Component } from 'react';
import { Button, List, notification, Popconfirm } from 'antd';
import axios from 'axios';

import './Advanced.css';

interface Props {
}

interface State {
  logDeleteIsLoading: boolean;
  logDownloadIsLoading: boolean;
  factoryResetIsLoading: boolean;
}
const ButtonGroup = Button.Group;

class Advanced extends Component<Props, State> {

  public state: State = {
    logDeleteIsLoading: false,
    logDownloadIsLoading: false,
    factoryResetIsLoading: false,
  };

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

    notification.info({
      message: 'Factory Reset Complete',
      description: 'All flight records and downloaded sensor data have been permanently deleted.',
    });

    this.setState({ factoryResetIsLoading: false });
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
