import React, { Component } from 'react';
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
              <Icon type="pie-chart" />
              <span>Flights</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="desktop" />
              <span>Data Stations</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="setting" />
              <span>Config</span>
            </Menu.Item>
          </Menu>
        </Sider>
    );
  }

}

export default Nav;
