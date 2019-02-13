import React, { Component } from 'react';
import { Steps, Icon } from 'antd';

import './Home.css';

const { Step } = Steps;

class Home extends Component {
  render() {
    return (
      <Steps current={1}>
        <Step title="Fly UAV" description="Autonomously retrieve sensor data" />
        <Step title="Download" description="Download gathered sensor data" />
        <Step title="Delete" description="Clear old flight data" />
      </Steps>
    );
  }

}

export default Home;
