<script setup>
import { ref, watch } from 'vue';

import { useBusyStore } from '../stores/busy';

const props = defineProps({
    isEnableGoto: {
        type: Boolean,
        default: false,
        required: false
    },
    firstPage: {
        type: Boolean,
        default: false,
        required: false
    },
    previousPage: {
        type: Boolean,
        default: false,
        required: false
    },
    nextPage: {
        type: Boolean,
        default: false,
        required: false
    },
    lastPage: {
        type: Boolean,
        default: false,
        required: false
    },
    totalPage: {
        type: Number,
        default: 0,
        required: false
    },
    currentPage: {
        type: Number,
        default: 0,
        required: false
    }
});

const busyStore = useBusyStore();

const emit = defineEmits(['changePage']);

const thePage = ref(props.currentPage);

watch(thePage, (value, oldValue) => {
    if (
        value > 0
        && value <= props.totalPage
        && value !== oldValue
        && value !== props.currentPage
    ) {
        emit('changePage', value);
    }
});

watch(() => props.currentPage, (value, oldValue) => {
    if (value !== oldValue) {
        thePage.value = props.currentPage;
    }
});
</script>

<template>
    <span class="pagination-links">
        <button type="button" :disabled="busyStore.isBusy || !firstPage" class="tablenav-pages-navspan button mx:2" @click="$emit('changePage', 1)" v-ripple>
            «
        </button>
        <button type="button" :disabled="busyStore.isBusy || !previousPage" class="tablenav-pages-navspan button mx:2" @click="$emit('changePage', currentPage - 1)" v-ripple>
            ‹
        </button>
        <span class="paging-input mx:2">
            <input v-if="isEnableGoto" v-model.number="thePage" class="current-page tw-w-14" type="number" :disabled="busyStore.isBusy" min="1" :max="totalPage" />
            <span class="tablenav-paging-text mx:2">
                {{ isEnableGoto === false ? currentPage : '' }} of <span class="total-pages"> {{ totalPage }} </span>
            </span>
        </span>
        <button type="button" :disabled="busyStore.isBusy || !nextPage" class="next-page button mx:2" @click="$emit('changePage', currentPage + 1)" v-ripple>
            ›
        </button>
        <button type="button" :disabled="busyStore.isBusy || !lastPage" class="tablenav-pages-navspan button mx:2" @click="$emit('changePage', totalPage)" v-ripple>
            »
        </button>
    </span>
</template>

