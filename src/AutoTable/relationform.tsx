import type { Key } from '@ant-design/pro-components';
import {
  Alert,
  Card,
  Checkbox,
  Col,
  message,
  Modal,
  Row,
  Tag,
  Tree,
} from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import type { SelectValue } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import DebounceSelect from '../DebounceSelect';
import { doUrlQuery, fetchData } from '../services/datafetch';
import { loopExtractObjectValues } from '../utils/objectvaluebykey';
import type { CommonArrayElementType, RelationFormProperties } from './typing';

const RelationForm = (props: RelationFormProperties) => {
  const [saveURL, setSaveURL] = useState(props.saveURL);
  const [selectedURL, setSelectedURL] = useState(
    props.selectedURL ? props.selectedURL : props.saveURL,
  );
  const [searchData, setSearchData] = useState<Record<string, any>>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.ReactText[]>([]);
  let titleFieldName: string = props.titleFieldName
    ? props.titleFieldName
    : 'title';
  let keyFieldName: string = props.keyFieldName ? props.keyFieldName : 'key';
  let childrenFieldName: string = props.childrenFieldName
    ? props.childrenFieldName
    : 'children';

  const onLoadData = async ({ key, children }: any) => {
    if (false) {
      console.debug('on tree load data', key, children);
    }
    // await loadSearchData();
  };

  const getLayoutMode = () => {
    return props.mode ? props.mode : 'checkbox';
  };

  const loadSearchData = async (searchText?: string) => {
    console.debug(
      'relation form load search data',
      props.searchURL,
      props.mode,
    );
    const layoutMode = getLayoutMode();
    let result: Record<string, any> = {};
    if (layoutMode === 'search') {
      result = await doUrlQuery(props.searchURL as string, 'GET', {
        name: searchText,
      });
    } else {
      result = await fetchData(
        props.searchURL,
        { current: 0, pageSize: 1000 },
        {},
        {},
      );
    }
    if (result && (result.success || result.code === 0)) {
      if (layoutMode === 'checkbox' || layoutMode === 'search') {
        const valueName = props.keyFieldName ? props.keyFieldName : 'key';
        const labelName = props.titleFieldName ? props.titleFieldName : 'title';
        const extractItems = loopExtractObjectValues(result.data, [
          valueName,
          labelName,
        ]);
        const items: Record<string, any>[] = [];
        extractItems.forEach((e: Record<string, string | number>) => {
          items.push({ value: e[valueName], label: e[labelName] });
        });
        console.debug('loaded checkbox options data', items);
        setSearchData(items);
        return items;
      } else {
        console.debug(`loaded ${layoutMode} options data`, result.data);
        setSearchData(result.data);
        return result.data;
      }
    }
    return [];
  };

  useEffect(() => {
    if (!props.open) {
      return;
    }
    titleFieldName = props.titleFieldName ? props.titleFieldName : 'title';
    keyFieldName = props.keyFieldName ? props.keyFieldName : 'key';
    childrenFieldName = props.childrenFieldName
      ? props.childrenFieldName
      : 'children';
    if (props.searchURL && getLayoutMode() !== 'search') {
      (async function () {
        await loadSearchData();
      })();
    }
    let saveurl = '';
    let selectedurl: string | CommonArrayElementType[] = '';
    if (props.saveURL) {
      saveurl = props.saveURL.replace('/:id/', `/${props.recordKey}/`);
      setSaveURL(saveurl);
    }
    if (props.selectedURL) {
      if (typeof props.selectedURL === 'string') {
        selectedurl = props.selectedURL.replace(
          '/:id/',
          `/${props.recordKey}/`,
        );
        setSelectedURL(selectedurl);
      } else {
        selectedurl = props.selectedURL;
        setSelectedURL(props.selectedURL);
      }
    } else if (saveurl) {
      selectedurl = saveurl;
      setSelectedURL(saveurl);
    }
    if (selectedurl) {
      (async function () {
        const result = await doUrlQuery(selectedurl, 'GET', {});
        console.debug(
          'loading selected data by selectedURL:',
          selectedURL,
          'result:',
          result,
        );
        if (result && result.success) {
          const keys: React.ReactText[] = [];
          const keyName = props.keyFieldName ? props.keyFieldName : 'key';
          result.data.forEach(
            (e: Record<string, string | number> | string | number) => {
              if (typeof e === 'object') {
                keys.push(e[keyName]);
              } else {
                keys.push(e);
              }
            },
          );
          setSelectedKeys(keys);
        }
      })();
    }
  }, [props.open]);

  const onCheckboxValueChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedKeys(checkedValues as React.ReactText[]);
  };

  const onTreeNodeSelect = (selectedKeys: Key[]) => {
    console.debug('tree selected:', selectedKeys);
    setSelectedKeys(selectedKeys);
  };
  const onTreeNodeChecked = (
    checked: Key[] | { checked: Key[]; halfChecked: Key[] },
  ) => {
    console.debug('tree checked:', checked);
    // setSelectedKeys(selectedKeys);
    const checkedKeys: Key[] = [];
    if (checked instanceof Array) {
      checked.forEach((v) => {
        checkedKeys.push(v);
      });
    } else {
      checked.checked.forEach((v) => {
        checkedKeys.push(v);
      });
      checked.halfChecked.forEach((v) => {
        checkedKeys.push(v);
      });
    }
    setSelectedKeys(checkedKeys);
  };

  const onSelectValueChange = (value: SelectValue | SelectValue[]) => {
    setSelectedKeys(value as React.ReactText[]);
  };

  const onCheckableTagChange = (value: string | number, checked: boolean) => {
    const nextSelectedKeys = checked
      ? [...selectedKeys, value]
      : selectedKeys.filter((t) => t !== value);
    console.debug('now selected group values:', nextSelectedKeys);
    setSelectedKeys(nextSelectedKeys);
  };

  const onClickOk = async () => {
    console.debug(
      'saving relation data to url:',
      saveURL,
      'with data:',
      selectedKeys,
    );
    if (saveURL) {
      const result = await doUrlQuery(saveURL, 'POST', selectedKeys);
      if (result && result.success) {
        if (props.onOk) {
          props.onOk();
          setSelectedKeys([]);
        }
      } else {
        //
      }
    } else {
      message.error(
        props.componentsIntl
          .getMessage(
            'prompts.propertyWereNotConfigured',
            '${property} were not configured!',
          )
          .replace('${property}', 'saveURL'),
      );
    }
  };

  const onClickCancel = () => {
    setSelectedKeys([]);
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const renderCardContent = (item: Record<string, any>) => {
    let subContent: React.ReactNode = '';
    if (item[childrenFieldName]) {
      const childrenItems: Record<string, any>[] = item[childrenFieldName];
      subContent = (
        <p>
          {childrenItems.map((subitem) => {
            if (subitem[childrenFieldName]) {
              // do not support deep leaf nodes till now
            }
            return (
              <Tag.CheckableTag
                key={subitem[keyFieldName]}
                checked={selectedKeys.indexOf(subitem[keyFieldName]) > -1}
                onChange={(checked: boolean) => {
                  onCheckableTagChange(subitem[keyFieldName], checked);
                }}
              >
                {subitem[titleFieldName]}
              </Tag.CheckableTag>
            );
          })}
        </p>
      );
    }
    return (
      <Card bordered={true}>
        <p>
          <Checkbox
            value={item[keyFieldName]}
            checked={selectedKeys.indexOf(item[keyFieldName]) > -1}
            onChange={(e) => {
              onCheckableTagChange(item[keyFieldName], e.target.checked);
            }}
          >
            {item[titleFieldName]}
          </Checkbox>
        </p>
        {subContent}
      </Card>
    );
  };

  const renderContent = (mode: string) => {
    switch (mode) {
      case 'checkbox':
        return (
          <Checkbox.Group
            style={{ width: '100%' }}
            defaultValue={selectedKeys}
            value={selectedKeys}
            onChange={onCheckboxValueChange}
          >
            <Row style={{ width: '100%' }} gutter={[8, 16]}>
              {searchData.map((ele: Record<string, any>) => {
                return (
                  <Col span={8} key={'checkbox-' + ele['value']}>
                    <Checkbox value={ele['value']}>{ele['label']}</Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
        );
        break;
      case 'tree':
        return (
          <Tree
            multiple={true}
            selectable={true}
            checkable
            defaultExpandAll={true}
            defaultExpandParent={true}
            autoExpandParent={true}
            loadData={onLoadData}
            treeData={searchData as any[]}
            selectedKeys={selectedKeys}
            checkedKeys={selectedKeys}
            fieldNames={{
              title: titleFieldName,
              key: keyFieldName,
              children: childrenFieldName,
            }}
            onSelect={onTreeNodeSelect}
            onCheck={onTreeNodeChecked}
          />
        );
        break;
      case 'group':
        return (
          <div className="site-card-wrapper">
            <Row style={{ width: '100%' }} gutter={[16, 16]}>
              {searchData.map((ele: Record<string, any>) => {
                return (
                  <Col span={12} key={'group-item-' + ele[keyFieldName]}>
                    {renderCardContent(ele)}
                  </Col>
                );
              })}
            </Row>
          </div>
        );
        break;
      case 'search':
        return (
          <DebounceSelect
            mode="multiple"
            fetchOptions={loadSearchData}
            value={selectedKeys}
            placeholder={props.componentsIntl.getMessage(
              'prompts.searchAndSelect',
              'Search and select',
            )}
            onChange={onSelectValueChange}
            style={{ width: '100%' }}
          />
        );
        break;
    }
    return (
      <Alert
        message={props.componentsIntl
          .getMessage(
            'prompts.unsupportedLayoutMode',
            'Unsupported layout mode ${mode}!',
          )
          .replace('${mode}', mode)}
        type="warning"
      />
    );
  };
  return (
    <Modal
      open={props.open}
      title={props.title}
      onOk={onClickOk}
      onCancel={onClickCancel}
      width={getLayoutMode() === 'search' ? 520 : 1000}
    >
      {renderContent(getLayoutMode())}
    </Modal>
  );
};

export default RelationForm;
