<script setup>
import { computed, inject } from 'vue';
import { useBusyStore } from '../../stores/busy';

import { Switch } from '@headlessui/vue';

const busyStore = useBusyStore();

const props = defineProps({
    item: {
        type: Object,
        required: true,
    }
});

const createdAt = computed(() => {
    return new Date(props.item.created_at * 1000);
});

const emit = defineEmits(['delete', 'updateStatus']);

const selectedItems = inject('selectedItems');

function handleKeyUp(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        emit('updateStatus');
    }
}
</script>

<template>
    <transition mode="out-in">
        <tr v-if="item.isDeleted" class="plugin-deleted-tr inactive deleted">
            <td colspan="5" class="plugin-update colspanchange">
                <strong>{{ item.title }}</strong> was successfully deleted.
            </td>
        </tr>
        <tr v-else :class="{ 'active': item.status, 'inactive': !item.status }" class="yabe-ukiyo-site-row">
            <th scope="row" :class="{ 'pl:6': !item.status }" class="vertical-align:middle py:8 yabe-ukiyo-check-column">
                <input v-model="selectedItems" type="checkbox" :value="item.id" :disabled="busyStore.isBusy" class="ml:14" />
            </th>
            <td class="manage-column vertical-align:middle w:44">
                <Switch :aria-disabled="busyStore.isBusy" :checked="item.status" @click="$emit('updateStatus')" @keyup="handleKeyUp" :class="[item.status ? 'bg:sky-55' : 'opacity:.5 bg:gray-85']" class="rel inline-flex p:0 h:24 w:44 flex-shrink:0 cursor:pointer rounded b:2 b:transparent transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-duration:200 transition-timing-function:cubic-bezier(0.4,0,0.2,1) box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus outline:2|solid|transparent:focus">
                    <span :class="[item.status ? 'translateX(20)' : 'translateX(0)']" class="pointer-events:none rel inline-block h:20 w:20 rounded bg:white transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-duration:200 transition-timing-function:cubic-bezier(0.4,0,0.2,1) box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1">
                        <span aria-hidden="true" :class="[item.status ? 'opacity:0 transition-timing-function:ease-out transition-duration:100' : 'opacity:1 transition-timing-function:ease-in transition-duration:200']" class="abs inset:0 flex h:full w:full align-items:center justify-content:center tw-transition-opacity">
                            <font-awesome-icon v-if="!item.isUpdatingStatus" :icon="['fas', 'xmark']" class="fg:gray-60" />
                            <font-awesome-icon v-else :icon="['fas', 'spinner']" class="animation:rotate|linear|1s|infinite fg:gray-60" />
                        </span>
                        <span aria-hidden="true" :class="[item.status ? 'opacity:1 transition-timing-function:ease-in transition-duration:200' : 'opacity:0 transition-timing-function:ease-out transition-duration:100']" class="abs inset:0 flex h:full w:full align-items:center justify-content:center tw-transition-opacity">
                            <font-awesome-icon v-if="!item.isUpdatingStatus" :icon="['fas', 'check']" class="fg:sky-55" />
                            <font-awesome-icon v-else :icon="['fas', 'spinner']" class="animation:rotate|linear|1s|infinite fg:sky-55" />
                        </span>
                    </span>
                </Switch>
            </td>
            <td class="vertical-align:middle rel w:3/10">
                <div class="flex align-items:center">
                    <a aria-disabled="true" :class="{
                        'font:semibold': item.status
                    }" class="rel">
                        {{ item.site_url }}
                    </a>
                    <a :href="item.site_url" target="_blank" rel="noopener noreferrer">
                        <font-awesome-icon :icon="['fas', 'up-right-from-square']" class="font:11 mx:4 top:-1.5 absolute" />
                    </a>
                    <span class="invisible ml:4 .yabe-ukiyo-site-row:hover_{visible} fg:gray-60 font:normal">ID: {{ item.id }}</span>
                </div>
                <div class="row-actions visible">
                    <a> {{ __('Edit', 'yabe-webfont') }} </a>
                    |
                    <a :class="{ 'cursor:wait': busyStore.isBusy }" class="fg:red-40 cursor:pointer fg:red-30:hover" @click="$emit('delete')">
                        {{ item.isDeleting ? 'Deleting...' : 'Delete' }}
                    </a>
                </div>
            </td>
            <td class="vertical-align:middle rel w:3/10">
                <div class="flex align-items:center">
                    {{ createdAt.toISOString().split("T")[0] }}
                </div>
            </td>
        </tr>
    </transition>
</template>

<style scoped>
.v-leave-active {
    transition: all 0.35s;
}

.v-leave-to,
.v-leave-to td,
.v-leave-to th {
    background-color: #faafaa !important;
}
</style>