<script setup>
import { ref, watch, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
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

watch(expiredAt, (newDate, oldDate) => {
    if (newDate === '') {
        expiredAt.value = null;
    }
});

function resetForm() {
    title.value = '';
    licenseKey.value = nanoid();
    status.value = true;
}

onBeforeMount(() => {
    resetForm();
});

function sendForm(e) {
    e.preventDefault();

    busy.add('license.create:send-form');

    let promise = api
        .request({
            method: 'POST',
            url: '/admin/licenses/store',
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
            const editUrl = router.resolve({
                name: 'licenses.edit',
                params: {
                    id: response.data.id,
                },
            }).href;

            wordpressNotice.add({
                type: 'success',
                message: `<p>License saved successfully. <a href="${editUrl}">Edit License</a></p>`,
            });

            resetForm();
        })
        .finally(() => {
            busy.remove('license.create:send-form');
        });

    notifier.async(
        promise,
        'License stored successfully.',
        undefined,
        'Storing license...'
    );
}
</script>

<template>
    <span class="mr:8 font:24">» {{ __('New', 'yabe-ukiyo') }}</span>

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

            <button type="submit" name="save" id="save" :disabled="busy.isBusy" class="button button-primary button-large" value="save">Save</button>

        </div>
    </form>
</template>

<style lang="scss"></style>