import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, } from 'antd';

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
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <Link to="/flights">
              <Icon type="pie-chart" />
              <span>Flights</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/stations">
              <Icon type="desktop" />
              <span>Data Stations</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }

}

export default Nav;
