import { Outlet } from '@umijs/max';
import { lazy } from 'react';
import type { DynamicRoutes } from './typing';

export function formatRoutePath(path: string) {
  const words = path.replace(/^\//, '').split(/(?<=\w+)\//); // 提取路径单词
  return `/${words
    .map((word: string) =>
      word.toLowerCase().replace(word[0], word[0].toUpperCase()),
    )
    .join('/')}`;
}

export function generateRoutePath(path: string) {
  return path.toLowerCase();
}

export function generateComponentPath(path: string) {
  const words = path.replace(/^\//, '').split(/(?<=\w+)\//); // 提取路径单词
  return `${words.join('/pages/')}/index`;
}

export function generateFilePath(path: string) {
  const words = path.replace(/^\//, '').split(/(?<=\w+)\//);
  return `@/pages/${words.join('/pages/')}/index.tsx`;
}

export function parseRoutes(
  routesRaw: DynamicRoutes.RouteRaw[],
  beginIdx: number,
): DynamicRoutes.ParseRoutesReturnType {
  const routes: DynamicRoutes.ParsedRoutes = {}; // 转换后的路由信息
  const routeComponents: DynamicRoutes.ParsedRouteComponent = {}; // 生成的React.lazy组件
  const routeParentMap = new Map<string, number>(); // menuId 与路由记录在 routes 中的键 的映射。如：'role_management' -> 7

  let currentIdx = beginIdx; // 当前处理的路由项的键。把 patchRoutes 传进来的 routes 看作一个数组，这里就是元素的下标。

  routesRaw.forEach((route) => {
    const formattedRoutePath = formatRoutePath(route.path); // 将服务器返回的路由路径中的单词转换为首字母大写其余小写
    const routePath = generateRoutePath(formattedRoutePath); // 全小写的路由路径
    const componentPath = generateComponentPath(formattedRoutePath); // 组件路径 不含 @/pages/
    const filePath = generateFilePath(formattedRoutePath); // 路由信息中的组件文件路径

    let effectiveRoute = true; // 当前处理中的路由是否有效
    // 生成路由信息
    let curRoute: DynamicRoutes.Route = {
      id: currentIdx.toString(),
      parentId: 'ant-design-pro-layout',
      name: route.name,
      path: routePath,
    };
    let curComponent:
      | React.LazyExoticComponent<React.ComponentType<any>>
      | typeof Outlet
      | undefined = undefined;
    if (route.microApp) {
      curRoute.microApp = route.microApp;
      curRoute.microAppProps = {
        autoSetLoading: true,
      };
    } else if (route.autoPage) {
      curComponent = lazy(() => import('@lycium/ant-components/BuiltinPage'));
    } else {
      curComponent = lazy(() => import(`@/pages/${componentPath}`));
    }

    // 是否为直接显示（不含子路由）的路由记录，如：/home; /Dashboard
    if (route.direct) {
      // 生成路由信息
      if (!route.microApp) {
        curRoute.file = filePath;
      }
    } else {
      // 判断是否非一级路由
      if (!route.parentId) {
        // 正在处理的项为一级路由
        // 一级路由没有它自己的页面，这里生成一个Outlet用于显示子路由页面
        curComponent = Outlet;

        // 记录菜单ID与当前项下标的映射
        routeParentMap.set(route.id.toString(), currentIdx);
      } else {
        // 非一级路由
        // 获取父级路由ID
        const realParentId = routeParentMap.get(route.parentId);

        if (realParentId) {
          curRoute.parentId = realParentId.toString();
          if (!route.microApp) {
            curRoute.file = filePath;
          }
        } else {
          // 找不到父级路由，路由无效，workingIdx不自增
          effectiveRoute = false;
        }
      }
    }

    if (effectiveRoute) {
      // 存储路由信息
      routes[currentIdx] = curRoute;
      // 存储组件
      if (curComponent) {
        routeComponents[currentIdx] = curComponent;
      }

      // 当路由有效时，将workingIdx加1
      currentIdx += 1;
    }
  });

  return {
    routes,
    routeComponents,
  };
}
