import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnDescriptor } from '@lycium/ant-components';
import { AutoTable } from '@lycium/ant-components';
import { Button } from 'antd';
import React from 'react';

const columns: ColumnDescriptor[] = [
  {
    name: 'index',
    label: '',
    valueType: 'indexBorder',
    width: 48,
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
    hideInDescriptions: true,
  },
  {
    label: '操作',
    name: 'option',
    valueType: 'option',
    hideInSearch: true,
    key: 'option',
    operations: [
      {
        title: '角色',
        action: 'relation',
        icon: 'TeamOutlined',
        modalLayoutMode: 'checkbox',
        searchURL: [
          { key: 1, title: '管理员' },
          { key: 2, title: '组长' },
          { key: 3, title: '操作员' },
          { key: 4, title: '审计员' },
        ],
        saveURL: '',
        selectedURL: [3],
      },
      {
        title: '编辑',
        action: 'update',
        icon: 'form',
      },
      {
        title: '',
        menus: [
          { key: 'copy', title: '复制', icon: 'copy' },
          { key: 'delete', title: '删除', icon: 'delete' },
        ],
      },
    ],
  },
];

export default () => {
  return (
    <AutoTable
      columns={columns}
      cardBordered
      fetchDataURL={'https://proapi.azurewebsites.net/github/issues'}
      editable={true}
      rowKey="id"
      pagination={{
        pageSize: 5,
      }}
      // dateFormatter="string"
      title="可配置记录关联关系表格"
      toolbar={[
        { title: '新建', primary: true, icon: <PlusOutlined /> },
        {
          title: (
            <Button>
              <EllipsisOutlined />
            </Button>
          ),
          menus: [
            {
              title: '1st item',
              key: '1',
            },
            {
              title: '2nd item',
              key: '2',
            },
            {
              title: '3rd item',
              key: '3',
            },
          ],
        },
      ]}
    />
  );
};
