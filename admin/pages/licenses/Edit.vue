<script setup>
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import debounce from 'lodash-es/debounce';
import { useApi } from '../../library/api';
import { useBusyStore } from '../../stores/busy';
import { useNotifier } from '../../library/notifier';
import { useWordpressNoticeStore } from '../../stores/wordpressNotice';
import { __ } from '@wordpress/i18n';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { nanoid } from 'nanoid';

import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const api = useApi();
const route = useRoute();
const router = useRouter();
const notifier = useNotifier();
const busy = useBusyStore();
const wordpressNotice = useWordpressNoticeStore();

const licenseKey = ref('');
const title = ref('');
const status = ref(true);
const maxSites = ref(null);
const expiredAt = ref(null);
const user = ref(null);

const isRevealLicenseKey = ref(true);

const item = ref({});

const isDeleting = ref(false);

const users = ref([]);

const filteredUsers = computed(() => {
    return users.value.map(u => {
        return {
            label: `${u.name} (${u.email})`,
            value: parseInt(u.id),
        }
    });
});

const onSearch = debounce((s, loading) => {
    if (!s) {
        return;
    }

    loading(true);

    api
        .request({
            method: 'GET',
            url: `/admin/licenses/search_user`,
            params: {
                s: s,
            },
        })
        .then((response) => {
            users.value = response.data.data;
        })
        .catch((error) => {
            notifier.error(error);
        })
        .finally(() => {
            loading(false);
        });
}, 200);

async function fetchItem() {
    busy.add('licenses.edit:fetch-item');
    return api
        .request({
            method: 'GET',
            url: `/admin/licenses/detail/${route.params.id}`,
        })
        .then((response) => {
            return response.data;
        })
        .then(data => {
            licenseKey.value = data.license_key;
            title.value = data.title;
            status.value = data.status;
            maxSites.value = data.max_sites;

            if (data.expired_at) {
                expiredAt.value = new Date(data.expired_at * 1000).toISOString().split("T")[0];
            }

            if (data.user) {
                user.value = {
                    label: `${data.user.name} (${data.user.email})`,
                    value: data.user.id,
                };
            }

            item.value = data;
        })
        .finally(() => {
            busy.remove('licenses.edit:fetch-item');
        });
};

watch(expiredAt, (newDate, oldDate) => {
    if (newDate === '') {
        expiredAt.value = null;
    }
});

function sendForm(e) {
    e.preventDefault();

    busy.add('license.edit:send-form');

    let promise = api
        .request({
            // method: 'PUT', // not working on IIS server without further configuration
            method: 'POST',
            url: `/admin/licenses/update/${item.value.id}`,
            data: {
                title: title.value,
                license_key: licenseKey.value,
                status: status.value,
                max_sites: maxSites.value,
                expired_at: expiredAt.value,
                user_id: user.value?.value,
            },
        })
        .then(response => {
            wordpressNotice.add({
                type: 'success',
                message: `<p>License updated successfully.</p>`,
            });

            fetchItem();
        })
        .finally(() => {
            busy.remove('license.edit:send-form');
        });

    notifier.async(
        promise,
        'License updated successfully.',
        undefined,
        'Updating license...'
    );
}

function doDelete() {
    if (!confirm(__(`Are you sure you want to delete the license?`, 'yabe-ukiyo'))) {
        return;
    }

    isDeleting.value = true;
    busy.add('licenses.edit:delete');

    api
        .request({
            // method: 'DELETE', // not working on IIS server without further configuration
            method: 'POST',
            url: `/admin/licenses/delete/${item.value.id}`,
        })
        .then((response) => {
            router.push({ name: 'licenses.index' });
        })
        .catch(function (error) {
            notifier.alert(error.message);
        })
        .finally(() => {
            isDeleting.value = false;
            busy.remove('licenses.edit:delete');
        });
}

const isHaveUnsavedChanges = computed(() => {
    if (!item.value) {
        return false;
    }

    return (
        item.value.license_key !== licenseKey.value
        || item.value.title !== title.value
        || item.value.status !== status.value
        || item.value.max_sites !== maxSites.value
        || item.value.user?.id !== user.value?.value
        || item.value.expired_at !== (expiredAt.value ? Math.floor(new Date(expiredAt.value) / 1000) : null)
    );
});

const unsavedNoticeId = ref(null);

watch(isHaveUnsavedChanges, (newVal, oldVal) => {
    if (newVal && !unsavedNoticeId.value) {
        unsavedNoticeId.value = wordpressNotice.add({
            type: 'warning',
            message: `<p>You have unsaved changes.</p>`,
        });
    } else {
        wordpressNotice.remove(unsavedNoticeId.value);
        unsavedNoticeId.value = null;
    }
});

onBeforeMount(() => {
    let promise = fetchItem();

    notifier.async(
        promise,
        'License details loaded.',
        err => {
            notifier.alert(
                err.response && err.response.status === 404
                    ? 'License not found.'
                    : 'Failed to load license details.'
            );
            router.go(-1);
        },
        'Fetching license details...'
    );
});

