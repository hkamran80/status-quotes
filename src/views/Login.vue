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
    newVal === true ? push({ name: "Quotes" }) : null
);
</script>

<template>
    <div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2
                class="
                    mt-6
                    text-center text-3xl
                    font-extrabold
                    text-gray-900
                    dark:text-gray-100
                "
            >
                Sign in to your account
            </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div
                class="
                    bg-white
                    dark:bg-gray-900
                    text-center
                    py-8
                    px-4
                    shadow
                    sm:rounded-lg sm:px-10
                "
            >
                <button
                    type="button"
                    class="
                        w-full
                        flex
                        justify-center
                        py-2
                        px-4
                        border border-transparent
                        rounded-md
                        shadow-sm
                        text-sm
                        font-medium
                        text-white
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                    "
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
        </div>

        <div class="absolute bottom-7 left-7">
            <span class="mt-2 text-grey-900 dark:text-gray-400 text-sm">
                By using this site, you agree to the use of cookies for the sole
                purpose of maintaining your login state.
            </span>
        </div>
    </div>
</template>
