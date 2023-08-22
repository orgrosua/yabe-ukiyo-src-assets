<script setup>
import { computed } from 'vue';
import { useBusyStore } from '../stores/busy';
import { nanoid } from 'nanoid';

const props = defineProps({
    actions: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: String,
        default: '-1'
    }
});

const busyStore = useBusyStore();

const emit = defineEmits(['bulkActions', 'update:modelValue']);

const chosen = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value);
    }
});
</script>

<template>
    <div class="alignleft actions bulkactions">
        <select :id="`bulk-action-selector-` + nanoid(3)" v-model="chosen" name="action" :disabled="busyStore.isBusy" title="Bulk Action">
            <option value="-1">
                {{ __('Bulk actions', 'yabe-ukiyo') }}
            </option>
            <option v-for="action in actions" :key="action.key" :value="action.key">
                {{ action.label }}
            </option>
        </select>
        <button type="submit" class="button action" :disabled="busyStore.isBusy" @click="$emit('bulkActions', chosen)" v-ripple>
            {{ __('Apply', 'yabe-ukiyo') }}
        </button>
    </div>
</template>