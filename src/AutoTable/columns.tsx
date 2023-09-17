import { DeleteOutlined, EyeOutlined, FormOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
  ProFieldValueEnumType,
  ProFormColumnsType,
  ProSchemaValueEnumType,
  RequestOptionsType,
  TableDropdown,
} from '@ant-design/pro-components';
import type { DropdownProps } from '@ant-design/pro-table/es/components/Dropdown';
import { Button, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React from 'react';
import { doUrlQuery } from '../services/datafetch';
import Icon from '../utils/icons';
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
import type { Rule } from 'antd/lib/form';

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
      icon: <EyeOutlined />,
    });
  }
  if (props.saveURL) {
    operations.push({
      title: intlInstances?.componentsIntl.getMessage('basic.edit', 'Edit'),
      action: 'update',
      icon: <FormOutlined />,
    });
  }
  if (props.deleteURL) {
    operations.push({
      title: intlInstances?.antIntl.getMessage(
        'editableTable.action.delete',
        'Delete',
      ),
      action: 'delete',
      icon: <DeleteOutlined />,
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
  operationProps?: OperationColumnType,
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
          action?.reload();
          return true;
        }
      }
      break;
    case 'relation':
      autoTableActions?.startRelationModal?.(
        record[rowKey],
        record,
        operationProps,
      );
      break;
    case 'schemaform':
      autoTableActions?.startSchemaFormModal?.(
        record[rowKey],
        record,
        operationProps,
      );
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

const renderIconText = (icon: React.ReactNode, title: React.ReactNode) => {
  if (typeof icon === 'string') {
    return <Tooltip title={title}>{Icon({ icon })}</Tooltip>;
  }
  return (
    <Tooltip title={title}>
      <Button icon={icon} size="small" type="link"></Button>
    </Tooltip>
  );
};

const renderIconElement = (icon: React.ReactNode) => {
  if (typeof icon === 'string') {
    return Icon({ icon });
  }
  return icon;
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
                  operation,
                  autoTableActions,
                  intlInstances,
                );
              }}
            >
              {operation.icon ? (
                renderIconText(operation.icon, operation.title)
              ) : (
                <a>{operation.title}</a>
              )}
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
                  operation,
                  autoTableActions,
                  intlInstances,
                );
              }}
            >
              {operation.icon
                ? renderIconText(operation.icon, operation.title)
                : operation.title}
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
            icon: e.icon ? renderIconElement(e.icon) : undefined,
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

const convertRulesFromJson = (jsonRules: Rule[]): Rule[] => {
  const rules: Rule[] = jsonRules.map((rule: {[key: string]: any}) => {
    if (rule.required && (typeof rule.required !== 'boolean' && 'depends' in rule.required)) {
      return {
        required: (getFieldValue: CallableFunction) => {
          const fieldValue = getFieldValue(rule.required.depends[0].field);
          return fieldValue === rule.required.depends[0].value;
        },
        message: rule.required.message,
      };
    }
    return rule;
  });

  return rules;
}

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
  if (element.formItemProps && element.formItemProps.rules) {
    element.formItemProps.rules = convertRulesFromJson(element.formItemProps.rules);
    // console.debug('field:', element.name, 'formItemProps:', element.formItemProps);
  }
  if (element.request) {
    const url = element.request;
    if (element.showSearch) {
      column.showSearch = true;
    }
    column.request = async () => {
      // const params = {};
      const resp = await doUrlQuery(url, 'GET', {})
      if (resp && resp.data) {
        const optionsArray: RequestOptionsType[] = [];
        resp.data.forEach((ele: Record<string, any>) => {
          optionsArray.push({
            label: ele[element.asyncSelectOptionLabelField?element.asyncSelectOptionLabelField:'name'],
            value: ele[element.asyncSelectOptionValueField?element.asyncSelectOptionValueField:'id']
          });
        })
        return optionsArray;
      }
      return [];
    };
  }
  if (element.debounceTime) {
    column.debounceTime = element.debounceTime;
  }
  if (element.params) {
    column.params = element.params;
  }
  if (element.dependencies) {
    column.dependencies = element.dependencies;
  }
  formatColumnValueType(column, element);
  if (element.valueEnum) {
    formatColumnValueEnum(column, element.valueEnum);
  }
  if (element.tagOptions) {
    formatColumnTagsRender(column, element.tagOptions);
  }
  if (element.operations) {
    column.hideInDescriptions = true;
    formatColumnOperationsButtons(
      column,
      element.operations,
      props,
      autoTableActions,
      intlInstances,
    );
  }
  if (element.columns) {
    column.columns = formatColumns(element.columns, props, autoTableActions, intlInstances);
  }
  if (element.grid !== undefined) column.grid = element.grid;
  if (element.rowProps) column.rowProps = element.rowProps;
  if (element.colProps) column.colProps = element.colProps;
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
    | ProDescriptionsItemProps<ColumnItems>[]
    | ProFormColumnsType<ColumnItems> = [];
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
            'basic.action',
            'Action',
          ),
          name: 'option',
          valueType: 'option',
          hideInSearch: true,
          key: 'option',
          operations: operations,
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
