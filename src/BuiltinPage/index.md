---
title: BuiltinPage
---

# BuiltinPage

## 何时使用

当你希望通过远端服务配置一些页面的 Schema 控制自动展现内置页面，如自动生成 Table 展示，并且有一些表格数据展示是基于内置的一些 CRUD 的操作，可以以一种通用的 RESTful 风格的数据操作 API 进行与服务端进行交互，或者需要多种单元格样式时，BuiltinPage 是不错的选择。

## 代码演示

### 异步加载 Schema 表格

<code src="./demos/asyncschema.tsx" background="#f5f5f5" height="610px" description="异步加载 Schema 表格示例通过配置schemaURL 异步加载table的descriptor，自动生成新增、查询、编辑、删除按钮及响应的操作">异步加载 Schema 表格</code>

### 根据当前路由的 pathname 加载页面 Schema 生成内置页面

<code src="./demos/loadbypathname.tsx" background="#f5f5f5" height="610px" description="根据当前路由的 pathname 加载页面 Schema 生成内置页面">内置异步获取 pathname Schema</code>
