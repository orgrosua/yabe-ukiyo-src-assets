<script setup>
</script>

<template>
    <div class="wrap m:0">
        <h2 v-if="$route.name == 'remotes.index'" class="inline-block mr:8">
            {{ __('Remotes', 'yabe-ukiyo') }}
        </h2>
        <h2 v-else class="inline-block mr:8">
            <router-link :to="{ name: 'remotes' }" class="text-decoration-line:none">{{ __('Remotes', 'yabe-ukiyo') }}</router-link>
        </h2>
        <router-view></router-view>
        <div class="clear"></div>
    </div>
</template>
