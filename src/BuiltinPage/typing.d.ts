import { AutoTableDescriptor } from '../AutoTable/typing';

export type PageType =
  | 'autotable'
  | 'list'
  | 'description'
  | 'dashboard'
  | 'none';

export type SchemaType = AutoTableDescriptor;

export type BuiltinPageSchemaType = {
  pageType: PageType;
  schema: SchemaType;
};

export type BuiltinPagePropsType = {
  /** Fetch schema from remote server when giving empty column descriptions */
  schemaURL?: string | BuiltinPageSchemaType;
};
