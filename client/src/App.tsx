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
  };
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

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

    axios({
      url: '/api/download',
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      console.log(response.data)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('MissionMule', 'MissionMule.zip'); //or any other extension
      document.body.appendChild(link);
      link.click();
    });
  }

  handleDeleteRequest = async (e: any) => {
    e.preventDefault();

    this.setState({ deleteInProgress: true });
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.status;
    if (body !== 200) { console.log("Delete error") }
    this.setState({ deleteInProgress: false });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <p>{this.state.response}</p>
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
