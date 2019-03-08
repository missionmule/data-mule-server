import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, } from 'antd';
import {ReactComponent as Airplane} from './img/airplane.svg';
import {ReactComponent as PhotoCamera} from './img/photo-camera.svg';
import {ReactComponent as Settings} from './img/settings.svg';
import logo from './img/mm.png';

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
        <div style={{posiion: 'relative', height: '32px', margin: '16px', display:'flex', flex: '1'}}>
          <span style={{width: '100%'}}>
            <img style={{height: '100%'}} src={logo} alt="Logo" />;
            {!this.state.collapsed ? <h1 style={{ color: '#fff', fontWeight: 600, fontSize: '18px', display: 'inline-block', verticalAlign: 'top', padding: '3px 8px 8px 8px'}}>Mission Mule</h1> : null }
          </span>
        </div>
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
          <Menu.Item key="4">
            <Link to="/advanced">
            {/*
              // @ts-ignore */}
              <Icon component={Settings}/>
              <span>Advanced</span>
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
