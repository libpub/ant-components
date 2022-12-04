import { Alert, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';

import { AutoTable } from '../AutoTable';
import { AutoTableDescriptor } from '../AutoTable/typing';
import { useComponentsIntl } from '../locales';
import { fetchSchemaData } from '../services/datafetch';
import type { BuiltinPagePropsType, PageType, SchemaType } from './typing';

const BuiltinPage = (props: BuiltinPagePropsType) => {
  const { schemaURL } = props;
  const [isLoading, setLoading] = useState<boolean>(true);
  const [builtinPageType, setBuiltinPageType] = useState<PageType>('none');
  const [builtinPageSchema, setBuiltinPageSchema] = useState<SchemaType>({});
  const [autoTableDescriptors, setAutoTableDescriptors] =
    useState<AutoTableDescriptor>({});
  // const [builtinPageKey, setBuiltinPageKey] = useState('');
  const componentsIntl = useComponentsIntl();

  useEffect(() => {
    if (schemaURL) {
      setLoading(true);
      (async function () {
        console.debug(' -----------------------> ', props);
        const schemaResult = await fetchSchemaData(schemaURL);
        if (schemaResult && schemaResult.success && schemaResult.data) {
          const data = schemaResult.data;
          setBuiltinPageType(data.pageType);
          if (data.schema) {
            setBuiltinPageSchema({ ...data.schema });
            console.debug('schema result:', schemaResult);
            if (data.pageType === 'autotable') {
              console.debug('update autotable descriptor');
              setAutoTableDescriptors({ ...data.schema });
              // setBuiltinPageKey(data.pageType + '-' + Math.random().toString(36).slice(-8));
            }
          }
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [schemaURL]);

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
