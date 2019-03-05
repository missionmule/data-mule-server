import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';

import { Layout, Breadcrumb } from 'antd';

import Flights from './Flights';
import Home from './Home';
import Nav from './Nav';
import Stations from './Stations';

import './App.css';

const {
  Header, Content, Footer,
} = Layout;

class App extends Component {

  state = {
    response: '',
    post: '',
    responseToPost: '',
    deleteInProgress: false,
    downloadInProgress: false,
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  // Verifies that the API is up and running
  callApi = async () => {
    const response = await fetch('http://localhost:5000/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  handleSubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();
    this.setState({ responseToPost: body });
  };

  handleDownloadRequest = async (e: any) => {
    e.preventDefault();

    this.setState({ downloadInProgress: true });

    axios({
      url: '/api/download',
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      if (response.data.size <= 22) {
        console.log("Nothing to download");
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'MissionMule.zip'); //or any other extension
        document.body.appendChild(link);
        link.click();
      }
    });

    this.setState({ downloadInProgress: false });

  };

  handleDeleteRequest = async (e: any) => {
    e.preventDefault();

    this.setState({ deleteInProgress: true });

    const response = await fetch('http://localhost:5000/api/delete');
    const body = await response;

    // Custom HTTP response code for 'Nothing to delete'
    if (response.status === 540) {
      console.log("Nothing to delete");
    } else if (response.status !== 200) {
       throw Error("Delete failure");
    }

    this.setState({ deleteInProgress: false });
  };


  render() {
    return (
      <div className="App">
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Nav />
            <Layout>
              <Header style={{ background: '#fff', padding: 0 }} />
              <Content style={{ padding: '0 16px' }}>
                <div style={{ margin: '16px 0', padding: 24, background: '#fff', minHeight: 360 }}>
                  <Route exact path="/" component={Home} />
                  <Route path="/flights" component={Flights} />
                  <Route path="/stations"  component={Stations} />
                </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                Mission Mule © 2019
              </Footer>
            </Layout>
          </Layout>
        </Router>
      </div>
    );
  }

}

export default App;
