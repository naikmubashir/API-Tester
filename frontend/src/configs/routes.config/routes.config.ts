import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'imports',
        path: '/imports',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'yamlrules',
        path: '/yamlrules',
        component: lazy(() => import('@/views/YamlRules')),
        authority: [],
    },
    {
        key: 'endpoints',
        path: '/endpoints',
        component: lazy(() => import('@/views/Requests')),
        authority: [],
    },
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/Dashboard')),
        authority: [],
    },
    {
        key: 'scans',
        path: '/scans',
        component: lazy(() => import('@/views/Scans')),
        authority: [],
    },
    {
        key: 'processed-requests',
        path: '/processed-requests',
        component: lazy(() => import('@/views/ProcessedRequests')),
        authority: [],
    },
    {
        key: 'scan-details',
        path: '/scan-details/:id',
        component: lazy(() => import('@/views/ScanDetails')),
        authority: [],
    },

    /** Example purpose only, please remove */
    // {
    //     key: 'singleMenuItem',
    //     path: '/single-menu-view',
    //     component: lazy(() => import('@/views/demo/SingleMenuView')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item1',
    //     path: '/collapse-menu-item-view-1',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item2',
    //     path: '/collapse-menu-item-view-2',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.single',
    //     path: '/group-single-menu-item-view',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupSingleMenuItemView')
    //     ),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item1',
    //     path: '/group-collapse-menu-item-view-1',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupCollapseMenuItemView1')
    //     ),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item2',
    //     path: '/group-collapse-menu-item-view-2',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupCollapseMenuItemView2')
    //     ),
    //     authority: [],
    // },
    ...othersRoute,
]
