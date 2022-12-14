import {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
  ProFieldValueEnumType,
  ProSchemaValueEnumType,
  TableDropdown,
} from '@ant-design/pro-components';
import { DropdownProps } from '@ant-design/pro-table/es/components/Dropdown';
import { message, Popconfirm, Space, Tag } from 'antd';
import moment from 'moment';
import React from 'react';
import { doUrlQuery } from '../services/datafetch';
import type {
  AutoTableActionType,
  AutoTableDescriptor,
  ColumnBuiltinOperationTypes,
  ColumnDescriptor,
  ColumnItems,
  IntlInstancesType,
  OperationColumnType,
  TagsOptionsType,
  ValueEnumType,
} from './typing';

const timestampToMoment = (ts: number, valueType?: string) => {
  let d = moment();
  switch (valueType) {
    case 'milliseconds':
      d = moment().millisecond(ts);
      break;
    case 'seconds':
      d = moment().second(ts);
      break;
    default:
      d = moment(ts);
      break;
  }
  return d;
};

const formatColumnValueType = (
  column: ColumnItems,
  element: ColumnDescriptor,
) => {
  if (column.key === undefined) {
    column.key = element.name;
  }
  switch (element.valueType) {
    case 'dateTime':
      column.render = (dom: React.ReactNode, record: ColumnItems) => {
        const value = record[element.name];
        if (dom instanceof String) {
          return moment(value?.toString()).format('YYYY-MM-DD HH:mm:ss');
        } else if (dom instanceof Number) {
          const formattedValue = timestampToMoment(
            Number(dom).valueOf(),
          ).format('YYYY-MM-DD HH:mm:ss');
          return formattedValue;
        }
        return moment(value?.toString()).format('YYYY-MM-DD HH:mm:ss');
      };
      break;
    case 'date':
      column.render = (dom: React.ReactNode, record: ColumnItems) => {
        const value = record[element.name];
        // console.debug('column:', element.name, 'value:', value, dom, record, index)
        if (value instanceof String) {
          return moment(value?.toString()).format('YYYY-MM-DD');
        } else if (value instanceof Number) {
          const formattedValue = timestampToMoment(
            Number(value).valueOf(),
          ).format('YYYY-MM-DD');
          return formattedValue;
        }
        return moment(value?.toString()).format('YYYY-MM-DD');
      };
      break;
    case 'option':
      column.hideInSearch = true;
      column.hideInDescriptions = true;
    default:
      break;
  }
};

const formatColumnValueEnum = (
  column: ColumnItems,
  valueEnum: ValueEnumType[],
) => {
  const columnEnumValue: ProFieldValueEnumType = {};
  valueEnum.forEach((ee) => {
    const enumValue: ProSchemaValueEnumType | React.ReactNode = {
      text: ee.text,
    };
    if (ee.status !== undefined) {
      enumValue.status = ee.status;
    }
    if (ee.color !== undefined) {
      enumValue.color = ee.color;
    }
    if (ee.disabled !== undefined) {
      enumValue.disabled = ee.disabled;
    }
    columnEnumValue[ee.value] = enumValue;
  });
  column.valueEnum = columnEnumValue;
};

const formatColumnTagsRender = (
  column: ColumnItems,
  tagsOptions: TagsOptionsType,
) => {
  column.render = (
    dom: React.ReactNode /*, record: ColumnItems, index: number */,
  ) => {
    if (dom instanceof Array) {
      return (
        <Space>
          {dom.map((ele) => (
            <Tag
              color={
                tagsOptions.colorKey ? ele[tagsOptions.colorKey] : undefined
              }
              key={ele[tagsOptions.key]}
            >
              {ele[tagsOptions.key]}
            </Tag>
          ))}
        </Space>
      );
    } else if (dom instanceof Map) {
      return (
        <Space>
          <Tag
            color={
              tagsOptions.colorKey ? dom.get(tagsOptions.colorKey) : undefined
            }
            key={dom.get(tagsOptions.colorKey)}
          >
            {dom.get(tagsOptions.colorKey)}
          </Tag>
        </Space>
      );
    }
    return (
      <Space>
        <Tag>{dom}</Tag>
      </Space>
    );
  };
};

const getTableRowKey = (props?: AutoTableDescriptor) => {
  let rowKey = props?.rowKey;
  if (!rowKey) {
    rowKey = 'id';
  }
  return rowKey;
};

