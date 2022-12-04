import {
  ActionType,
  BetaSchemaForm,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl as antUseIntl } from '@ant-design/pro-provider';
import { message } from 'antd';
import React, { useRef, useState } from 'react';

import { useComponentsIntl } from '../locales';
import { doUrlQuery, fetchData } from '../services/datafetch';
import { formatColumns } from './columns';
import { formatToolBar, saveFormRecords } from './operations';
import type {
  AutoTableActionType,
  AutoTableDescriptor,
  AutoTableEditFormStateType,
  AutoTableToolbarParamsOptionsType,
  ColumnItems,
} from './typing';

const AutoTable = (props: AutoTableDescriptor) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance<ColumnItems>>();
  const { title } = props;
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormState, setEditFormState] =
    useState<AutoTableEditFormStateType>({ editMode: undefined });

  const extendActions: AutoTableActionType = {
    startNewForm: (recordKey?: React.Key) => {
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
    },
    cancelNewForm: async (
      recordKey: React.Key,
      needReTry?: boolean | undefined,
    ) => {
      console.debug(' => cancelNewForm', recordKey, needReTry);
      setEditFormVisible(false);
      return true;
    },
    startEditForm: (recordKey: React.Key, record: ColumnItems) => {
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
    },
    cancelEditForm: async (
      recordKey: React.Key,
      needReTry?: boolean | undefined,
    ) => {
      console.debug(' => cancelEditForm', recordKey, needReTry);
      setEditFormVisible(false);
      return true;
    },
  };

  const rowKey = props.rowKey ? props.rowKey : 'id';
  const antIntl = antUseIntl();
  const componentsIntl = useComponentsIntl();
  const autoTableOptions: AutoTableToolbarParamsOptionsType = {
    rowKey,
    actionRef,
    formRef,
    autoTableActions: extendActions,
    antIntl,
    componentsIntl,
    setEditFormVisible,
    setEditFormState,
  };
  const columns = formatColumns(props.columns, props, extendActions);

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
                    rowKey,
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
        toolBarRender={() => formatToolBar(props, autoTableOptions)}
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
        steps={[{ title: 'ProComponent' }]}
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
            rowKey,
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
