import React from 'react';
import ReactDOM from 'react-dom';
import Stations from './Stations';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Stations />, div);
  ReactDOM.unmountComponentAtNode(div);
});
