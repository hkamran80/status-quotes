<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth0, AuthState } from "./utils/useAuth0";
const { login, logout, initAuth } = useAuth0(AuthState);

const route = useRoute();
initAuth();
</script>

<template>
    <div
        v-if="!AuthState.loading"
        class="max-w-7xl mx-auto"
        :class="{ 'pt-6 px-8 md:px-0 pb-20': route.name !== 'Login' }"
    >
        <router-view :auth-state="AuthState" @login="login" @logout="logout" />
    </div>

    <div v-else class="flex justify-center relative items-center">
        <div>
            <div
                class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"
            ></div>
        </div>
    </div>
</template>
