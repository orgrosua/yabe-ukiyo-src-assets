<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import debounce from 'lodash-es/debounce';
import { useApi } from '../../library/api';
import { useBusyStore } from '../../stores/busy';
import { useNotifier } from '../../library/notifier';
import { __ } from '@wordpress/i18n';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

const api = useApi();
const route = useRoute();
const router = useRouter();
const notifier = useNotifier();
const busy = useBusyStore();

const item = ref({});

const isRevealLicenseKey = ref(true);
const siteKey = ref('');

const licenseKey = ref('');
const title = ref('');
const status = ref(true);
const remoteUrl = ref('');

const remoteUrlField = ref(null);

const remoteConnectionDefault = {
    status: null,
    connected: false,
    yabeUkiyoDetected: false,
    bricksDetected: false,
};

const remoteConnection = ref({
    ...remoteConnectionDefault,
});

watch(siteKey, (newValue, oldValue) => {
    if (newValue === '' || newValue === oldValue) {
        return;
    }

    try {
        const decoded = atob(newValue).split('\n');

        if (decoded.length === 3) {
            remoteUrl.value = decoded[0];
            title.value = decoded[1];
            licenseKey.value = decoded[2];
        }
    } catch (err) {
        // do nothing
    }

});

watch(remoteUrl, debounce((newUrl, oldUrl) => {
    if (newUrl !== oldUrl) {
        remoteConnection.value = {
            ...remoteConnectionDefault,
        };

        if (newUrl !== '' && remoteUrlField.value.checkValidity()) {
            remoteConnection.value.status = 'loading';

            api
                .request({
                    method: 'POST',
                    url: '/admin/remotes/check-connection',
                    data: {
                        remote_url: newUrl.trim().replace(/\/$/, ''),
                    },
                })
                .then(response => {
                    if (response.status === 200) {
                        remoteConnection.value = {
                            ...remoteConnection.value,
                            status: true,
                            connected: true,
                        };

                        remoteConnection.value.yabeUkiyoDetected = response.data.namespaces.find(item => item === 'yabe-ukiyo/v1') !== undefined;
                        remoteConnection.value.bricksDetected = response.data.namespaces.find(item => item === 'bricks/v1') !== undefined;

                    } else {
                        remoteConnection.value.status = false;
                    }
                })
                .catch(err => {
                    remoteConnection.value = {
                        ...remoteConnectionDefault,
                        status: false,
                    };
                });
        }
    }
}, 100));

async function fetchItem() {
    busy.add('remotes.edit:fetch-item');
    return api
        .request({
            method: 'GET',
            url: `/admin/remotes/detail/${route.params.id}`,
        })
        .then((response) => {
            return response.data;
        })
        .then(data => {
            licenseKey.value = data.license_key;
            title.value = data.title;
            status.value = data.status;
            remoteUrl.value = data.remote_url;

            item.value = data;
        })
        .finally(() => {
            busy.remove('remotes.edit:fetch-item');
        });
};

onBeforeMount(() => {
    let promise = fetchItem();

    notifier.async(
        promise,
        'Remote details loaded.',
        err => {
            notifier.alert(
                err.response && err.response.status === 404
                    ? 'Remote not found.'
                    : 'Failed to load remote details.'
            );
            router.go(-1);
        },
        'Fetching remote details...'
    );
});
</script>

<template>
    <span class="mr:8 font:24">» {{ __('Detail', 'yabe-ukiyo') }}</span>

    <div>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row"><label>{{ __('Token', 'yabe-ukiyo') }}</label></th>
                    <td>
                        <input type="text" name="siteKey" v-model.trim.lazy="siteKey" readonly>
                        <p class="description">
                            Paste the Token to fill the below fields automatically.
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>{{ __('Title', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                    <td>
                        <input type="text" name="title" v-model.trim.lazy="title" readonly>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>{{ __('Remote URL', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                    <td>
                        <input type="url" ref="remoteUrlField" name="remote_url" v-model.trim.lazy="remoteUrl" readonly>
                        <p v-if="remoteConnection.status !== null" class="description">
                            <span v-if="remoteConnection.status === 'loading'">
                                <font-awesome-icon :icon="['fas', 'spinner']" class="mr:4 fg:gray-60 animation:rotate|linear|1s|infinite" />
                                {{ __('Connecting', 'yabe-ukiyo') }}...
                            </span>

                            <template v-else>
                                <span class="font:semibold">{{ __('Server', 'yabe-ukiyo') }}: </span>
                                <span :class="remoteConnection.connected ? 'fg:green-50' : 'fg:red-40'">
                                    {{ remoteConnection.connected ? __('Connected', 'yabe-ukiyo') : __('Failed to connect', 'yabe-ukiyo') }}
                                </span>
                                <br>
                                <span class="font:semibold">Bricks: </span>
                                <span :class="remoteConnection.bricksDetected ? 'fg:green-50' : 'fg:red-40'">
                                    {{ remoteConnection.bricksDetected ? __('Detected', 'yabe-ukiyo') : __('Not detected', 'yabe-ukiyo') }}
                                </span>
                                <br>
                                <span class="font:semibold">Yabe Ukiyo: </span>
                                <span :class="remoteConnection.yabeUkiyoDetected ? 'fg:green-50' : 'fg:yellow-60'">
                                    {{ remoteConnection.yabeUkiyoDetected ? __('Detected', 'yabe-ukiyo') : __('Not detected', 'yabe-ukiyo') }}
                                </span>
                            </template>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>{{ __('License Key', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                    <td>
                        <div class="flex">
                            <div class="rel flex mr:8 align-items:center">
                                <input :type="isRevealLicenseKey ? 'text' : 'password'" name="secret_license_key" v-model="licenseKey" autocomplete="current-password" class="min-w:300 hide::-ms-reveal" readonly>
                                <span @click="isRevealLicenseKey = !isRevealLicenseKey" class="flex align-items:center ml:-24 fg:gray-60 fg:gray-40:hover cursor:pointer">
                                    <template v-if="!isRevealLicenseKey">
                                        <font-awesome-icon :icon="['fas', 'eye']" class="font:15" />
                                    </template>
                                    <template v-else>
                                        <font-awesome-icon :icon="['fas', 'eye-slash']" class="font:15" />
                                    </template>
                                </span>
                            </div>
                        </div>
                        <p class="description">
                            You also can use the "My Templates Access" password provided by the remote site here. 
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>{{ __('Status', 'yabe-ukiyo') }}</label></th>
                    <td>
                        <SwitchGroup as="div" class="flex align-items:center">
                            <Switch v-model="status" aria-disabled="true" :class="[status ? 'bg:sky-55' : 'opacity:.5 bg:gray-85']" class="rel inline-flex p:0 h:24 w:44 flex-shrink:0 cursor:pointer rounded b:2 b:transparent transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-duration:200 transition-timing-function:cubic-bezier(0.4,0,0.2,1) box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus outline:2|solid|transparent:focus">
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

            </tbody>
        </table>
    </div>
</template>

<style lang="scss"></style>