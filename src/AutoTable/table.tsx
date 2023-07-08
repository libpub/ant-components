import {
  ActionType,
  BetaSchemaForm,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl as antUseIntl } from '@ant-design/pro-provider';
import { message, Modal } from 'antd';
import React, { useRef, useState } from 'react';

import { useComponentsIntl } from '../locales';
import { doUrlQuery, fetchData } from '../services/datafetch';
import { formatColumns } from './columns';
import { formatToolBar, saveFormRecords } from './operations';
import RelationForm from './relationform';
import type {
  AutoTableActionType,
  AutoTableDescriptor,
  AutoTableEditFormStateType,
  AutoTableToolbarParamsOptionsType,
  ColumnItems,
  IntlInstancesType,
  OperationColumnType,
} from './typing';

const AutoTable = (props: AutoTableDescriptor) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance<ColumnItems>>();
  const { title } = props;
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [relationModalVisible, setRelationModalVisible] = useState(false);
  const [viewModalItemData, setViewModalItemData] = useState<ColumnItems>({});
  const [editFormState, setEditFormState] =
    useState<AutoTableEditFormStateType>({ editMode: undefined });
  const [recordOperationProps, setRecordOperationProps] =
    useState<OperationColumnType>({ title: '' });

  const rowKey = props.rowKey ? props.rowKey : 'id';
  const antIntl = antUseIntl();
  const componentsIntl = useComponentsIntl();
  const extendActions: AutoTableActionType = {
    startNewForm: (recordKey?: React.Key) => {
      console.debug(' => startNewForm', recordKey);
      if (props.newURL) {
        // setEditFormVisible(false);
        setEditFormVisible(true);
        setEditFormState({
          editMode: 'add',
          saveURL: props.newURL,
          httpMethod: props.newURLMethod ? props.newURLMethod : 'POST',
        });
        formRef.current?.resetFields();
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
      // setEditFormVisible(false);
      if (props.saveURL) {
        setEditFormVisible(true);
        // console.debug(' --> startEditForm current formRef', formRef.current?.getFieldsValue());
        setEditFormState({
          editMode: 'update',
          recordKey: recordKey,
          saveURL: props.saveURL,
          httpMethod: props.saveURLMethod ? props.saveURLMethod : 'POST',
        });
        formRef.current?.setFieldsValue(record);
      } else {
        message.error(
          componentsIntl
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
      setEditFormVisible(false);
      return true;
    },
    startViewModal: async (recordKey: React.Key, record: ColumnItems) => {
      setViewModalVisible(true);
      setViewModalItemData(record);
      if (props.viewURL) {
        const result = await doUrlQuery(
          props.viewURL,
          props.viewURLMethod,
          record,
          rowKey,
        );
        if (
          result &&
          result.success &&
          result.data &&
          result.data instanceof Map
        ) {
          setViewModalItemData(result.data);
        }
      }
      return true;
    },
    cancelViewModal: (recordKey: React.Key) => {
      if (false) {
        console.debug(`view model close by row key:${recordKey}`);
      }
      setViewModalVisible(false);
      return true;
    },
    startRelationModal: async (
      recordKey: React.Key,
      record: ColumnItems,
      props?: OperationColumnType,
    ) => {
      setEditFormState({
        editMode: 'relation',
        recordKey: recordKey,
        saveURL: props?.saveURL,
        httpMethod: props?.httpMethod,
      });
      if (props) {
        setRecordOperationProps(props);
      }
      setRelationModalVisible(true);
      return true;
    },
    cancelRelationModal: (recordKey: React.Key) => {
      console.debug('cancel relation modal by key:', recordKey);
      setRelationModalVisible(false);
      return true;
    },
  };

  const autoTableOptions: AutoTableToolbarParamsOptionsType = {
    rowKey,
    actionRef,
    formRef,
    autoTableActions: extendActions,
    antIntl,
    componentsIntl,
    setEditFormVisible,
    setEditFormState,
    setViewModalVisible,
    setViewModalItemData,
  };
  const intlInstances: IntlInstancesType = {
    antIntl,
    componentsIntl,
  };
  const columns = formatColumns(
    props.columns,
    props,
    extendActions,
    intlInstances,
  );

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
                  const ok = await saveFormRecords(
                    props.saveURL.replace(':id', key.toString()),
                    props.saveURLMethod,
                    record,
                    rowKey,
                  );
                  if (ok) {
                    actionRef.current?.reload();
                  }
                },
                onDelete: async (key, record) => {
                  if (!props.deleteURL) {
                    message.error('deleteURL were not configured!');
                    return false;
                  }
                  const result = await doUrlQuery(
                    props.deleteURL.replace(':id', key.toString()),
                    props.deleteURLMethod ? props.deleteURLMethod : 'DELETE',
                    record,
                    rowKey,
                  );
                  if (result && result.success) {
                    actionRef.current?.reload();
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
          console.debug(
            'SchemaForm onOpenChange',
            visible,
            'values',
            formRef.current?.getFieldsValue(),
          );
          if (editFormVisible && visible !== editFormVisible) {
            setEditFormVisible(false);
          }
        }}
        layoutType={props.saveFormMode ? props.saveFormMode : 'ModalForm'}
        {...(props.saveFormMode === 'ModalForm'
          ? {
              modalProps: { destroyOnClose: true },
            }
          : props.saveFormMode === 'DrawerForm'
          ? {
              drawerProps: { destroyOnClose: true },
            }
          : {})}
        // steps={[{ title: 'ProComponent' }]}
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
          let saveURL = editFormState.saveURL;
          if (editFormState.editMode === 'update' && !values[rowKey]) {
            values[rowKey] = editFormState.recordKey;
            saveURL = saveURL?.replace(':id', values[rowKey].toString());
          }
          console.log('onSaveForm model submit with values:', values);
          const result = await saveFormRecords(
            saveURL,
            editFormState.httpMethod,
            values,
            rowKey,
          );
          if (result) {
            actionRef.current?.reload();
            setEditFormVisible(false);
          }
        }}
        columns={
          (props.saveFormMode === 'StepsForm' ? [columns] : columns) as any
        }
        // shouldUpdate={editFormVisible}
      />
      <Modal
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
        }}
        onOk={() => {
          setViewModalVisible(false);
        }}
      >
        <ProDescriptions
          title={componentsIntl.getMessage('basic.view', 'View') + title}
          // bordered={true}
          dataSource={viewModalItemData}
          columns={columns as ProDescriptionsItemProps<ColumnItems>[]}
        ></ProDescriptions>
      </Modal>
      <RelationForm
        open={relationModalVisible}
        title={recordOperationProps.title}
        recordKey={editFormState.recordKey}
        mode={recordOperationProps.modalLayoutMode}
        componentsIntl={componentsIntl}
        searchURL={recordOperationProps.searchURL}
        saveURL={recordOperationProps.saveURL}
        selectedURL={recordOperationProps.selectedURL}
        keyFieldName={recordOperationProps.keyFieldName}
        titleFieldName={recordOperationProps.titleFieldName}
        childrenFieldName={recordOperationProps.childrenFieldName}
        onOk={() => {
          setRelationModalVisible(false);
        }}
        onCancel={() => {
          setRelationModalVisible(false);
        }}
      />
    </>
  );
};

export default AutoTable;
