import { PlusOutlined } from '@ant-design/icons';
import { TableDropdown } from '@ant-design/pro-components';
import { DropdownProps } from '@ant-design/pro-table/es/components/Dropdown';
import { Button, message, Popconfirm } from 'antd';
import React from 'react';
import { doUrlQuery } from '../services/datafetch';
import { columnBuiltinOperationAction } from './columns';
import {
  AutoTableActionType,
  AutoTableDescriptor,
  AutoTableToolbarParamsOptionsType,
  ColumnItems,
  OperationColumnType,
} from './typing';

const toolbarMenuOperation = async (key: string) => {
  console.debug(`toolbar menu ${key} clicked`);
};

export const formatToolBar = (
  props: AutoTableDescriptor,
  autoTableOptions: AutoTableToolbarParamsOptionsType,
) => {
  const buttons: React.ReactNode[] = [];
  let toolbar = props.toolbar;
  if (!toolbar) {
    if (props.newURL) {
      toolbar = [
        {
          title: autoTableOptions.componentsIntl.getMessage('basic.new', 'New'),
          action: 'add',
          icon: <PlusOutlined />,
          primary: true,
        },
      ];
    } else {
      return buttons;
    }
  }
  toolbar.forEach((operation, index) => {
    if (operation.action) {
      const operationAction = operation.action;
      let popConfirmMessage = '';
      if (operation.action === 'delete') {
        popConfirmMessage =
          autoTableOptions.antIntl.getMessage(
            'deleteThisLine',
            'Delete this line',
          ) + '?';
      } else if (operation.popConfirmMessage || operation.dange) {
        popConfirmMessage = operation.popConfirmMessage
          ? operation.popConfirmMessage
          : autoTableOptions.componentsIntl.getMessage(
              'sureToDoThis',
              'Are you sure to do this operation?',
            );
      }
      if (popConfirmMessage) {
        buttons.push(
          <Popconfirm
            key={`toolbar-${operationAction}`}
            title={popConfirmMessage}
            onConfirm={async () => {
              await columnBuiltinOperationAction(
                operationAction,
                autoTableOptions.rowKey,
                undefined,
                {},
                index,
                autoTableOptions.actionRef.current,
                props,
                operation,
                autoTableOptions.autoTableActions,
              );
            }}
          >
            <Button
              type={operation.primary ? 'primary' : undefined}
              icon={operation.icon ? operation.icon : undefined}
            >
              {operation.title}
            </Button>
          </Popconfirm>,
        );
      } else {
        buttons.push(
          <Button
            key={`toolbar-${operationAction}`}
            icon={operation.icon ? operation.icon : undefined}
            onClick={async () => {
              await columnBuiltinOperationAction(
                operationAction,
                autoTableOptions.rowKey,
                undefined,
                {},
                index,
                autoTableOptions.actionRef.current,
                props,
                operation,
                autoTableOptions.autoTableActions,
              );
            }}
            type={operation.primary ? 'primary' : undefined}
          >
            {operation.title}
          </Button>,
        );
      }
    } else if (operation.url !== undefined) {
      const url = operation.url;
      buttons.push(
        <Button
          key={`toolbar-${index}`}
          icon={operation.icon ? operation.icon : undefined}
          onClick={async () => {
            await doUrlQuery(
              url,
              operation.httpMethod,
              {},
              autoTableOptions.rowKey,
            );
          }}
          type={operation.primary ? 'primary' : undefined}
        >
          {operation.title}
        </Button>,
      );
    } else if (operation.menus) {
      const dropDownProps: DropdownProps = {
        menus: [],
      };
      operation.menus.forEach((e) => {
        dropDownProps.menus?.push({
          key: e.key ? e.key : '',
          name: e.title,
        });
      });
      buttons.push(
        <TableDropdown
          key={`toolbar-${index}`}
          onSelect={async (key) => await toolbarMenuOperation(key)}
          menus={dropDownProps.menus}
        />,
      );
    } else {
      buttons.push(
        <Button
          key={operation.key}
          icon={operation.icon ? operation.icon : undefined}
          type={operation.primary ? 'primary' : undefined}
        >
          {operation.title}
        </Button>,
      );
    }
  });
  // console.debug(' --->> toolbar:', buttons);
  return buttons;
};

