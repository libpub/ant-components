import type {
  ActionType,
  FormItemProps,
  IntlType,
  ProColumnsValueType,
  ProFormInstance,
  ProFormLayoutType,
} from '@ant-design/pro-components';
import type { ProFieldEmptyText } from '@ant-design/pro-field';
import type { ProFieldRequestData } from '@ant-design/pro-utils'
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import type { ColProps, RowProps } from 'antd';
import React from 'react';
import { BuiltinPageSchemaType } from '../BuiltinPage';

export type ColumnItems = Record<string, any>;

export type PaginationConfig = {
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: string[] | number[];
  disabled?: boolean;
};

export declare type ValueEnumType = {
  /** @name 键值 */
  value: string | number;
  /** @name 演示的文案 */
  text: React.ReactNode;
  /** @name 预定的颜色 */
  status?: string;
  /** @name 自定义的颜色 */
  color?: string;
  /** @name 是否禁用 */
  disabled?: boolean;
};

export declare type TagsOptionsType = {
  /** value key name */
  key: string;
  colorKey?: string;
};

export declare type HTTPQueryMethod =
  | 'GET'
  | 'get'
  | 'POST'
  | 'post'
  | 'PUT'
  | 'put'
  | 'DELETE'
  | 'delete'
  | 'HEAD'
  | 'head';
export declare type ColumnBuiltinOperationTypes =
  | 'inlineedit'
  | 'add'
  | 'update'
  | 'delete'
  | 'view'
  | 'relation'
  | 'schemaform';

export declare type RelationFormLayoutMode =
  | 'tree'
  | 'group'
  | 'checkbox'
  | 'search';

export declare type CommonArrayElementType =
  | string
  | number
  | Record<string, any>;

export type TreeDataNode =
  | Record<string, string | number>
  | {
      title?: string;
      key?: string;
      isLeaf?: boolean;
      children?: TreeDataNode[];
    };

export declare type OperationColumnType = {
  /** @name 演示的文案 */
  title: React.ReactNode;
  icon?: React.ReactNode;
  dange?: boolean;
  /** @name key menu item key */
  key?: string;
  /** @name 请求URL地址 */
  url?: string;
  httpMethod?: HTTPQueryMethod;
  /** @name action built-in actions */
  action?: ColumnBuiltinOperationTypes;
  /** @name menus 子按钮操作封装在下来菜单中 */
  menus?: OperationColumnType[];
  /** 弹出确认提醒消息 */
  popConfirmMessage?: string;
  primary?: boolean;
  searchURL?: string | TreeDataNode[];
  saveURL?: string;
  schemaURL?: string | BuiltinPageSchemaType;
  selectedURL?: string | CommonArrayElementType[];
  modalLayoutMode?: RelationFormLayoutMode;
  keyFieldName?: string;
  titleFieldName?: string;
  childrenFieldName?: string;
};

