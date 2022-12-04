import type { ColumnDescriptor } from '@lycium/ant-components';
import { AutoTable } from '@lycium/ant-components';
import React from 'react';

const columns: ColumnDescriptor[] = [
  {
    name: 'index',
    label: '',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    name: 'id',
    label: 'ID',
    hideInTable: true,
    hideInForm: true,
    readonly: true,
    hideInSearch: true,
  },
  {
    label: '标题',
    name: 'title',
    copyable: true,
    ellipsis: true,
    description: '标题过长会自动收缩',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    disable: true,
    label: '状态',
    name: 'state',
    filters: true,
    // onFilter: true,
    ellipsis: true,
    valueType: 'select',
    valueEnum: [
      { value: 'all', text: '超长'.repeat(50) },
      { value: 'open', text: '未解决', status: 'Error' },
      { value: 'closed', text: '已解决', status: 'Success', disabled: true },
      { value: 'processing', text: '解决中', status: 'Processing' },
    ],
  },
  {
    disable: true,
    label: '标签',
    name: 'labels',
    search: false,
    tagOptions: { key: 'name', colorKey: 'color' },
    // renderFormItem: (_, { defaultRender }) => {
    //   return defaultRender(_);
    // },
  },
  {
    label: '创建时间',
    // key: 'showTime',
    name: 'created_at',
    valueType: 'dateTime',
    sortable: true,
    hideInSearch: true,
  },
  {
    label: '创建时间',
    name: 'created_at',
    valueType: 'dateRange',
    hideInTable: true,
    hideInForm: true,
    // search: {
    //   transform: (value) => {
    //     return {
    //       startTime: value[0],
    //       endTime: value[1],
    //     };
    //   },
    // },
  },
];

export default () => {
  return (
    <AutoTable
      columns={columns}
      cardBordered
      fetchDataURL={'https://proapi.azurewebsites.net/github/issues'}
      saveURL={'https://proapi.azurewebsites.net/github/issues'}
      newURL={'https://proapi.azurewebsites.net/github/issues'}
      viewURL={'https://proapi.azurewebsites.net/github/issues'}
      deleteURL={'https://proapi.azurewebsites.net/github/issues'}
      editable={true}
      rowKey="id"
      pagination={{
        pageSize: 5,
      }}
      // dateFormatter="string"
      title="内置CRUD表格"
    />
  );
};
