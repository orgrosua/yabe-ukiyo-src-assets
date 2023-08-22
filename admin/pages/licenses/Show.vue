<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '../../library/api';
import { useBusyStore } from '../../stores/busy';
import { useNotifier } from '../../library/notifier';
import { __ } from '@wordpress/i18n';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

import SitesIndex from '../sites/Index.vue';

const api = useApi();
const route = useRoute();
const router = useRouter();
const notifier = useNotifier();
const busy = useBusyStore();

const licenseKey = ref('');
const title = ref('');
const status = ref(true);
const maxSites = ref(null);
const expiredAt = ref(null);
const user = ref(null);

const isRevealLicenseKey = ref(true);

const item = ref({});

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
</script>

<template>
    <span class="mr:8 font:24">» {{ __('Detail', 'yabe-ukiyo') }}</span>

    <div>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row"><label>{{ __('Title', 'yabe-ukiyo') }} <span class="fg:red-35">*</span></label></th>
                    <td>
                        <input type="text" name="title" v-model.trim.lazy="title" readonly>
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

                <tr>
                    <th scope="row"><label>{{ __('Max activations', 'yabe-ukiyo') }}</label></th>
                    <td>
                        <div class="flex">
                            <input type="number" v-model="maxSites" min="0" readonly>
                        </div>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label>{{ __('Expired at', 'yabe-ukiyo') }}</label></th>
                    <td>
                        <div class="flex">
                            <input type="date" v-model="expiredAt" readonly>
                        </div>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label>{{ __('User', 'yabe-ukiyo') }}</label></th>
                    <td>
                        <div class="flex">
                            <input type="text" :value="user?.label" class="min-w:300" readonly>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="mt:18">
            <span class="font:20">{{ __('Sites', 'yabe-ukiyo') }}</span>
            <SitesIndex :license-id="parseInt(route.params.id)" />
        </div>
    </div>
</template>

<style lang="scss"></style>