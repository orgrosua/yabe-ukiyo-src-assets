import './public-path.js';

import VueSelect from 'vue-select';

require('./bootstrap');

import { __, _n, sprintf } from '@wordpress/i18n';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { FontAwesomeIcon } from './font-awesome.js';

import InlineSvg from 'vue-inline-svg';

import App from './App.vue';
import router from './router.js';

import 'vue-select/dist/vue-select.css';
import vRipple from './directives/ripple/ripple.js';

const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.__ = __;
app.config.globalProperties._n = _n;
app.config.globalProperties.sprintf = sprintf;
app.config.globalProperties.ukiyo = window.ukiyo;

app
    .use(pinia)
    .use(router)
    ;

app
    .component('VueSelect', VueSelect)
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('inline-svg', InlineSvg)
    ;

app.directive('ripple', vRipple);

app.mount('#ukiyo-app');