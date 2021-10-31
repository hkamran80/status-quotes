<script setup lang="ts">
import { useAuth0, AuthState } from "./utils/useAuth0";
const { login, logout, initAuth } = useAuth0(AuthState);

initAuth();
</script>

<template>
    <router-view
        class="min-h-screen bg-gray-100 dark:bg-black"
        :authState="AuthState"
        @login="login"
        @logout="logout"
        v-if="!AuthState.loading"
    />

    <div
        class="
            bg-gray-100
            dark:bg-black
            min-h-screen
            flex
            justify-center
            relative
            items-center
        "
        v-else
    >
        <div>
            <div
                class="
                    animate-spin
                    rounded-full
                    h-32
                    w-32
                    border-b-2 border-gray-900
                    dark:border-gray-100
                "
            ></div>
        </div>
    </div>
</template>
