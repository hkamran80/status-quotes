<script setup lang="ts">
import { watch } from "@vue/runtime-core";
import { useTitle } from "@vueuse/core";
import { toRef } from "vue";
import { useRouter } from "vue-router";

import { AuthStateModel } from "../utils/useAuth0";
import { theme } from "../utils/theming";

const { push } = useRouter();
const emit = defineEmits<{ (e: "login"): void }>();
const props = defineProps<{ authState: AuthStateModel }>();

useTitle("Login | Status Quotes");

if (props.authState.isAuthenticated) {
    push({ name: "Quotes" });
}

const isAuthenticated = toRef(props.authState, "isAuthenticated");

watch(isAuthenticated, (newVal) =>
    newVal === true ? push({ name: "Quotes" }) : null,
);
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
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="[
                    theme.BG,
                    theme.DARK_BG,
                    theme.HOVER_BG,
                    theme.DARK_HOVER_BG,
                    theme.RING,
                    theme.DARK_RING,
                ]"
                @click.prevent="emit('login')"
            >
                Sign in
            </button>
        </div>

        <div class="absolute bottom-7 left-7">
            <span
                class="mt-2 text-grey-900 dark:text-gray-400 text-sm pr-6 select-none"
            >
                By using this site, you agree to the use of cookies for the sole
                purpose of maintaining your login state.
            </span>
        </div>
    </div>
</template>
