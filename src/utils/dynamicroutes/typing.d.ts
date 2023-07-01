import type { Outlet } from '@umijs/max';
import type { ComponentType, LazyExoticComponent } from 'react';

declare namespace DynamicRoutes {
  type MicroAppProps = {
    autoSetLoading?: boolean;
    loader?: (loading) => React.ReactNode;
    autoCaptureError?: boolean;
    errorBoundary?: (error: any) => React.ReactNode;
    className?: string;
    wrapperClassName?: string;
  };

  // 后端返回的路由数据为 RouteRaw[]
  interface RouteRaw {
    id: string | number;
    parentId: string;
    enable: boolean;
    name: string;
    sort: number;
    path: string;
    icon?: React.ReactNode;
    microApp?: string;
    autoPage?: string;
    autoPageSchema?: string;
    direct: boolean;
    createdAt: string;
  }

  // 前端根据后端返回数据生成的路由数据
  interface Route {
    id: string;
    parentId: 'ant-design-pro-layout' | string;
    name: string;
    path: string;
    icon?: React.ReactNode;
    microApp?: string;
    microAppProps?: MicroAppProps;
    file?: string;
    children?: Route[];
  }

  // 前端根据后端返回数据生成的React.lazy懒加载组件或Outlet（一级路由）
  type RouteComponent = LazyExoticComponent<ComponentType<any>> | typeof Outlet;

  // patchRoutes 函数的参数可以解构出 { routes, routeComponents }
  // 此类型用于 Object.assign(routes, parsedRoutes)，合并路由数据
  interface ParsedRoutes {
    [key: number]: Route;
  }

  // 此类型用于 Object.assign(routeComponents, parsedRoutes)，合并路由组件
  interface ParsedRouteComponent {
    [key: number]: RouteComponent;
  }

  // parseRoutes 函数的返回值
  interface ParseRoutesReturnType {
    routes: DynamicRoutes.ParsedRoutes;
    routeComponents: DynamicRoutes.ParsedRouteComponent;
    currentIdx: number;
  }
}
