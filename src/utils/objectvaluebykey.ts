export type ExtractingKeyPath = string | string[];
export type ObjectExtractingCombinationKey = {
  sep: string;
  keys: ExtractingKeyPath[];
};
export type ObjectExtractingKey =
  | ExtractingKeyPath
  | ObjectExtractingCombinationKey;

export const extractKeyName = (key: string) => {
  let extractedKey: ObjectExtractingKey = key.trim();
  if (key.includes('+')) {
    const subKeys = key.split('+');
    const combinationKey: ObjectExtractingCombinationKey = {
      sep: ' ',
      keys: [],
    };
    subKeys.forEach((k) => {
      combinationKey.keys.push(extractKeyName(k) as ExtractingKeyPath);
    });
    extractedKey = combinationKey;
  } else if (key.includes('.')) {
    const subKeys = key.split('.');
    const keyPath: string[] = [];
    subKeys.forEach((k) => {
      keyPath.push(k.trim());
    });
    extractedKey = keyPath;
  }
  return extractedKey;
};

export const extractObjectValueByKey = (
  item: Record<string, any>,
  key: ObjectExtractingKey,
) => {
  let result: any = '';
  if (typeof key === 'string') {
    result = item[key];
  } else {
    if (key instanceof Array) {
      let subitem = item;
      key.forEach((subkey) => {
        if (typeof subitem === 'object') {
          subitem = subitem[subkey];
        }
      });
      result = subitem;
    } else {
      const values: string[] = [];
      key.keys.forEach((subkey) => {
        values.push(extractObjectValueByKey(item, subkey).toString());
      });
      result = values.join(key.sep);
    }
  }
  return result;
};

export const loopExtractObjectValues = (
  items: Record<string, any>[],
  keys: string[],
) => {
  const extractKeys: ObjectExtractingKey[] = [];
  const result: Record<string, any>[] = [];
  keys.forEach((key) => {
    extractKeys.push(extractKeyName(key));
  });
  items.forEach((value) => {
    const item: Record<string, any> = {};
    keys.forEach((key, index) => {
      item[key] = extractObjectValueByKey(value, extractKeys[index]);
    });
    result.push(item);
  });
  return result;
};
