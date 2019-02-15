import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, } from 'antd';
import {ReactComponent as Airplane} from './img/airplane.svg';
import {ReactComponent as PhotoCamera} from './img/photo-camera.svg';

import './Nav.css';

const { Sider } = Layout;

class Nav extends Component {

  state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  }

  render() {

    return (
      <Sider
        collapsible
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline">
          <Menu.Item key="2">
            <Link to="/flights">
            {/*
              // @ts-ignore */}
              <Icon component={Airplane}/>
              <span>Flights</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/stations">
            {/*
              // @ts-ignore */}
              <Icon component={PhotoCamera}/>
              <span>Data Stations</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }

}

// TODO: Add home page with overview of flight stats, file system usage, data stations, etc.
// <Menu.Item key="1">
//   <Link to="/">
//     <Icon type="pie-chart" />
//     <span>Home</span>
//   </Link>
// </Menu.Item>

export default Nav;
