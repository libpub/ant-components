import { PlusOutlined } from '@ant-design/icons';
import {
  BetaSchemaForm,
  ProFormInstance,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { useIntl as antUseIntl } from '@ant-design/pro-provider';
import { DropdownProps } from '@ant-design/pro-table/es/components/Dropdown';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';

import { useComponentsIntl } from '../locales';
import { columnBuiltinOperationAction, formatColumns } from './columns';
import { doUrlQuery, fetchData } from './datafetch';
import type {
  AutoTableActionType,
  AutoTableDescriptor,
  AutoTableEditFormStateType,
  ColumnItems,
} from './typing';

const AutoTable = (props: AutoTableDescriptor) => {
  const actionRef = useRef<AutoTableActionType>();
  const formRef = useRef<ProFormInstance<ColumnItems>>();
  const { title } = props;
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormState, setEditFormState] =
    useState<AutoTableEditFormStateType>({ editMode: undefined });

  const columns = formatColumns(props.columns, props);
  const rowKey = props.rowKey ? props.rowKey : 'id';
  const antIntl = antUseIntl();
  const componentsIntl = useComponentsIntl();
  const extendActionRef = () => {
    if (actionRef.current) {
      actionRef.current.startNewForm = (recordKey?: React.Key) => {
        console.debug(' => startNewForm', recordKey);
        if (props.newURL) {
          setEditFormVisible(false);
          setEditFormState({
            editMode: 'add',
            saveURL: props.newURL,
            httpMethod: props.newURLMethod ? props.newURLMethod : 'POST',
          });
          formRef.current?.resetFields();
          setEditFormVisible(true);
        } else {
          message.error('newURL address were not configured');
        }
        return true;
      };
      actionRef.current.cancelNewForm = async (
        recordKey: React.Key,
        needReTry?: boolean | undefined,
      ) => {
        console.debug(' => cancelNewForm', recordKey, needReTry);
        setEditFormVisible(false);
        return true;
      };
      actionRef.current.startEditForm = (
        recordKey: React.Key,
        record: ColumnItems,
      ) => {
        console.debug(' => startEditForm', recordKey, 'record:', record);
        setEditFormVisible(false);
        if (props.saveURL) {
          setEditFormState({
            editMode: 'update',
            recordKey: recordKey,
            saveURL: props.saveURL,
            httpMethod: props.saveURLMethod ? props.saveURLMethod : 'POST',
          });
          formRef.current?.setFieldsValue(record);
          setEditFormVisible(true);
        } else {
          message.error('saveURL address were not configured');
        }
        return true;
      };
      actionRef.current.cancelEditForm = async (
        recordKey: React.Key,
        needReTry?: boolean | undefined,
      ) => {
        console.debug(' => cancelEditForm', recordKey, needReTry);
        setEditFormVisible(false);
        return true;
      };
    }
  };
  extendActionRef();

  const saveFormRecords = async (
    url: string | undefined,
    httpMethod: string | undefined,
    record: ColumnItems,
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

  const toolbarMenuOperation = async (key: string) => {
    console.debug(`toolbar menu ${key} clicked`);
  };

  const formatToolBar = () => {
    const buttons: React.ReactNode[] = [];
    let toolbar = props.toolbar;
    if (!toolbar) {
      if (props.newURL) {
        toolbar = [
          {
            title: componentsIntl.getMessage('basic.new', 'New'),
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
            antIntl.getMessage('deleteThisLine', 'Delete this line') + '?';
        } else if (operation.popConfirmMessage || operation.dange) {
          popConfirmMessage = operation.popConfirmMessage
            ? operation.popConfirmMessage
            : componentsIntl.getMessage(
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
                  rowKey,
                  undefined,
                  {},
                  index,
                  actionRef.current,
                  props,
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
                  rowKey,
                  undefined,
                  {},
                  index,
                  actionRef.current,
                  props,
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
              await doUrlQuery(url, operation.httpMethod, {}, rowKey);
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
    console.debug(' --->> toolbar:', buttons);
    return buttons;
  };

  return (
    <>
      <ProTable<ColumnItems>
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}, sort, filter) => {
          console.log('params', params, 'sort:', sort, 'filter:', filter);
          return await fetchData(
            props.fetchDataURL ? props.fetchDataURL : props.staticData,
            params,
            sort,
            filter,
          );
        }}
        rowKey={rowKey}
        columnEmptyText={props.columnEmptyText}
        manualRequest={props.manualRequest}
        cardBordered={props.cardBordered}
        editable={
          props.editable
            ? {
                type: 'multiple',
                onSave: async (key, record, originRow, newLineConfig?) => {
                  if (!props.saveURL) {
                    message.error('saveURL were not configured!');
                    return false;
                  }
                  if (newLineConfig) {
                    // TODO
                  }
                  return await saveFormRecords(
                    props.saveURL,
                    props.saveURLMethod,
                    record,
                  );
                },
                onDelete: async (key, record) => {
                  if (!props.deleteURL) {
                    message.error('deleteURL were not configured!');
                    return false;
                  }
                  const result = await doUrlQuery(
                    props.deleteURL,
                    props.deleteURLMethod ? props.deleteURLMethod : 'DELETE',
                    record,
                    rowKey,
                  );
                  if (result && result.success) {
                    return true;
                  }
                },
              }
            : undefined
        }
        // columnsState={{
        //   persistenceKey: 'pro-table-singe-demos',
        //   persistenceType: 'localStorage',
        //   onChange(value) {
        //     console.log('value: ', value);
        //   },
        // }}
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={
          props.pagination
            ? props.pagination
            : {
                pageSize: 5,
                onChange: (page) => console.log(page),
              }
        }
        dateFormatter="string"
        headerTitle={title}
        toolBarRender={() => formatToolBar()}
      />
      <BetaSchemaForm<ColumnItems>
        formRef={formRef}
        open={editFormVisible}
        onOpenChange={(visible) => {
          console.debug('SchemaForm onOpenChange', visible);
          if (editFormVisible && visible !== editFormVisible) {
            setEditFormVisible(false);
          }
        }}
        layoutType={props.saveFormMode ? props.saveFormMode : 'ModalForm'}
        steps={[
          {
            title: 'ProComponent',
          },
        ]}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        grid={
          props.saveFormMode !== 'LightFilter' &&
          props.saveFormMode !== 'QueryFilter'
        }
        onFinish={async (values) => {
          if (editFormState.editMode === 'update' && !values[rowKey]) {
            values[rowKey] = editFormState.recordKey;
          }
          console.log('onSaveForm model submit with values:', values);
          const result = await saveFormRecords(
            editFormState.saveURL,
            editFormState.httpMethod,
            values,
          );
          if (result) {
            setEditFormVisible(false);
          }
        }}
        columns={
          (props.saveFormMode === 'StepsForm' ? [columns] : columns) as any
        }
      />
    </>
  );
};

export default AutoTable;
