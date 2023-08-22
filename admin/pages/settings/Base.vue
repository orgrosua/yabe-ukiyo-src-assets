<script setup>
import { onBeforeMount } from 'vue';
import { useSettingStore } from '../../stores/setting';

const settingStore = useSettingStore();

onBeforeMount(() => {
    settingStore.doPull();
});

function doSave() {
    settingStore.doPush();
}
</script>

<template>
    <div class="wrap m:0">
        <h2 class="inline-block mr:8">
            {{ __('Settings', 'yabe-ukiyo') }}
        </h2>
        <ul class="flex gap-x:10 pt:20 m:0 font:semibold uppercase font:12 align-items:baseline bb:1|solid|#0000004f m:0>li px:4>li pt:10>li pb:6>li {bb:3|solid|#00000095}>li:has(>.router-link-active) text-decoration:none>li>a fg:gray-30>li>a:not(.router-link-exact-active) fg:gray-10>li>a:hover box-shadow:none>li>a:focus">
            <li><router-link :to="{ name: 'settings.general' }" activeClass="router-link-active fg:gray-10">{{ __('General', 'yabe-ukiyo') }}</router-link></li>
            <li v-if="ukiyo.ecommerce.platforms.includes('woocommerce')"><router-link :to="{ name: 'settings.woocommerce' }" activeClass="router-link-active fg:gray-10">{{ __('WooCommerce', 'yabe-ukiyo') }}</router-link></li>
            <li v-if="ukiyo.ecommerce.platforms.includes('easy-digital-downloads')"><router-link :to="{ name: 'settings.easy-digital-downloads' }" activeClass="router-link-active fg:gray-10">{{ __('Easy Digital Downloads', 'yabe-ukiyo') }}</router-link></li>
        </ul>
        <router-view></router-view>
        <div class="my:20">
            <button type="button" @click="doSave" class="button button-primary r:4 cursor:pointer" v-ripple>Save Changes</button>
        </div>
        <div class="clear"></div>
    </div>
</template>
