<script setup>
import { ref, reactive, computed, watch, onMounted, provide } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { __ } from '@wordpress/i18n';

import { useApi } from '../../library/api';
import { useBusyStore } from '../../stores/busy';

import TheBulkAction from '../../components/TheBulkAction.vue';
import ThePagination from '../../components/ThePagination.vue';
import TheLicenseIndexRow from '../../components/licenses/TheLicenseIndexRow.vue';
import { useNotifier } from '../../library/notifier';
import { Switch } from '@headlessui/vue';

const route = useRoute();
const router = useRouter();
const api = useApi();
const busyStore = useBusyStore();

const searchBtn = ref(null);
const notifier = useNotifier();

const query = reactive({
    page: route.query.page ? Number(route.query.page) : 1,
    search: route.query.search || '',
    per_page: route.query.per_page ? Number(route.query.per_page) : 20,
});

const meta = reactive({
    current_page: 0,
    from: 0,
    last_page: 0,
    to: 0,
    total_filtered: 0,
    total_exists: 0,
});

const skeleton = computed(() => {
    return items.value.length > 0 ? items.value.length : 1;
});

const items = ref([]);

const selectedItems = ref([]);
provide('selectedItems', selectedItems);

const getBusyHasTask = busyStore.hasTask;

function pushWithQuery() {
    router.push({
        name: 'licenses.index',
        query: {
            ...route.query,
            ...query,
        },
    });
};

onMounted(() => {
    busyStore.reset();
    doRefreshItems();
});

// do search when query.search cleared
watch(() => query.search, (value, oldValue) => {
    if ('' === value && route.query.search.trim() !== value) {
        doSearch(true);
    }
});

function doChangePage(page) {
    query.page = page;
    pushWithQuery();
}

onBeforeRouteUpdate((to, from) => {
    if (to.query.page !== from.query.page) {
        query.page = to.query.page ? Number(to.query.page) : 1;
    }

    if (to.query.per_page !== from.query.per_page) {
        query.per_page = to.query.per_page ? Number(to.query.per_page) : 20;
    }

    doRefreshItems();
});

function doSearch(reset = false) {
    query.page = 1;

    if (reset) {
        query.search = '';
    }

    pushWithQuery();
}

function doRefreshItems() {
    busyStore.add('licenses.index:fetch-items');
    api
        .request({
            method: 'GET',
            url: '/admin/licenses/index',
            params: {
                page: query.page,
                search: query.search,
                per_page: query.per_page,
            },
        })
        .then(response => response.data)
        .then(data => {
            items.value = data.data.map(item => {
                item.isDeleted = false;
                item.isDeleting = false;
                item.isUpdatingStatus = false;
                return item;
            });

            meta.total_exists = data.meta.total_exists;
            meta.total_filtered = data.meta.total_filtered;
            meta.current_page = data.meta.page;
            meta.from = data.meta.from;
            meta.to = data.meta.to;
            meta.last_page = data.meta.total_pages;

            resetBulkSelection();
        })
        .catch(function (error) {
            notifier.alert(error.message);
        })
        .finally(() => {
            busyStore.remove('licenses.index:fetch-items');
            resetBulkSelection();
        });
}

function doUpdateStatus(item, status = null) {
    if (status === item.status) {
        return;
    }

    busyStore.add('licenses.index:update-status');
    item.isUpdatingStatus = true;

    api
        .request({
            method: 'PATCH',
            url: `/admin/licenses/update-status/${item.id}`,
            data: {
                status: status !== null ? status : !item.status,
            },
        })
        .then((response) => {
            return response.data;
        })
        .then(data => {
            item.status = data.status;
        })
        .catch(function (error) {
            notifier.alert(error.message);
        })
        .finally(() => {
            item.isUpdatingStatus = false;
            busyStore.remove('licenses.index:update-status');
        });
}

function doDelete(item, ask = true) {
    if (ask && !confirm(__(`Are you sure you want to delete this license?`, 'yabe-ukiyo'))) {
        return;
    }

    item.isDeleting = true;
    busyStore.add('licenses.index:delete');

    api
        .request({
            // method: 'DELETE', // not working on IIS server without further configuration
            method: 'POST',
            url: `/admin/licenses/delete/${item.id}`,
        })
        .then((response) => {
            item.isDeleted = true;
        })
        .catch(function (error) {
            notifier.alert(error.message);
        })
        .finally(() => {
            item.isDeleting = false;
            busyStore.remove('licenses.index:delete');
        });
}

