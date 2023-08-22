<script setup>
import { ref, onMounted, watch, watchEffect, onBeforeMount, reactive } from 'vue';
import cloneDeep from 'lodash-es/cloneDeep';

import { useApi } from '../../library/api';
import { useNotifier } from '../../library/notifier';
import { useBusyStore } from '../../stores/busy';

const api = useApi();
const busy = useBusyStore();
const notifier = useNotifier();

const license = ref({
    key: null,
    is_activated: false,
    opt_in_pre_release: false,
});

onBeforeMount(() => {
    busy.add('settings:fetch-license');
    api
        .request({
            method: 'GET',
            url: '/admin/settings/license/index'
        })
        .then(response => response.data)
        .then(data => {
            license.value = data.license;
        })
        .catch(function (error) {
            notifier.alert(error.message);
        })
        .finally(() => {
            busy.remove('settings:fetch-license');
        });
});

watch(
    () => license.value.key,
    async (newKey, oldKey) => {
        if (busy.isBusy) {
            return;
        }

        if (newKey === oldKey) {
            return;
        }

        busy.add('settings:store-license');
        api
            .request({
                method: 'POST',
                url: '/admin/settings/license/store',
                data: {
                    license: newKey
                },
            })
            .then(response => response.data)
            .then(data => {
                license.value = cloneDeep(data.license);
                if (Object.keys(data.notice).length > 0) {
                    if (data.notice?.success) {
                        notifier.success(data.notice?.success);
                    } else if (data.notice?.error) {
                        notifier.alert(data.notice?.error);
                    }
                } else {
                    notifier.success('License setting saved.');
                }
            })
            .catch(function (error) {
                notifier.alert(error.message);
            })
            .finally(() => {
                busy.remove('settings:store-license');
            });
    }
);
</script>

<template>
    <div v-if="!ukiyo.lite_edition" class="tw-mb-6">
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row"><label>License Key</label></th>
                    <td>
                        <input name="license_key" type="password" v-model.lazy="license.key" class="min-w:25rem">
                        <div v-if="license.is_activated" class="flex my:10 align-items:center font:medium">
                            Status: <span class="font:regular fg:white bg:#15803d px:6 py:4 r:4 ml:10">active</span>
                        </div>
                        <p v-else class="description">Enter your <a href="https://ukiyo.yabe.land/#pricing-plans" target="_blank">license key</a> receive the update of the latest version.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>