const generateBuiltInOperationColumn = (
  props?: AutoTableDescriptor,
  intlInstances?: IntlInstancesType,
) => {
  const operations: OperationColumnType[] = [];
  if (!props) {
    return operations;
  }
  if (props.viewURL) {
    operations.push({
      title: intlInstances?.componentsIntl.getMessage('basic.view', 'View'),
      action: 'view',
    });
  }
  if (props.saveURL) {
    operations.push({
      title: intlInstances?.componentsIntl.getMessage('basic.edit', 'Edit'),
      action: 'update',
    });
  }
  if (props.deleteURL) {
    operations.push({
      title: intlInstances?.antIntl.getMessage(
        'editableTable.action.delete',
        'Delete',
      ),
      action: 'delete',
    });
  }
  return operations;
};

export const columnBuiltinOperationAction = async (
  operationAction: ColumnBuiltinOperationTypes,
  rowKey: string,
  dom: React.ReactNode,
  record: ColumnItems,
  index: number,
  action: ActionType | undefined,
  props?: AutoTableDescriptor,
  autoTableActions?: AutoTableActionType,
  intlInstances?: IntlInstancesType,
) => {
  console.debug(
    `click rowIndex:${index} record:${record[rowKey]} operation:${operationAction} with record:`,
    record,
    'and nodeAction:',
    action,
  );
  switch (operationAction) {
    case 'inlineedit':
      action?.startEditable?.(record[rowKey]);
      break;
    case 'add':
      autoTableActions?.startNewForm?.(record[rowKey]);
      break;
    case 'update':
      autoTableActions?.startEditForm?.(record[rowKey], record);
      break;
    case 'view':
      autoTableActions?.startViewModal?.(record[rowKey], record);
      break;
    case 'delete':
      {
        if (!props?.deleteURL) {
          message.error(
            intlInstances?.componentsIntl
              .getMessage(
                'prompts.propertyWereNotConfigured',
                '${property} were not configured!',
              )
              .replace('${property}', 'deleteURL'),
          );
          return false;
        }
        const result = await doUrlQuery(
          props.deleteURL,
          props.deleteURLMethod ? props.deleteURLMethod : 'DELETE',
          record,
          props.rowKey,
        );
        console.debug('delete url query result:', result);
        if (result && result.success) {
          return true;
        }
      }
      break;
  }
};

const columnMenuItemOperation = async (
  key: string,
  rowKey: string,
  dom: React.ReactNode,
  record: ColumnItems,
  index: number,
  action: ActionType | undefined,
  autoTableActions?: AutoTableActionType,
) => {
  console.debug(
    `click rowIndex:${index} record:${record[rowKey]} menu key:${key} with record:`,
    record,
    'and nodeAction:',
    action,
    'custom Actions:',
    autoTableActions,
  );
  switch (key) {
  }
};

const formatColumnOperationsButtons = (
  column: ColumnItems,
  operations: OperationColumnType[],
  props?: AutoTableDescriptor,
  autoTableActions?: AutoTableActionType,
  intlInstances?: IntlInstancesType,
) => {
  if (!operations) {
    return;
  }
  const rowKey = getTableRowKey(props);
  column.render = (
    dom: React.ReactNode,
    record: ColumnItems,
    index: number,
    action: ActionType | undefined,
  ) => {
    const buttons: React.ReactNode[] = [];
    operations.forEach((operation, index) => {
      if (operation.action) {
        const operationAction = operation.action;
        let popConfirmMessage: string | undefined = '';
        if (operation.action === 'delete') {
          popConfirmMessage =
            intlInstances?.antIntl.getMessage(
              'deleteThisLine',
              'Delete this line',
            ) + '?';
        } else if (operation.popConfirmMessage || operation.dange) {
          popConfirmMessage = operation.popConfirmMessage
            ? operation.popConfirmMessage
            : intlInstances?.componentsIntl.getMessage(
                'sureToDoThis',
                'Are you sure to do this operation?',
              );
        }
        if (popConfirmMessage) {
          buttons.push(
            <Popconfirm
              key={`${column.dataIndex}-${operationAction}`}
              title={popConfirmMessage}
              onConfirm={async () => {
                await columnBuiltinOperationAction(
                  operationAction,
                  rowKey,
                  dom,
                  record,
                  index,
                  action,
                  props,
                  autoTableActions,
                  intlInstances,
                );
              }}
            >
              <a>{operation.title}</a>
            </Popconfirm>,
          );
        } else {
          buttons.push(
            <a
              key={`${column.dataIndex}-${operationAction}`}
              onClick={async () => {
                await columnBuiltinOperationAction(
                  operationAction,
                  rowKey,
                  dom,
                  record,
                  index,
                  action,
                  props,
                  autoTableActions,
                  intlInstances,
                );
              }}
            >
              {operation.title}
            </a>,
          );
        }
      } else if (operation.url !== undefined) {
        const url = operation.url;
        buttons.push(
          <a
            key={`${column.dataIndex}-${index}`}
            onClick={async () => {
              await doUrlQuery(url, operation.httpMethod, record, rowKey);
            }}
          >
            {operation.title}
          </a>,
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
            key={`${column.dataIndex}-${index}`}
            onSelect={async (key) =>
              await columnMenuItemOperation(
                key,
                rowKey,
                dom,
                record,
                index,
                action,
                autoTableActions,
              )
            }
            menus={dropDownProps.menus}
          />,
        );
      }
    });
    return buttons;
  };
};