onBeforeRouteLeave((to, from, next) => {
    if (isHaveUnsavedChanges.value) {
        if (!confirm(__(`You have unsaved changes. Are you sure you want to leave?`, 'yabe-ukiyo'))) {
            return;
        }
    }

    next();
});

window.onbeforeunload = function (e) {
    if (isHaveUnsavedChanges.value) {
        return __(`You have unsaved changes. Are you sure you want to leave?`, 'yabe-ukiyo');
    }
};

onBeforeUnmount(() => {
    window.onbeforeunload = null;
    if (unsavedNoticeId.value) {
        wordpressNotice.remove(unsavedNoticeId.value);
    }
});
</script>

<template>
    <span class="mr:8 font:24">» {{ __('Edit', 'yabe-ukiyo') }}</span>

    <form @submit="sendForm">
        <div>
            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><label>{{ __('Title', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                        <td>
                            <input type="text" name="title" v-model.trim.lazy="title" required>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label>{{ __('License Key', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                        <td>
                            <div class="flex">
                                <div class="rel flex mr:8 align-items:center">
                                    <input :type="isRevealLicenseKey ? 'text' : 'password'" name="secret_license_key" v-model="licenseKey" autocomplete="current-password" class="min-w:300 hide::-ms-reveal" required>
                                    <span @click="isRevealLicenseKey = !isRevealLicenseKey" class="flex align-items:center ml:-24 fg:gray-60 fg:gray-40:hover cursor:pointer">
                                        <template v-if="!isRevealLicenseKey">
                                            <font-awesome-icon :icon="['fas', 'eye']" class="font:15" />
                                        </template>
                                        <template v-else>
                                            <font-awesome-icon :icon="['fas', 'eye-slash']" class="font:15" />
                                        </template>
                                    </span>
                                </div>

                                <div @click="licenseKey = nanoid()" class="button flex align-items:center">
                                    <font-awesome-icon :icon="['fas', 'shuffle']" class="font:15 mr:6" />
                                    <span class="text">Generate</span>
                                </div>
                            </div>
                            <p class="description">
                                This value is compatible and can be used to fill the "Remote Templates Password" field.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label>{{ __('Status', 'yabe-ukiyo') }}</label></th>
                        <td>
                            <SwitchGroup as="div" class="flex align-items:center">
                                <Switch v-model="status" :class="[status ? 'bg:sky-55' : 'opacity:.5 bg:gray-85']" class="rel inline-flex p:0 h:24 w:44 flex-shrink:0 cursor:pointer rounded b:2 b:transparent transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-duration:200 transition-timing-function:cubic-bezier(0.4,0,0.2,1) box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus outline:2|solid|transparent:focus">
                                    <span :class="[status ? 'translateX(20)' : 'translateX(0)']" class="pointer-events:none rel inline-block font:12 h:20 w:20 rounded bg:white transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-duration:200 transition-timing-function:cubic-bezier(0.4,0,0.2,1) box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1">
                                        <span aria-hidden="true" :class="[status ? 'opacity:0 transition-timing-function:ease-out transition-duration:100' : 'opacity:1 transition-timing-function:ease-in transition-duration:200']" class="abs inset:0 flex h:full w:full align-items:center justify-content:center tw-transition-opacity">
                                            <font-awesome-icon :icon="['fas', 'xmark']" class="fg:gray-60" />
                                        </span>
                                        <span aria-hidden="true" :class="[status ? 'opacity:1 transition-timing-function:ease-in transition-duration:200' : 'opacity:0 transition-timing-function:ease-out transition-duration:100']" class="abs inset:0 flex h:full w:full align-items:center justify-content:center tw-transition-opacity">
                                            <font-awesome-icon :icon="['fas', 'check']" class="fg:sky-55" />
                                        </span>
                                    </span>
                                </Switch>
                                <SwitchLabel as="span" :class="[status ? 'fg:black' : 'fg:gray-60']" class="ml:8 font:medium tw-cursor-pointer">
                                    {{ status ? 'enabled' : 'disabled' }}
                                </SwitchLabel>
                            </SwitchGroup>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><label>{{ __('Max activations', 'yabe-ukiyo') }}</label></th>
                        <td>
                            <div class="flex">
                                <input type="number" v-model="maxSites" min="0">
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><label>{{ __('Expired at', 'yabe-ukiyo') }}</label></th>
                        <td>
                            <div class="flex">
                                <input type="date" v-model="expiredAt">
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row"><label>{{ __('User', 'yabe-ukiyo') }}</label></th>
                        <td>
                            <div class="flex">
                                <VueSelect v-model="user" :options="filteredUsers" @search="onSearch" :filterable="false" placeholder="Choose user" class="min-w:300">
                                    <template #no-options>
                                        Search for a user...
                                    </template>
                                </VueSelect>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="flex align-items:center">
                <button type="submit" name="save" id="save" :disabled="busy.isBusy" class="button button-primary button-large" value="save">Save</button>

                <a :class="{ 'cursor:wait': busy.isBusy }" class="ml:12 fg:red-40 text:underline cursor:pointer fg:red-30:hover" @click="doDelete">
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                </a>
            </div>
        </div>
    </form>
</template>

<style lang="scss"></style>