export const extendAutoTableActions = (
  props: AutoTableDescriptor,
  autoTableOptions: AutoTableToolbarParamsOptionsType,
): AutoTableActionType => {
  return {
    startNewForm: (recordKey?: React.Key) => {
      console.debug(' => startNewForm', recordKey);
      if (props.newURL) {
        autoTableOptions.setEditFormVisible(false);
        autoTableOptions.setEditFormState({
          editMode: 'add',
          saveURL: props.newURL,
          httpMethod: props.newURLMethod ? props.newURLMethod : 'POST',
        });
        autoTableOptions.formRef.current?.resetFields();
        autoTableOptions.setEditFormVisible(true);
      } else {
        message.error('newURL address were not configured');
      }
      return true;
    },
    cancelNewForm: async (
      recordKey: React.Key,
      needReTry?: boolean | undefined,
    ) => {
      console.debug(' => cancelNewForm', recordKey, needReTry);
      autoTableOptions.setEditFormVisible(false);
      return true;
    },
    startEditForm: (recordKey: React.Key, record: ColumnItems) => {
      console.debug(' => startEditForm', recordKey, 'record:', record);
      autoTableOptions.setEditFormVisible(false);
      if (props.saveURL) {
        autoTableOptions.setEditFormState({
          editMode: 'update',
          recordKey: recordKey,
          saveURL: props.saveURL,
          httpMethod: props.saveURLMethod ? props.saveURLMethod : 'POST',
        });
        autoTableOptions.formRef.current?.setFieldsValue(record);
        autoTableOptions.setEditFormVisible(true);
      } else {
        message.error(
          autoTableOptions.componentsIntl
            .getMessage(
              'prompts.propertyWereNotConfigured',
              '${property} were not configured!',
            )
            .replace('${property}', 'saveURL'),
        );
      }
      return true;
    },
    cancelEditForm: async (
      recordKey: React.Key,
      needReTry?: boolean | undefined,
    ) => {
      console.debug(' => cancelEditForm', recordKey, needReTry);
      autoTableOptions.setEditFormVisible(false);
      return true;
    },
    startViewModal: async (recordKey: React.Key, record: ColumnItems) => {
      autoTableOptions.setViewModalVisible(true);
      autoTableOptions.setViewModalItemData(record);
      if (props.viewURL) {
        const result = await doUrlQuery(
          props.viewURL,
          props.viewURLMethod,
          record,
          autoTableOptions.rowKey,
        );
        if (result && result.success) {
          autoTableOptions.setViewModalItemData(result.data);
        }
      }
      return true;
    },
    cancelViewModal: (recordKey: React.Key) => {
      if (false) {
        console.debug(`view model close by row key:${recordKey}`);
      }
      autoTableOptions.setViewModalVisible(false);
      return true;
    },
    startRelationModal: async (
      recordKey: React.Key,
      record: ColumnItems,
      props?: OperationColumnType,
    ) => {
      if (false) {
        console.debug('start relation modal', recordKey, record, props);
      }
      return true;
    },
    cancelRelationModal: (recordKey: React.Key) => {
      if (false) {
        console.debug('cancel relation modal', recordKey);
      }
      return true;
    },
  };
};

export const saveFormRecords = async (
  url: string | undefined,
  httpMethod: string | undefined,
  record: ColumnItems,
  rowKey: string,
) => {
  if (!url) {
    message.error('saveURL were not configured!');
    return false;
  }
  const result = await doUrlQuery(
    url,
    httpMethod ? httpMethod : 'POST',
    record,
    rowKey,
  );
  if (result && result.success) {
    return true;
  }
  return false;
};
