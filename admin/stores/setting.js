import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import cloneDeep from 'lodash-es/cloneDeep';
import { useBusyStore } from './busy.js';
import { useApi } from '../library/api.js';
import { useNotifier } from '../library/notifier.js';

export const useSettingStore = defineStore('setting', () => {
    const busyStore = useBusyStore();
    const api = useApi();
    const notifier = useNotifier();

    const setting = ref({});

    /**
     * Pulls the base CSS content from the server.
     * 
     * @returns {Promise} A promise.
     */
    async function doPull() {
        busyStore.add('setting.doPull');

        return await api
            .request({
                method: 'GET',
                url: '/admin/settings/index',
            })
            .then((response) => {
                setting.value = cloneDeep(response.data.options);
            })
            .catch((error) => {
                notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('setting.doPull');
            });
    }

    /**
     * Push the base CSS content to the server.
     * 
     * @returns {Promise} A promise
     */
    async function doPush() {
        busyStore.add('setting.doPush');

        const promise = api
            .request({
                method: 'POST',
                url: '/admin/settings/store',
                data: {
                    options: setting.value,
                }
            })
            .catch((error) => {
                notifier.alert(error.message);
            })
            .finally(() => {
                busyStore.remove('setting.doPush');
            });

        notifier.async(
            promise,
            `Setting saved.`,
            `Failed to save the setting.`,
            `Saving the setting changes...`
        );
    }

    return {
        setting,
        doPull,
        doPush,
    };
});