export type ColumnDescriptor = {
  /** field name */
  name: string;
  /** column title */
  label?: string;
  /** key name */
  key?: string;
  /** column description */
  description?: string;
  /** column value type */
  valueType?: ProColumnsValueType;
  /** @name valueEnum 枚举值列表 */
  valueEnum?: ValueEnumType[];
  /** @name tagOptions 标签配置项 */
  tagOptions?: TagsOptionsType;
  /**
   * 每个表单占据的格子大小
   *
   * @param 总宽度 = span* colSize
   * @param 默认为 1
   */
  colSize?: number;
  /** @name 是否缩略 */
  ellipsis?: boolean;
  /** @name 是否拷贝 */
  copyable?: boolean;
  /** @name 只读 */
  readonly?: boolean;

  /** 在查询表单中隐藏 */
  search?: boolean;
  /** @name 在 Table 中不展示此列 */
  hideInTable?: boolean;
  /** @name 在查询表单中不展示此项 */
  hideInSearch?: boolean;
  /** @name 在 Form 中不展示此列 */
  hideInForm?: boolean;
  /** @name 不在配置工具中显示 */
  hideInSetting?: boolean;
  /** @name 在 Descriptions 中不展示此列 */
  hideInDescriptions?: boolean;
  /** @name 表头的筛选菜单项 */
  filters?: boolean; // | ColumnFilterItem[];
  // /** @name 筛选的函数，设置为 false 会关闭自带的本地筛选 */
  // onFilter?: boolean | ColumnType<T>['onFilter'];
  /** @name Form 的排序 */
  formItemOrder?: number;
  /** @name 可编辑表格是否可编辑 */
  editable?: boolean;
  /** Image width */
  width?: number;
  /** @name sortable */
  sortable?: boolean;
  /** button operations */
  operations?: OperationColumnType[];
  /** @name disable 列设置中复选框disabled的状态 */
  disable?: boolean;
  /** @name 用户表单时的初始值 */
  initialValue?: React.ReactNode;
  formItemProps?: FormItemProps;
  /** @name 从服务器请求枚举(URI) */
  request?: string;
  /** @name request防抖动时间 默认10 单位ms */
  debounceTime?: number;
  /** @name 从服务器请求的参数，改变了会触发 reload */
  params?: Record<string, any>;
  /** @name 依赖字段的name，暂时只在拥有 request 的项目中生效，会自动注入到 params 中 */
  dependencies?: NamePath[];
  showSearch?: boolean;
  /** select type async options label field and value field */
  asyncSelectOptionLabelField?: string;
  asyncSelectOptionValueField?: string;
  /** columns description for formList and formSet */
  columns?: ColumnDescriptor[];
  /** @name grid boolean */
  grid?: boolean;
  /**
   * only works when grid is enabled
   *
   * When passing the `span` attribute, the default value is empty
   * @default
   * { xs: 24 }
   */
  colProps?: ColProps;
  /**
   * only works when grid is enabled
   * @default
   * { gutter: 8 }
   */
  rowProps?: RowProps;
};

export type AutoTableDescriptor = {
  title?: string;
  columns?: ColumnDescriptor[];
  /** @name rowKey table row key */
  rowKey?: string;
  /** @name fetchDataURL auto fetch table data url address */
  fetchDataURL?: string;
  /** @name staticData Only display static data items when fetchDataURL not configured */
  staticData?: ColumnItems[];
  /** @name columnEmptyText 空值时显示 */
  columnEmptyText?: ProFieldEmptyText;
  /** @name manualRequest 是否手动触发请求 */
  manualRequest?: boolean;
  /** @name pagination configuration */
  pagination?: PaginationConfig;
  /** @name 是否允许编辑行 */
  editable?: boolean;
  /** @name saveFormMode 表单打开模式 ModalForm|DrawerForm */
  saveFormMode?: ProFormLayoutType;
  /** @name saveURL edited record syncronize to backend URL */
  saveURL?: string;
  saveURLMethod?: HTTPQueryMethod;
  /** @name newURL new record syncronize to backend URL */
  newURL?: string;
  newURLMethod?: HTTPQueryMethod;
  /** @name deleteURL delete record syncronize to backend URL */
  deleteURL?: string;
  deleteURLMethod?: HTTPQueryMethod;
  /** @name viewURL delete record syncronize to backend URL */
  viewURL?: string;
  viewURLMethod?: string;
  /** @name cardBordered 查询表单和 Table 的卡片 border 配置 */
  cardBordered?: boolean;
  /** @name debounceTime 去抖时间 */
  debounceTime?: number;
  /**
   * 只在request 存在的时候生效，可编辑表格也不会生效
   *
   * @default true
   * @name 窗口聚焦时自动重新请求
   */
  revalidateOnFocus?: boolean;
  /** 默认的表格大小 */
  defaultSize?: SizeType;
  /** @name toolbar buttons */
  toolbar?: OperationColumnType[];
  modalWidth?: string | number;
  /**
   * only works when grid is enabled
   *
   * When passing the `span` attribute, the default value is empty
   * @default
   * { xs: 24 }
   */
  colProps?: ColProps;
  /**
   * only works when grid is enabled
   * @default
   * { gutter: 8 }
   */
  rowProps?: RowProps;
};

