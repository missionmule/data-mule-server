import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class Home extends Component {
  render() {
    return (
      <Redirect to='/flights' />
    );
  }

}

// TODO: make this page kickass
// <Steps current={1}>
//   <Step title="Fly UAV" description="Autonomously retrieve sensor data" />
//   <Step title="Download" description="Download gathered sensor data" />
//   <Step title="Delete" description="Clear old flight data" />
// </Steps>

export default Home;
