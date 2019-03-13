import React, { Component } from 'react';
import {
  Form, Input, Button, Row, Col
} from 'antd';

class NewDataStationForm extends Component {

  state = {
    insertStationLoading: false,
  };

  server = process.env.NODE_ENV === 'production' ? 'http://192.168.4.1' : 'http://localhost';

  handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      insertStationLoading: true,
    });

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.insertStation(values);
      }
    });

    this.props.closeDrawer();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form layout="vertical" onSubmit={(e) => {this.handleSubmit(e)}}>
          <Row gutter={16}>
            <Col span={16}>
            <Form.Item label="Data Station ID">
              {getFieldDecorator('station_id', {
                rules: [{ required: true, message: 'Please enter a data station ID' }],
              })(
                <Input
                  style={{ width: '100%' }}
                  placeholder="Please enter a data station ID"
                />
              )}
            </Form.Item>
            </Col>
          </Row>
        </Form>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={this.props.closeDrawer} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} type="primary">
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

const WrappedAddNewDataStationForm = Form.create()(NewDataStationForm);

export default WrappedAddNewDataStationForm;
