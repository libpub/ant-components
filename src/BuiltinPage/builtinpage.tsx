import { Alert, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { AutoTable } from '../AutoTable';
import { AutoTableDescriptor } from '../AutoTable/typing';
import { useComponentsIntl } from '../locales';
import { fetchSchemaData } from '../services/datafetch';
import ServiceUtils from '../utils/serviceutils';
import type {
  BuiltinPagePropsType,
  BuiltinPageSchemaType,
  PageType,
  SchemaType,
} from './typing';

const BuiltinPage = (props: BuiltinPagePropsType) => {
  const { schemaURL } = props;
  // const { initialState, setInitialState } = useModel('@@initialState');
  const [isLoading, setLoading] = useState<boolean>(true);
  const [builtinPageType, setBuiltinPageType] = useState<PageType>('none');
  const [builtinPageSchema, setBuiltinPageSchema] = useState<SchemaType>({});
  const [autoTableDescriptors, setAutoTableDescriptors] =
    useState<AutoTableDescriptor>({});
  // const [builtinPageKey, setBuiltinPageKey] = useState('');
  const componentsIntl = useComponentsIntl();
  const location = useLocation();

  useEffect(() => {
    let fetchSchemaURL: string | BuiltinPageSchemaType | undefined = schemaURL;
    let fetchSchemaParams: Record<string, any> | undefined = undefined;
    if (!schemaURL) {
      // if no schemaURL configured, try load schema descriptor using default address on same host with website
      fetchSchemaURL =
        ServiceUtils.instance().getBaseURI() + '/api/pages/descriptors';
      console.debug(
        `fetching schema data from ${fetchSchemaURL} by '${location.pathname}'`,
      );
      fetchSchemaParams = {
        pathname: location.pathname,
      };
    }
    if (fetchSchemaURL) {
      setLoading(true);
      (async function () {
        // console.debug(' -----------------------> ', props);
        const schemaResult = await fetchSchemaData(
          fetchSchemaURL,
          'GET',
          fetchSchemaParams,
        );
        console.debug(
          `current ${location.pathname} page schema result:`,
          schemaResult,
        );
        if (schemaResult && schemaResult.data) {
          const data = schemaResult.data;
          if (data.pageType) {
            setBuiltinPageType(data.pageType);
          }
          if (data.schema) {
            setBuiltinPageSchema({ ...data.schema });
            if (data.pageType === 'autotable') {
              console.debug('update autotable descriptor');
              setAutoTableDescriptors({ ...data.schema });
              // setBuiltinPageKey(data.pageType + '-' + Math.random().toString(36).slice(-8));
            }
          }
        } else if (
          schemaResult &&
          !schemaResult.success &&
          location.pathname === '/components/builtinpage'
        ) {
          setBuiltinPageType('autotable');
          setBuiltinPageSchema({});
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [schemaURL, location.pathname]);

  const renderBuiltinPage = () => {
    let errMessage = '';
    switch (builtinPageType) {
      case 'autotable':
        if (builtinPageSchema.columns) {
          return (
            <AutoTable
              // key={builtinPageKey}
              {...autoTableDescriptors}
            />
          );
        } else {
          errMessage = componentsIntl
            .getMessage(
              'prompts.builtInPageDoesNotHaveProperty',
              '${component} builtin page does not have ${property} property',
            )
            .replace('${component}', 'AutoTable')
            .replace('${property}', 'columns');
        }
        break;
      case 'list':
        break;
      case 'description':
        break;
      case 'dashboard':
        break;
    }
    if (errMessage) {
      return <Alert message={errMessage} type="error" />;
    }
    return (
      <Alert
        message={`page type: ${builtinPageType} not recognizable`}
        type="error"
      />
    );
  };

  return <>{isLoading ? <Skeleton /> : renderBuiltinPage()}</>;
};

export default BuiltinPage;
