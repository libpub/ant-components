import * as allIcons from '@ant-design/icons';
import { lazy } from 'react';
import { Outlet } from 'react-router';
import type { DynamicRoutes } from './typing';

export function formatRoutePath(path: string) {
  const words = path.replace(/^\//, '').split(/(?<=\w+)\//); // 提取路径单词
  return `/${words
    .map((word: string) =>
      word ? word.toLowerCase().replace(word[0], word[0].toUpperCase()) : word,
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

function formatIcon(name: string, iconType = 'Outlined') {
  return name
    .replace(name[0], name[0].toUpperCase())
    .replace(/-(w)/g, function (all, letter) {
      return letter.toUpperCase() + iconType;
    });
}

export function parseRoutes(
  routesRaw: Map<number | string, DynamicRoutes.RouteRaw>,
  beginIdx: number,
): DynamicRoutes.ParseRoutesReturnType {
  const routes: DynamicRoutes.ParsedRoutes = {}; // 转换后的路由信息
  const routeComponents: DynamicRoutes.ParsedRouteComponent = {}; // 生成的React.lazy组件
  const routeParentMap = new Map<string, number>(); // menuId 与路由记录在 routes 中的键 的映射。如：'role_management' -> 7

  let currentIdx = beginIdx; // 当前处理的路由项的键。把 patchRoutes 传进来的 routes 看作一个数组，这里就是元素的下标。

  Object.keys(routesRaw).forEach((key) => {
    //@ts-ignore
    const route = routesRaw[key];
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
      curComponent = lazy(
        () => import(''.concat('@lycium/ant-components/dist/BuiltinPage')),
      );
    } else {
      curComponent = lazy(() => import(`@/pages/${componentPath}`));
    }
    if (route.icon && typeof route.icon === 'string') {
      const upperIcon = formatIcon(route.icon);
      if (upperIcon in allIcons || route.icon in allIcons) {
        // @ts-ignore
        curRoute.icon = React.createElement(
          allIcons[upperIcon] || allIcons[icon],
        );
      }
    } else {
      curRoute.icon = route.icon;
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
    currentIdx,
  };
}
// @ts-ignore
// export function patchRoutes({ routes, routeComponents }) {
//   if (window.dynamicRoutes) {
//     // 存在 & 成功获取动态路由数据
//     const currentRouteIndex = Object.keys(routes).length; // 获取已在.umirc.ts 中配置的路由数目
//     const parsedRoutes = parseRoutes(window.dynamicRoutes, currentRouteIndex);
//   }
// }

// @ts-ignore
export function patchRoutes({ routes, routeComponents }) {
  const currentRouteIndex = 0; // Object.keys(routes).length;
  const parsedRoutes = parseRoutes(routes, currentRouteIndex);

  Object.assign(routes, parsedRoutes.routes);
  Object.assign(routeComponents, parsedRoutes.routeComponents);
  return { routes, routeComponents };
  // Object.keys(routes).forEach(key => {
  //   const { icon } = routes[key];
  //   if (icon && typeof icon === 'string') {
  //     const upperIcon = formatIcon(icon);
  //     if (upperIcon in allIcons || icon in allIcons) {
  //       // @ts-ignore
  //       routes[key].icon = React.createElement(allIcons[upperIcon] || allIcons[icon]);
  //     }
  //     if (routes[key].children) {
  //       patchRoutes({routes: routes[key].children, routeComponents});
  //     }
  //   }
  // });
}

// export function patchRoutes({ routes }) {
//   console.debug('patch routes', routes);

// }
