import type { ColumnDescriptor } from '@lycium/ant-components';
import { AutoTable } from '@lycium/ant-components';
import React from 'react';

const columns: ColumnDescriptor[] = [
  {
    name: 'id',
    label: '序号',
    valueType: 'indexBorder',
  },
  {
    name: 'name',
    label: '标题',
    search: false,
  },
];

const demoData = [
  {
    id: 1,
    name: `TradeCode ${1}`,
    createdAt: 1602572994055,
  },
];

export default () => (
  <AutoTable
    columns={columns}
    staticData={demoData}
    // search={false}
    rowKey="id"
    // options={{
    //   search: true,
    // }}
    title="toolbar 中搜索"
  />
);
