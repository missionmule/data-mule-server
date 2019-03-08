import React from 'react';
import ReactDOM from 'react-dom';
import Advanced from './Advanced';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Advanced />, div);
  ReactDOM.unmountComponentAtNode(div);
});
