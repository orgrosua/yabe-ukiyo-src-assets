<script setup></script>

<template>
    <div>
        <main class="mx:auto max-w:lg px:24 px:32@md">
            <div class="mx:auto max-w:xs py:64 py:96@xs">
                <div class="text:center">
                    <p class="f:16 line-height:24px font:semibold fg:sky-55">404</p>
                    <h1 class="mt:8 f:36 line-height:40px font:bold letter-spacing:-0.025em fg:gray-5 f:48@xs line-height:1@xs">{{ __('This page does not exist.', 'yabe-ukiyo') }}</h1>
                    <p class="mt:8 f:18 line-height:28px fg:gray-50">{{ __('The page you are looking for could not be found.', 'yabe-ukiyo') }}</p>
                </div>
                <div class="mt:48">
                    <h2 class="f:16 line-height:24px font:semibold fg:gray-50">{{ __('Popular pages', 'yabe-ukiyo') }}</h2>
                    <ul role="list" class="mt:16 bx:0 by:1|solid|gray-80 bl:0>:not([hidden])~:not([hidden]) {bt:1|solid|gray-80}>:not([hidden])~:not([hidden])">
                        <li class="position:relative flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) py:24">
                            <div class="flex-shrink:0">
                                <span class="flex h:48 w:48 align-items:center justify-content:center r:8 bg:gray-85">
                                    <font-awesome-icon :icon="['fas', 'book']" class="f:24 fg:sky-40" />
                                </span>
                            </div>
                            <div class="min-w:0 flex:1|1|0">
                                <h3 class="my:0 f:16 line-height:24px font:medium fg:gray-5">
                                    <span class="r:2 {box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within">
                                        <a href="https://ukiyo.yabe.land/docs" target="_blank" class="text-decoration-line:none box-shadow:0|0|#000000:focus outline:2px|solid|transparent:focus outline-offset:2:focus fg:inherit">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Documentation', 'yabe-ukiyo') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="my:0 f:16 line-height:24px fg:gray-50">{{ __('A complete knowledge-base of the product', 'yabe-ukiyo') }}</p>
                            </div>
                            <div class="flex flex-shrink:0 align-self:center align-items:center">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-55" />
                            </div>
                        </li>

                        <li class="position:relative flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) py:24">
                            <div class="flex-shrink:0">
                                <span class="flex h:48 w:48 align-items:center justify-content:center r:8 bg:gray-85">
                                    <font-awesome-icon :icon="['fas', 'user-headset']" class="f:24 fg:sky-40" />
                                </span>
                            </div>
                            <div class="min-w:0 flex:1|1|0">
                                <h3 class="my:0 f:16 line-height:24px font:medium fg:gray-5">
                                    <span class="r:2 {box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within">
                                        <a href="https://ukiyo.yabe.land/support" target="_blank" class="text-decoration-line:none box-shadow:0|0|#000000:focus outline:2px|solid|transparent:focus outline-offset:2:focus fg:inherit">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Support', 'yabe-ukiyo') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="my:0 f:16 line-height:24px fg:gray-50">{{ __('How can we help you?', 'yabe-ukiyo') }} </p>
                            </div>
                            <div class="flex flex-shrink:0 align-self:center align-items:center">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-55" />
                            </div>
                        </li>

                        <!-- <li class="position:relative flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) py:24"> -->
                        <li class="position:relative flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) py:24">
                            <div class="flex-shrink:0">
                                <span class="flex h:48 w:48 align-items:center justify-content:center r:8 bg:gray-85">
                                    <font-awesome-icon :icon="['fas', 'rss']" class="f:24 fg:sky-40" />
                                </span>
                            </div>
                            <div class="min-w:0 flex:1|1|0">
                                <h3 class="my:0 f:16 line-height:24px font:medium fg:gray-5">
                                    <span class="r:2 {box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within">
                                        <a href="https://ukiyo.yabe.land/blog" class="text-decoration-line:none box-shadow:0|0|#000000:focus outline:2px|solid|transparent:focus outline-offset:2:focus fg:inherit">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Blog', 'yabe-ukiyo') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="my:0 f:16 line-height:24px fg:gray-50">{{ __('Read our latest news and articles', 'yabe-ukiyo') }}</p>
                            </div>
                            <div class="flex flex-shrink:0 align-self:center align-items:center">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-55" />
                            </div>
                        </li>
                    </ul>
                    <div class="mt:32">
                        <router-link :to="{ name: 'home' }" class="text-decoration-line:none f:16 line-height:24px font:medium fg:sky-55 fg:sky-60:hover">
                            {{ __('Or go back home', 'yabe-ukiyo') }}
                            <span aria-hidden="true"> &rarr;</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>