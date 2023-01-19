import * as icons from '@ant-design/icons';
import React from 'react';

const Icon = (props: { icon: string }) => {
  let { icon } = props;
  const antIcon: { [key: string]: any } = icons;
  if (icon === icon.toLowerCase()) {
    icon = icon.charAt(0).toUpperCase() + icon.slice(1) + 'Outlined';
  }
  return React.createElement(antIcon[icon]);
};

export default Icon;
