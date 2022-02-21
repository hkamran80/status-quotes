<script setup lang="ts">
import { useTitle } from "@vueuse/core";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";
import { theme } from "../utils/theming";
import { watch } from "vue";

useTitle("Login | Status Quotes");

const { loginWithPopup, isAuthenticated } = useAuth0();
const login = () => loginWithPopup();

const { push } = useRouter();
if (isAuthenticated.value) {
    push({ name: "Quotes" });
}

watch(isAuthenticated, (newState) => {
    if (newState === true) {
        push({ name: "Quotes" });
    }
});
</script>

<template>
    <div class="h-screen flex items-center justify-center py-12 px-8">
        <div class="max-w-md w-full space-y-8 my-auto">
            <h2
                class="mt-6 text-center text-3xl font-extrabold text-black dark:text-white"
            >
                Status Quotes
            </h2>

            <button
                type="button"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="[
                    theme.BG,
                    theme.DARK_BG,
                    theme.HOVER_BG,
                    theme.DARK_HOVER_BG,
                    theme.RING,
                    theme.DARK_RING,
                ]"
                @click.prevent="login"
            >
                Sign in
            </button>
        </div>

        <div class="absolute bottom-7 left-7 flex flex-col">
            <span
                class="mt-2 text-grey-900 dark:text-gray-400 text-sm pr-6 select-none"
            >
                Copyright &copy; {{ new Date().getFullYear() }}
                <a
                    href="https://unisontech.org"
                    target="_blank"
                    class="underline"
                    >UNISON Technologies, Inc</a
                >. All rights reserved.
            </span>
            <span
                class="mt-2 text-grey-900 dark:text-gray-400 text-sm pr-6 select-none"
            >
                By using this site, you agree to the use of cookies for the sole
                purpose of maintaining your login state.
            </span>
        </div>
    </div>
</template>