const selectAll = computed({
    get() {
        if (items.value.length > 0) {
            let allChecked = true;
            for (const [index, item] of items.value.entries()) {
                if (!selectedItems.value.includes(item.id)) {
                    allChecked = false;
                }
                if (!allChecked) break;
            }
            return allChecked;
        }
        return false;
    },
    set(value) {
        const checked = [];
        if (value) {
            items.value.forEach((item) => {
                checked.push(item.id);
            });
        }
        selectedItems.value = checked;
    },
});

function resetBulkSelection() {
    selectedItems.value = [];
}

const chosenAction = ref('-1');

const bulkActions = ref([
    { key: 'activate', label: 'Activate' },
    { key: 'deactivate', label: 'Deactivate' },
    { key: 'delete', label: 'Delete' },
]);

function doBulkActions(action) {
    if (action === '-1') {
        return;
    }
    switch (action) {
        case 'delete':
            if (
                confirm(__(`Are you sure you want to delete the selected license(s)?`, 'yabe-ukiyo'))
            ) {
                selectedItems.value.forEach(async (id) => {
                    const item = items.value.find((item) => item.id === id);
                    doDelete(item, false);
                });
                resetBulkSelection();
            }
            break;
        case 'deactivate':
            if (
                confirm(__(`Are you sure you want to deactivate the selected license(s)?`, 'yabe-ukiyo'))
            ) {
                selectedItems.value.forEach(async (id) => {
                    const item = items.value.find((item) => item.id === id);
                    doUpdateStatus(item, false);
                });
                resetBulkSelection();
            }
            break;
        case 'activate':
            if (
                confirm(__(`Are you sure you want to activate the selected license(s)?`, 'yabe-ukiyo'))
            ) {
                selectedItems.value.forEach(async (id) => {
                    const item = items.value.find((item) => item.id === id);
                    doUpdateStatus(item, true);
                });
                resetBulkSelection();
            }
            break;
        default:
            break;
    }
}
</script>