export type ListQueryResult = {
  /** result code, success if 0, fails if others */
  code?: number;
  /** true if query result is success, only one of code or success were returned, parameter code have more higher priority */
  success?: boolean;
  /** result human readable message */
  message?: string;
  /** list rows */
  data?: Array<any>;
  /** total result count */
  total?: number;
  /** Current page number */
  page?: number;
  /** Page size to be returned */
  pagesize?: number;
};

export type GeneralQueryResult<T = any> = {
  /** result code, success if 0, fails if others */
  code?: number;
  /** true if query result is success, only one of code or success were returned, parameter code have more higher priority */
  success?: boolean;
  /** result human readable message */
  message?: string;
  /** result data */
  data?: T;
};

export type AutoTableActionType = {
  /** open new table record form */
  startNewForm: (recordKey?: React.Key) => boolean;
  cancelNewForm: (
    recordKey: React.Key,
    needReTry?: boolean | undefined,
  ) => Promise<true | undefined>;
  startEditForm: (recordKey: React.Key, record: ColumnItems) => boolean;
  cancelEditForm: (
    recordKey: React.Key,
    needReTry?: boolean | undefined,
  ) => Promise<true | undefined>;
  // saveEditable: (recordKey: RecordKey, needReTry?: boolean | undefined) => Promise<boolean>;
  startViewModal: (
    recordKey: React.Key,
    record: ColumnItems,
  ) => Promise<boolean | undefined>;
  cancelViewModal: (recordKey: React.Key) => boolean;
  startRelationModal: (
    recordKey: React.Key,
    record: ColumnItems,
    props?: OperationColumnType,
  ) => Promise<boolean | undefined>;
  cancelRelationModal: (recordKey: React.Key) => boolean;
  startSchemaFormModal: (
    recordKey: React.Key,
    record: ColumnItems,
    props?: OperationColumnType,
  ) => Promise<boolean | undefined>;
  cancelSchemaFormModal: (recordKey: React.Key) => boolean;
};

export type AutoTableEditFormStateType = {
  editMode: 'add' | 'update' | 'relation' | 'schemaform' | undefined;
  recordKey?: React.Key;
  saveURL?: string;
  httpMethod?: string;
};

export type IntlInstancesType = {
  antIntl: IntlType;
  componentsIntl: IntlType;
};

export type AutoTableToolbarParamsOptionsType = {
  rowKey: string;
  actionRef: React.MutableRefObject<ActionType | undefined>;
  autoTableActions: AutoTableActionType;
  antIntl: IntlType;
  componentsIntl: IntlType;
  setEditFormVisible: (value: React.SetStateAction<boolean>) => void;
  setEditFormState: (
    value: React.SetStateAction<AutoTableEditFormStateType>,
  ) => void;
  setViewModalVisible: (value: React.SetStateAction<boolean>) => void;
  setViewModalItemData: (value: React.SetStateAction<ColumnItems>) => void;
  formRef: React.MutableRefObject<ProFormInstance<ColumnItems> | undefined>;
};

export type RelationFormProperties = {
  recordKey?: string | number;
  open?: boolean;
  title?: React.ReactNode;
  mode?: RelationFormLayoutMode;
  componentsIntl: IntlType;
  searchURL?: string | TreeDataNode[];
  saveURL?: string;
  selectedURL?: string | CommonArrayElementType[];
  keyFieldName?: string;
  titleFieldName?: string;
  childrenFieldName?: string;
  onOk?: () => void;
  onCancel?: () => void;
};
