<script setup lang="ts">
/* eslint-disable vue/no-v-html */
/* eslint-disable vue/multi-word-component-names */

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";
import { useTitle, useToggle } from "@vueuse/core";
import { isDark } from "../composables/dark";
import feather from "feather-icons";
import { checkAuthorization } from "../composables/checkAuthorization";

import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
} from "@headlessui/vue";

const { push } = useRouter();
const { isAuthenticated, user, logout: auth0Logout } = useAuth0();

const logout = () => {
    auth0Logout({ returnTo: window.location.origin });
};

if (!isAuthenticated.value) {
    push({ name: "Login" });
}

const { checkAuthorized } = checkAuthorization();
checkAuthorized();

useTitle("Profile | Status Quotes");
const toggleDark = useToggle(isDark);

const resetPasswordConfirmationDialog = ref<boolean>(false);
const resetPasswordNotification = ref<boolean>(false);
const resetPassword = async () => {
    console.debug("Resetting password...");

    let url = `https://${
        import.meta.env.VITE_AUTH0_DOMAIN as string
    }/dbconnections/change_password`;

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
            email: user.value.email,
            connection: "Username-Password-Authentication",
        }),
    });

    resetPasswordNotification.value = true;
};
</script>

<template>
    <div class="max-w-2xl mx-auto py-8 sm:py-10 sm:px-6 lg:px-8">
        <header>
            <div class="flex items-center justify-between">
                <div class="flex-1 flex flex-col">
                    <h2
                        class="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate mb-0.5 select-none"
                    >
                        Profile
                    </h2>
                </div>
                <div class="flex space-x-3">
                    <router-link
                        to="/"
                        class="rounded-lg text-gray-700 dark:text-gray-300 p-2 focus:outline-none focus:ring-2"
                        v-html="feather.icons.home.toSvg()"
                    />
                    <button
                        type="button"
                        class="rounded-lg text-gray-700 dark:text-gray-300 p-2 focus:outline-none focus:ring-2"
                        @click="() => toggleDark()"
                        v-html="feather.icons[isDark ? 'moon' : 'sun'].toSvg()"
                    />
                    <button
                        type="button"
                        class="rounded-lg text-red-600 p-2 focus:outline-none focus:ring-2"
                        @click="logout"
                        v-html="feather.icons['log-out'].toSvg()"
                    />
                </div>
            </div>
        </header>

        <main v-if="user" class="mt-10 sm:mt-5 space-y-4">
            <div
                v-if="!user.email_verified"
                class="bg-yellow-400 rounded-lg p-5 flex space-x-3 items-center"
            >
                <span v-html="feather.icons['alert-triangle'].toSvg()" />

                <span class="text-black">
                    Your email is unverified. Please search your inbox for an
                    email from Status Quotes (no-reply@auth0user.net) to verify
                    your email. Contact
                    <a
                        :href="`mailto:hkamran@hkamran.com?subject=Status%20Quotes%20-%20Verification%20Email&body=${encodeURIComponent(
                            user.email,
                        )}`"
                        target="_blank"
                        class="underline"
                        >support</a
                    >
                    if an error occurs or you can't find the email.
                </span>
            </div>

            <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5">
                <span
                    class="block text-gray-600 dark:text-gray-500 text-sm mb-0.5"
                >
                    Name
                </span>
                <span class="text-black dark:text-white" v-text="user.name" />
            </div>

            <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5">
                <span
                    class="block text-gray-600 dark:text-gray-500 text-sm mb-0.5"
                >
                    Email
                </span>
                <span class="text-black dark:text-white" v-text="user.email" />
            </div>

            <button
                type="button"
                class="w-full text-left bg-gray-100 dark:bg-gray-900 rounded-lg p-5"
                @click="resetPasswordConfirmationDialog = true"
            >
                <span class="text-black dark:text-white">Reset Password</span>
            </button>
        </main>

        <div
            class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end"
        >
            <transition
                enter-active-class="transition ease-in duration-100"
                enter-from-class="translate-x-10 opacity-0"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="translate-x-0 opacity-100"
                leave-to-class="translate-x-10 opacity-0"
            >
                <div
                    v-if="resetPasswordNotification"
                    class="max-w-sm w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
                    @click="resetPasswordNotification = false"
                >
                    <div class="p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <span
                                    class="h-6 w-6 text-green-600"
                                    v-html="
                                        feather.icons['alert-triangle'].toSvg()
                                    "
                                />
                            </div>
                            <div class="ml-3 w-0 flex-1 pt-0.5">
                                <p
                                    class="text-sm font-medium text-black dark:text-white"
                                >
                                    Password reset email sent!
                                </p>
                            </div>
                            <div class="ml-4 flex-shrink-0 flex">
                                <button
                                    class="bg-white dark:bg-gray-900 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    @click="resetPasswordNotification = false"
                                >
                                    <span class="sr-only">Close</span>
                                    <span v-html="feather.icons.x.toSvg()" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <TransitionRoot
            appear
            :show="resetPasswordConfirmationDialog"
            as="template"
        >
            <Dialog as="div" @close="resetPasswordConfirmationDialog = false">
                <div
                    class="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-60"
                >
                    <div class="min-h-screen px-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <DialogOverlay class="fixed inset-0" />
                        </TransitionChild>

                        <span
                            class="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <div
                                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-lg"
                            >
                                <DialogTitle
                                    as="h3"
                                    class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100"
                                >
                                    Reset Password
                                </DialogTitle>
                                <div
                                    class="my-4 space-y-2 text-gray-500 dark:text-gray-400"
                                >
                                    <p class="text-sm">
                                        Are you sure you want to reset your
                                        password? This action is irreversible.
                                    </p>
                                </div>
                                <div
                                    class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
                                >
                                    <button
                                        type="button"
                                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="
                                            resetPasswordConfirmationDialog = false;
                                            resetPassword();
                                        "
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="button"
                                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        @click="
                                            resetPasswordConfirmationDialog = false
                                        "
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>
