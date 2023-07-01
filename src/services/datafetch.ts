import { message } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import React from 'react';
import request from 'umi-request';

import type {
  ColumnItems,
  GeneralQueryResult,
  ListQueryResult,
} from '../AutoTable/typing';
import type { BuiltinPageSchemaType } from '../BuiltinPage/typing';

export type AntPaginationParams = {
  current?: number;
  pageSize?: number;
};
export type AntListResult = {
  data?: any[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export type AntGeneralResult<T = any> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const fetchData = async (
  urlOrData: string | ColumnItems[] | any,
  params: AntPaginationParams = {},
  sort: Record<string, SortOrder>,
  filter: Record<string, string[] | number[] | React.ReactText[] | null>,
  options?: { [key: string]: any },
) => {
  console.debug(
    'urlOrData:',
    urlOrData,
    'params:',
    params,
    'sort:',
    sort,
    'filter:',
    filter,
  );
  if (!urlOrData) {
    return undefined;
  }
  if (typeof urlOrData === 'string') {
    const resp = await request<ListQueryResult>(urlOrData, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        page: params.current,
        pageSize: params.pageSize,
        filter: filter,
        sorts: sort,
      },
      ...(options || {}),
    });
    const result: AntListResult = {
      data: [],
      success: false,
      // total: 0,
    };
    if (resp) {
      if (resp.code === 0 || (resp.code === undefined && resp.success)) {
        result.data = resp.data;
        result.success = true;
        result.total = resp.total;
      } else {
        message.error(resp.message);
      }
    } else {
      message.error(`Query ${urlOrData} got empty response!`);
    }
    return result;
  } else if (typeof urlOrData === 'function') {
    const result = urlOrData(params, sort, filter, options);
    if (result instanceof Promise) {
      const res = await result;
      return res;
    }
    return result;
  }
  const result: AntListResult = {
    data: urlOrData,
    success: true,
    total: urlOrData.length,
  };
  return result;
};

const doUrlQuery = async <T = any>(
  url: string | React.ReactText[] | Record<string, any>[] | Record<string, any>,
  method: string | undefined,
  record: ColumnItems | ColumnItems[],
  rowKey?: string,
) => {
  const result: AntGeneralResult<T> = {
    success: false,
  };
  if (!url) {
    return result;
  }
  if (typeof url === 'object') {
    result.success = true;
    result.data = url as any;
    return result;
  }
  const httpMethod = method ? method.toUpperCase() : 'GET';
  let queryURL = url;
  let params: Record<string, any> | Record<string, any>[] | undefined = {};
  const isAllFields = httpMethod === 'POST' || httpMethod === 'PUT';
  if (record) {
    if (record instanceof Array) {
      params = record;
    } else {
      if (!isAllFields && rowKey && record && record[rowKey]) {
        if (queryURL.match(/(?<=\/)(:id)(?<=\b|\/)/)) {
          queryURL = queryURL.replace(/(?<=\/)(:id)(?<=\b|\/)/, record[rowKey]);
        } else {
          params[rowKey] = record[rowKey];
        }
      } else {
        for (const k in record) {
          if (record.hasOwnProperty(k)) {
            params[k] = record[k];
          }
        }
      }
    }
  }

  let resp: GeneralQueryResult<T>;
  try {
    resp = await request<GeneralQueryResult<T>>(queryURL, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      params:
        httpMethod === 'POST' || httpMethod === 'PUT' ? undefined : params,
      data: httpMethod === 'POST' || httpMethod === 'PUT' ? params : undefined,
    });
  } catch (e) {
    console.error(`query ${queryURL} failed with error`, e);
    resp = {
      code: 500,
      message: String(e),
    };
  }

  if (resp) {
    result.message = resp.message;
    if (resp.code === 0 || (resp.code === undefined && resp.success)) {
      result.success = true;
      result.data = resp.data;
      return result;
    } else {
      // consider exception result format
      if (resp.code === undefined && resp.success === undefined) {
        const normalizedResp: Record<string, any> = resp;
        if (normalizedResp.results) {
          result.success = true;
          result.data = normalizedResp.results;
          return result;
        }
      }
      message.error(resp.message);
    }
  } else {
    result.message = `Query ${queryURL} got empty response!`;
    message.error(result.message);
  }
  return result;
};

const fetchSchemaData = async (
  url: string | BuiltinPageSchemaType,
  method?: string,
  params?: Record<string, any>,
) => {
  const result: AntGeneralResult<BuiltinPageSchemaType> = {
    success: false,
  };
  if (!url) {
    return result;
  }
  if (typeof url === 'object') {
    result.success = true;
    result.data = url;
    return result;
  }
  const httpMethod = method ? method.toUpperCase() : 'GET';
  let resp: GeneralQueryResult<BuiltinPageSchemaType>;
  try {
    resp = await request<GeneralQueryResult<BuiltinPageSchemaType>>(url, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      params:
        httpMethod === 'POST' || httpMethod === 'PUT' ? undefined : params,
      data: httpMethod === 'POST' || httpMethod === 'PUT' ? params : undefined,
    });
  } catch (e) {
    console.error(`query ${url} failed with error`, e);
    resp = {
      code: 500,
      message: String(e),
    };
  }
  if (resp) {
    result.message = resp.message;
    if (resp.code === 0 || (resp.code === undefined && resp.success)) {
      result.success = true;
      result.data = resp.data;
      return resp;
    } else {
      console.error(`Query ${url} response`, resp);
      if (resp.message) {
        message.error(resp.message);
      } else if (resp instanceof String) {
        // todo
      }
    }
  } else {
    result.message = `Query ${url} got empty response!`;
    message.error(result.message);
  }
  return result;
};

export { fetchData, doUrlQuery, fetchSchemaData };