<template>
    <router-link :to="{ name: 'licenses.create' }" class="page-title-action">{{ __('Add New', 'yabe-ukiyo') }}</router-link>

    <span v-if="route.query.search" class="subtitle"> {{ __('Search results for', 'yabe-ukiyo') }}: <strong> {{ route.query.search }} </strong> </span>

    <button type="button" :disabled="busyStore.isBusy" @click="doRefreshItems" v-ripple class="button float:right flex! align-items:center gap-x:5">
        {{ __('refresh', 'yabe-ukiyo') }}
        <font-awesome-icon :icon="['far', 'arrows-rotate']" :class="{ 'animation:rotate|1s|infinite': busyStore.isBusy && getBusyHasTask('licenses.index:fetch-items') }" class="font:15" />
    </button>

    <hr class="invisible m:0 mt:-2" />

    <ul class="subsubsub">
        <li class="all">
            <router-link :to="{
                name: 'licenses.index',
                query: {
                    ...route.query,
                    page: 1,
                },
            }" class="current"> {{ __('All', 'yabe-ukiyo') }} <span class="count"> ({{ meta.total_exists }}) </span> </router-link>
        </li>
    </ul>

    <p class="search-box rel">
        <input type="search" id="searchInput" name="s" v-model.trim.lazy="query.search" @keyup.enter="$refs.searchBtn.click()" :disabled="busyStore.isBusy" />
        <button type="button" class="button flex! align-items:center gap-x:5" :disabled="busyStore.isBusy" ref="searchBtn" @click="doSearch()" v-ripple>
            {{ __('search', 'yabe-ukiyo') }}
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="font:15" />
        </button>
    </p>

    <div class="tablenav top">
        <TheBulkAction v-model="chosenAction" :actions="bulkActions" @bulk-actions="doBulkActions" />
        <div class="tablenav-pages pb:12">
            <span class="displaying-num"> {{ `${meta.total_filtered} ${__('items', 'yabe-ukiyo')}` }} </span>
            <ThePagination v-if="meta.last_page > 1" :is-enable-goto="true" :current-page="meta.current_page" :first-page="meta.current_page - 1 > 1" :previous-page="meta.current_page > 1" :next-page="meta.current_page < meta.last_page" :last-page="meta.current_page + 1 < meta.last_page" :total-page="meta.last_page" @change-page="doChangePage" />
        </div>
        <br class="clear" />
    </div>

    <table class="wp-list-table widefat table-auto min-w:100% plugins">
        <thead>
            <tr>
                <td class="manage-column column-cb yabe-ukiyo-check-column px:8 vertical-align:middle">
                    <input v-model="selectAll" class="ml:12" type="checkbox" />
                </td>
                <td class="manage-column w:44">
                </td>
                <th scope="col" class="w:1/5">
                    {{ __('Title', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('License Key', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('User', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('Expire', 'yabe-ukiyo') }}
                </th>
                <th scope="col">
                    {{ __('Activation', 'yabe-ukiyo') }}
                </th>
            </tr>
        </thead>
        <tbody v-if="items.length > 0 && !getBusyHasTask('licenses.index:fetch-items')">
            <TheLicenseIndexRow v-for="item in items" :key="item.id" :item="item" @delete="doDelete(item)" @update-status="doUpdateStatus(item, null)" />
        </tbody>
        <tbody v-else-if="getBusyHasTask('licenses.index:fetch-items')">
            <tr v-for="s in skeleton" class="inactive animation:tw-pulse|cubic-bezier(0.4,0,0.6,1)|2s|infinite">
                <th scope="row" class="py:8 vertical-align:middle yabe-ukiyo-check-column">
                    <input type="checkbox" value="0" class="ml:14" disabled />
                </th>
                <td class="manage-column vertical-align:middle w:44">
                    <Switch :checked="false" class="opacity:.5 bg:gray-85 rel inline-flex p:0 h:24 w:44 flex-shrink:0 cursor:pointer rounded b:2 b:transparent">
                        <span class="translateX(0) pointer-events:none rel inline-block h:20 w:20 rounded bg:white box-shadow:0|0">
                            <span aria-hidden="true" class="abs inset:0 flex h:full w:full align-items:center justify-content:center opacity:1">
                                <font-awesome-icon :icon="['fas', 'spinner']" class="animation:rotate|linear|1s|infinite font:12 fg:gray-60"/>
                            </span>
                        </span>
                    </Switch>
                </td>
                <td class="w:1/5">
                    <div class="h:12 bg:slate-60 rounded w:1/2"></div>
                    <div class="row-actions visible mt:4 align-items:center flex">
                        <a class="px:4 cursor:pointer"> {{ __('Edit', 'yabe-ukiyo') }} </a>
                        |
                        <a class="px:4 fg:red-45 cursor:wait fg:red-35:hover">
                            {{ __(`Delete`, 'yabe-ukiyo') }}
                        </a>
                    </div>
                </td>
                <td class="align-items:center vertical-align:middle w:1/5">
                    <div class="h:12 bg:slate-60 rounded w:1/2"></div>
                </td>
                <td class="align-items:center vertical-align:middle w:1/5">
                    <div class="h:12 bg:slate-60 rounded w:1/2"></div>
                </td>
                <td class="align-items:center vertical-align:middle w:1/5">
                    <div class="h:12 bg:slate-60 rounded w:1/2"></div>
                </td>
                <td class="align-items:center vertical-align:middle">
                    <div class="h:12 bg:slate-60 rounded w:1/2"></div>
                </td>
            </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td colspan="5">
                    {{ __(`It looks like you don't have any licenses.`, 'yabe-ukiyo') }}
                    <router-link :to="{ name: 'licenses.create' }">{{ __('Perhaps you would like to add a new one?', 'yabe-ukiyo') }}</router-link>
                </td>
            </tr>
        </tbody>

        <tfoot>
            <tr>
                <td class="manage-column column-cb yabe-ukiyo-check-column px:8 vertical-align:middle">
                    <input v-model="selectAll" class="ml:12" type="checkbox" />
                </td>
                <td class="manage-column w:44">
                </td>
                <th scope="col" class="w:1/5">
                    {{ __('Title', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('License Key', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('User', 'yabe-ukiyo') }}
                </th>
                <th scope="col" class="w:1/5">
                    {{ __('Expire', 'yabe-ukiyo') }}
                </th>
                <th scope="col">
                    {{ __('Activation', 'yabe-ukiyo') }}
                </th>
            </tr>
        </tfoot>
    </table>

    <div class="tablenav bottom">
        <TheBulkAction v-model="chosenAction" :actions="bulkActions" @bulk-actions="doBulkActions" />
        <div class="tablenav-pages">
            <span class="displaying-num"> {{ `${meta.total_filtered} ${__('items', 'yabe-ukiyo')}` }} </span>
            <ThePagination v-if="meta.last_page > 1" :current-page="meta.current_page" :first-page="meta.current_page - 1 > 1" :previous-page="meta.current_page > 1" :next-page="meta.current_page < meta.last_page" :last-page="meta.current_page + 1 < meta.last_page" :total-page="meta.last_page" @change-page="doChangePage" />
        </div>
        <br class="clear" />
    </div>
</template>

<style>
</style>