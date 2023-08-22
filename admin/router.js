import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(`${ukiyo.web_history}#/`),
    scrollBehavior(_, _2, savedPosition) {
        return savedPosition || { left: 0, top: 0 };
    },
    routes: [
        { path: '/', name: 'home', redirect: { name: 'licenses' } },
        {
            path: '/licenses',
            name: 'licenses',
            component: () => import('./pages/licenses/Base.vue'),
            redirect: { name: 'licenses.index' },
            children: [
                {
                    path: 'index',
                    name: 'licenses.index',
                    component: () => import('./pages/licenses/Index.vue'),
                },
                {
                    path: 'create',
                    name: 'licenses.create',
                    component: () => import('./pages/licenses/Create.vue'),
                },
                {
                    path: 'edit/:id(\\d+)',
                    name: 'licenses.edit',
                    component: () => import('./pages/licenses/Edit.vue'),
                },
                {
                    path: 'show/:id(\\d+)',
                    name: 'licenses.show',
                    component: () => import('./pages/licenses/Show.vue'),
                },
            ]
        },
        {
            path: '/remotes',
            name: 'remotes',
            component: () => import('./pages/remotes/Base.vue'),
            redirect: { name: 'remotes.index' },
            children: [
                {
                    path: 'index',
                    name: 'remotes.index',
                    component: () => import('./pages/remotes/Index.vue'),
                },
                {
                    path: 'create',
                    name: 'remotes.create',
                    component: () => import('./pages/remotes/Create.vue'),
                },
                {
                    path: 'edit/:id(\\d+)',
                    name: 'remotes.edit',
                    component: () => import('./pages/remotes/Edit.vue'),
                },
                {
                    path: 'show/:id(\\d+)',
                    name: 'remotes.show',
                    component: () => import('./pages/remotes/Show.vue'),
                },
            ]
        },
        {
            path: '/sites',
            name: 'sites',
            // component: () => import('./pages/sites/Base.vue'),
            redirect: { name: 'sites.index' },
            children: [
                {
                    path: 'index',
                    name: 'sites.index',
                    // component: () => import('./pages/sites/Index.vue'),
                },
                {
                    path: 'edit/:id(\\d+)',
                    name: 'sites.edit',
                    // component: () => import('./pages/sites/Edit.vue'),
                },
            ]
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('./pages/settings/Base.vue'),
            redirect: { name: 'settings.general' },
            children: [
                {
                    path: 'general',
                    name: 'settings.general',
                    component: () => import('./pages/settings/General.vue'),
                },
                {
                    path: 'easy-digital-downloads',
                    name: 'settings.easy-digital-downloads',
                    component: () => import('./pages/settings/EasyDigitalDownloads.vue'),
                },
                {
                    path: 'woocommerce',
                    name: 'settings.woocommerce',
                    component: () => import('./pages/settings/WooCommerce.vue'),
                },
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('./pages/NotFound.vue'),
        },
    ]
});

export default router;