<template>
    <div>
        <div class="ukiyo-main">
            <header id="ukiyo-header" class="flex align-items:center px:20 py:16 bg:#bad2b7">
                <div class="flex flex-grow:1 align-items:center gap:10 fg:black">
                    <inline-svg :src="require('../../ukiyo.svg')" class="inline-svg px:2 f:40" />
                    <h1 class="">Yabe Ukiyo</h1>
                </div>
                <div class="">
                    <div class="flex flex:row align-items:center gap:10">
                        <!-- <button @click="theme = theme === 'dark' ? 'light' : 'dark'" class="flex b:0 rounded p:10 f:20 bg:transparent bg:gray-80:hover cursor:pointer">
                            <font-awesome-icon v-if="theme === 'light'" :icon="['fas', 'sun-bright']" />
                            <font-awesome-icon v-else-if="theme === 'dark'" :icon="['fas', 'moon-stars']" />
                        </button> -->

                        <a href="https://github.com/sponsors/suabahasa?o=esb" target="_blank" :class="[{'hidden' : !ukiyo.lite_edition}]" class="github-sponsor px:16 py:5 bg:#fafbfc bg:#f3f4f6:hover font:medium lh:20px r:6 b:1|solid|rgba(27,31,35,.15) ~background-color|.2s|cubic-bezier(0.3,0,0.5,1) text:none user-select:none">
                            <font-awesome-icon :icon="['far', 'heart']" class="mr:8 fg:#6a737d f:16 ~transform|.15s|cubic-bezier(0.2,0,0.13,2) scale(1) .github-sponsor:hover_{scale(1.1)}" />
                            <span class="f:14 fg:#24292e text-align:center ">Sponsor</span>
                        </a>

                        <div :class="[{'hidden' : !ukiyo.lite_edition}]" class="rel flex align-self:end h:full">
                            <canvas ref="pupRiveCanvas" class="abs z-index:3 h:36 top:-28 right:10"></canvas>
                            <a @mouseenter="$event => koFiHovered = true" @mouseleave="$event => koFiHovered = false" href="https://ko-fi.com/Q5Q75XSF7?utm_source=wordpress-plugins&utm_medium=plugin-ads-space&utm_campaign=yabe-ukiyo&utm_id=open-source" target="_blank" alt="Buy Me a Coffee at ko-fi.com">
                                <inline-svg class="h:28" :src="require('./img/kofi_button_dark.svg')" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div class="p:0 mx:auto">
                <div class="mb:20 bg:white bb:1|solid|gray-80">
                    <div class="mx:30">
                        <ul class="flex gap-x:28 pt:20 m:0 font:semibold uppercase font:12 align-items:baseline m:0>li px:4>li pt:10>li pb:6>li {bb:3|solid|black}>li:has(>.router-link-active) text-decoration:none>li>a fg:gray-30>li>a fg:gray-10>li>a:hover box-shadow:none>li>a:focus">
                            <li><router-link :to="{ name: 'licenses' }" activeClass="router-link-active fg:gray-10">Licenses</router-link></li>
                            <li><router-link :to="{ name: 'remotes' }" activeClass="router-link-active fg:gray-10">Remotes</router-link></li>
                            <li><router-link :to="{ name: 'settings' }" activeClass="router-link-active fg:gray-10">Settings</router-link></li>
                            <li>
                                <a href="https://ukiyo.yabe.land/docs?utm_source=wordpress-plugins&utm_medium=plugin-ads-space&utm_campaign=yabe-ukiyo&utm_id=open-source" target="_blank" class="rel">
                                    Documentation
                                    <font-awesome-icon :icon="['fas', 'up-right-from-square']" class="font:11 ml:4 abs top:-1.5" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="ukiyo-notice-pool b:0 mx:0">
                    <hr class="wp-header-end">
                    <WordpressNotice />
                </div>

                <div class="ukiyo-content px:20 my:20">
                    <router-view v-slot="{ Component, route }">
                        <component :is="Component" />
                    </router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import riveWASMResource from '@rive-app/canvas/rive.wasm?inline';
import { Rive, RuntimeLoader } from '@rive-app/canvas';

import WordpressNotice from './components/WordpressNotice.vue';

import pupRiveFile from './rive/pup.riv';

const pupRiveCanvas = ref(null);

RuntimeLoader.setWasmUrl(riveWASMResource);

/** @type {Rive} */
let pupRive = null;
const koFiHovered = ref(false);

watch(koFiHovered, (value) => {
    pupRive.stateMachineInputs('YeyMachine')[0].value = value;
});

onMounted(() => {
    pupRive = new Rive({
        src: pupRiveFile,
        canvas: pupRiveCanvas.value,
        autoplay: true,
        stateMachines: 'YeyMachine',
        onLoad: () => {
            pupRive.resizeDrawingSurfaceToCanvas();
        },
    });
});

onBeforeUnmount(() => {
    pupRive.cleanup();
});
</script>

<style lang="scss">
</style>