const formatColumn = (
  element: ColumnDescriptor,
  props?: AutoTableDescriptor,
  autoTableActions?: AutoTableActionType,
  intlInstances?: IntlInstancesType,
) => {
  const column: ColumnItems = {
    dataIndex: element.name,
    title: element.label === undefined ? element.name : element.label,
    valueType: element.valueType,
    colSize: element.colSize,
    ellipsis: element.ellipsis,
    copyable: element.copyable,
    search: element.search,
    hideInTable: element.hideInTable,
    hideInSearch: element.hideInSearch,
    hideInForm: element.hideInForm,
    hideInSetting: element.hideInSetting,
    hideInDescriptions: element.hideInDescriptions,
    key: element.key,
    // editable: element.editable,
    disable: element.disable,
    readonly: element.readonly,
    width: element.width,
    tooltip: element.description,
    initialValue: element.initialValue,
    formItemProps: element.formItemProps,
  };
  if (element.sortable) {
    column.sorter = element.sortable;
  }
  if (element.filters) {
    column.filters = element.filters;
  }
  formatColumnValueType(column, element);
  if (element.valueEnum) {
    formatColumnValueEnum(column, element.valueEnum);
  }
  if (element.tagOptions) {
    formatColumnTagsRender(column, element.tagOptions);
  }
  if (element.opearations) {
    column.hideInDescriptions = true;
    formatColumnOperationsButtons(
      column,
      element.opearations,
      props,
      autoTableActions,
      intlInstances,
    );
  }
  return column;
};

export const formatColumns = (
  columns?: ColumnDescriptor[],
  props?: AutoTableDescriptor,
  autoTableActions?: AutoTableActionType,
  intlInstances?: IntlInstancesType,
) => {
  const tableColumns:
    | ProColumns<ColumnItems>[]
    | ProDescriptionsItemProps<ColumnItems>[] = [];
  if (!columns) {
    tableColumns.push({
      dataIndex: 'key',
      title:
        intlInstances?.componentsIntl.getMessage(
          'prompts.emptyColumns',
          'Empty Columns',
        ) + '!',
    });
    return tableColumns;
  }
  let hasOperationColumn = false;
  // iterate each column descriptor element
  columns.forEach((element) => {
    tableColumns.push(
      formatColumn(element, props, autoTableActions, intlInstances),
    );
    if (element.valueType === 'option') {
      hasOperationColumn = true;
    }
  });
  if (
    !hasOperationColumn &&
    (props?.saveURL || props?.newURL || props?.deleteURL)
  ) {
    // auto add built in CRUD buttons
    const operations = generateBuiltInOperationColumn(props, intlInstances);
    // console.debug('builtin operations:', operations)
    tableColumns.push(
      formatColumn(
        {
          label: intlInstances?.componentsIntl.getMessage(
            'basic.operation',
            'Operation',
          ),
          name: 'option',
          valueType: 'option',
          hideInSearch: true,
          key: 'option',
          opearations: operations,
        },
        props,
        autoTableActions,
        intlInstances,
      ),
    );
  }

  console.debug('tableColumns:', tableColumns);
  return tableColumns;
};
