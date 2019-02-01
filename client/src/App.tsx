import React, { Component } from 'react';
import axios from 'axios';

import logo from './logo.svg';
import './App.css';

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
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  handleSubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch('/api/world', {
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
    console.log("in handleDeleteRequest")

    this.setState({ deleteInProgress: true });

    const response = await fetch('/api/delete');
    const body = await response;
    if (response.status !== 200) throw Error("Delete failure");

    this.setState({ deleteInProgress: false });
  };

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={e => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
        <form onSubmit={this.handleDownloadRequest}>
          <button type="submit">Download</button>
        </form>
        <form onSubmit={this.handleDeleteRequest}>
          <button type="submit">Delete</button>
        </form>
      </div>
    );
  }

}

export default App;
