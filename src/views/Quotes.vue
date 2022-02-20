<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { onBeforeMount, ref } from "vue";
import { computed } from "@vue/reactivity";
import { useTitle, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";
import feather from "feather-icons";
import useHotkey, { HotKey } from "vue3-hotkey";
import { AuthStateModel } from "../utils/useAuth0";
import { addQuote, getQuotes, switchInUseQuote } from "../utils/database";
import { theme } from "../utils/theming";
import { isDark } from "../composables/dark";
import type { Quote } from "../models/quotes";

import QuoteCard from "../components/QuoteCard.vue";
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
} from "@headlessui/vue";

const { push } = useRouter();
const props = defineProps<{ authState: AuthStateModel }>();
const emit = defineEmits<{ (e: "logout"): void }>();

useTitle("Status Quotes");
const toggleDark = useToggle(isDark);

if (!props.authState.isAuthenticated) {
    push({ name: "Login" });
}

const adminUser = props.authState.isAuthenticated
    ? (import.meta.env.VITE_ADMIN_USERS as string)
          .split(",")
          .indexOf(props.authState.user.sub) !== -1
    : false;

const updateQuotes = async () => {
    try {
        const quotesList = await getQuotes();

        quotes.value = quotesList as Quote[];
        addModalQuote.value.id = quotes.value.length;
    } catch (error) {
        console.error(error);
    }
};

const query = ref<string>("");
const used = ref<boolean>(false);
const inUse = ref<boolean>(false);
const notUsed = ref<boolean>(false);
const notInUse = ref<boolean>(false);
let quotes = ref<Quote[]>([]);

const filteredQuotes = computed(() => {
    let values = quotes.value.sort((a, b) => a.id - b.id);

    if (query.value) {
        values = values.filter(
            (quote) =>
                quote.quote.toLowerCase().indexOf(query.value.toLowerCase()) !==
                    -1 ||
                quote.quotee
                    .toLowerCase()
                    .indexOf(query.value.toLowerCase()) !== -1 ||
                quote.media.toLowerCase().indexOf(query.value.toLowerCase()) !==
                    -1,
        );
    }

    if (used.value && !notUsed.value) {
        values = values.filter((quote) => quote.used === true);
    }

    if (inUse.value && !notInUse.value) {
        values = values.filter((quote) => quote.inUse === true);
    }

    if (notUsed.value && !used.value) {
        values = values.filter((quote) => quote.used === false);
    }

    if (notInUse.value && !inUse.value) {
        values = values.filter((quote) => quote.inUse === false);
    }

    return values;
});

const filterModal = ref<boolean>(false);

// const editModal = ref<boolean>(false);
// const editModalQuote = ref<Quote | null>(null);

const addModal = ref<boolean>(false);
const addModalQuote = ref<Quote>({
    id: quotes.value.length,
    quote: "",
    quotee: "",
    media: "",
    used: false,
    inUse: false,
} as Quote);
const addQuoteAction = async () => {
    addQuote(addModalQuote.value);
    await updateQuotes();

    addModal.value = false;
    addModalQuote.value = {
        id: quotes.value.length,
        quote: "",
        quotee: "",
        media: "",
        used: false,
        inUse: false,
    };
};

const markInUse = async (quote: Quote) => {
    const inUseQuote = quotes.value.find((quote) => quote.inUse === true);
    if (inUseQuote) {
        switchInUseQuote(quote.id, inUseQuote.id);
    } else {
        switchInUseQuote(quote.id);
    }

    navigator.clipboard.writeText(quote.quote);
    await updateQuotes();
};

// Hotkeys
const hotkeys = ref<HotKey[]>([
    {
        keys: ["/"],
        preventDefault: false,
        handler() {
            if (
                document.activeElement?.tagName.toLowerCase().trim() !== "input"
            ) {
                filterModal.value = true;
            }
        },
    },
    {
        keys: ["shift", "space"],
        preventDefault: true,
        handler() {
            addModal.value = true;
        },
    },
    {
        keys: ["="],
        preventDefault: false,
        handler() {
            if (
                document.activeElement?.tagName.toLowerCase().trim() !== "input"
            ) {
                toggleDark();
            }
        },
    },
]);
useHotkey(hotkeys.value);

// Autocompletion
const quotees = computed(() =>
    Array.from(new Set(quotes.value.map((quote) => quote.quotee))),
);
const quoteeSearch = computed(() =>
    addModalQuote.value.quotee === ""
        ? quotees.value
        : quotees.value.filter((quotee) =>
              quotee
                  .toLowerCase()
                  .includes(addModalQuote.value.quotee.toLowerCase()),
          ),
);

const mediaValues = computed(() =>
    Array.from(new Set(quotes.value.map((quote) => quote.media))),
);
const mediaSearch = computed(() =>
    addModalQuote.value.media === ""
        ? mediaValues.value
        : mediaValues.value.filter((media) =>
              media
                  .toLowerCase()
                  .includes(addModalQuote.value.media.toLowerCase()),
          ),
);

onBeforeMount(async () => await updateQuotes());
</script>

<template>
    <div class="py-8 sm:py-10 sm:px-6 lg:px-8">
        <header>
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex-1 flex flex-col">
                    <h2
                        class="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate mb-0.5"
                    >
                        Status Quotes
                    </h2>
                    <div
                        class="text-sm text-gray-500 dark:text-gray-400 flex items-start sm:items-center flex-col sm:flex-row flex-wrap mt-0 sm:space-x-2"
                    >
                        <div
                            class="mt-3 sm:mt-2 flex"
                            v-text="
                                `${
                                    quotes.filter((quote) => quote.used).length
                                } used`
                            "
                        />

                        <span class="mt-2 hidden sm:flex" v-text="`•`" />

                        <div
                            class="mt-0.5 sm:mt-2 flex"
                            v-text="
                                `${
                                    quotes.filter(
                                        (quote) => !quote.used && !quote.inUse,
                                    ).length
                                } unused`
                            "
                        />

                        <span
                            v-if="filteredQuotes.length < quotes.length"
                            class="mt-2 hidden sm:flex"
                            v-text="`•`"
                        />

                        <div
                            v-if="filteredQuotes.length < quotes.length"
                            class="mt-0.5 sm:mt-2 flex"
                            v-text="`${filteredQuotes.length} filtered`"
                        />
                    </div>
                </div>

                <div
                    class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
                >
                    <button
                        type="button"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2"
                        :class="[theme.RING, theme.DARK_RING]"
                        @click="filterModal = true"
                    >
                        Filter
                    </button>

                    <button
                        type="button"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2"
                        :class="[
                            theme.BG,
                            theme.DARK_BG,
                            theme.HOVER_BG,
                            theme.DARK_HOVER_BG,
                            theme.RING,
                            theme.DARK_RING,
                        ]"
                        @click="addModal = true"
                    >
                        Add
                    </button>
                </div>
            </div>
        </header>
        <main>
            <div class="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                <QuoteCard
                    v-for="quote in filteredQuotes"
                    :key="quote.id"
                    :quote="quote"
                    :class="[
                        !quote.used && adminUser ? 'hover:cursor-pointer' : '',
                        !quote.used
                            ? 'hover:ring ring-gray-100 dark:ring-gray-800'
                            : '',
                        quote.inUse ? 'ring' : '',
                        quote.inUse ? theme.RING : '',
                        quote.inUse ? theme.DARK_RING : '',
                    ]"
                    :title="!quote.used ? 'Click to copy' : null"
                    @click="!quote.used && adminUser ? markInUse(quote) : null"
                />
            </div>

            <div class="mt-10 flex justify-center space-x-4">
                <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2"
                    :class="[
                        theme.BG,
                        theme.DARK_BG,
                        theme.HOVER_BG,
                        theme.DARK_HOVER_BG,
                        theme.RING,
                        theme.DARK_RING,
                    ]"
                    @click="addModal = true"
                >
                    Add Quote
                </button>

                <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2"
                    :class="[
                        theme.BG,
                        theme.DARK_BG,
                        theme.HOVER_BG,
                        theme.DARK_HOVER_BG,
                        theme.RING,
                        theme.DARK_RING,
                    ]"
                    @click="() => toggleDark()"
                >
                    Switch Theme
                </button>

                <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 ring-red-600"
                    @click="emit('logout')"
                >
                    Logout
                </button>
            </div>

            <TransitionRoot appear :show="filterModal" as="template">
                <Dialog as="div" @close="filterModal = false">
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
                                        class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100 flex"
                                    >
                                        <span class="flex-1"> Filter </span>
                                        <span
                                            class="hover:cursor-pointer"
                                            @click="filterModal = false"
                                            v-html="feather.icons.x.toSvg()"
                                        />
                                    </DialogTitle>
                                    <div
                                        class="my-4 space-y-2 text-gray-500 dark:text-gray-400"
                                    >
                                        <div class="flex pt-1">
                                            <input
                                                v-model="query"
                                                type="text"
                                                class="w-full text-white p-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 px-3"
                                                :class="[
                                                    theme.RING,
                                                    theme.DARK_RING,
                                                ]"
                                                placeholder="Query..."
                                            />
                                        </div>

                                        <div class="space-y-2 px-3">
                                            <div class="flex pt-1">
                                                <span class="flex-grow">
                                                    Used
                                                </span>
                                                <input
                                                    v-model="used"
                                                    type="checkbox"
                                                    class="flew-grow-0 inline-block"
                                                    :disabled="notUsed"
                                                />
                                            </div>

                                            <div class="flex pt-1">
                                                <span class="flex-grow">
                                                    In Use
                                                </span>
                                                <input
                                                    v-model="inUse"
                                                    type="checkbox"
                                                    class="flew-grow-0 inline-block"
                                                    :disabled="
                                                        notInUse || notUsed
                                                    "
                                                />
                                            </div>

                                            <div class="flex pt-1">
                                                <span class="flex-grow">
                                                    Not Used
                                                </span>
                                                <input
                                                    v-model="notUsed"
                                                    type="checkbox"
                                                    class="flew-grow-0 inline-block"
                                                    :disabled="used"
                                                />
                                            </div>

                                            <div class="flex pt-1">
                                                <span class="flex-grow">
                                                    Not In Use
                                                </span>
                                                <input
                                                    v-model="notInUse"
                                                    type="checkbox"
                                                    class="flew-grow-0 inline-block"
                                                    :disabled="inUse || used"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-4">
                                        <button
                                            type="button"
                                            class="w-full inline-flex justify-center px-4 py-2 text-sm text-white dark:text-black font-medium border border-transparent rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            :class="[
                                                theme.BG,
                                                theme.DARK_BG,
                                                theme.HOVER_BG,
                                                theme.DARK_HOVER_BG,
                                                theme.RING,
                                                theme.DARK_RING,
                                            ]"
                                            @click="
                                                query = '';
                                                used = false;
                                                inUse = false;
                                                notInUse = false;
                                                notUsed = false;
                                            "
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </TransitionRoot>

            <TransitionRoot appear :show="addModal" as="template">
                <Dialog as="div" @close="addModal = false">
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
                                    class="inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-lg"
                                >
                                    <DialogTitle
                                        as="h3"
                                        class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100 flex"
                                    >
                                        <span class="flex-1"> Add </span>
                                        <span
                                            class="hover:cursor-pointer"
                                            @click="addModal = false"
                                            v-html="feather.icons.x.toSvg()"
                                        />
                                    </DialogTitle>
                                    <div
                                        class="my-4 space-y-2 text-gray-500 dark:text-gray-400"
                                    >
                                        <div class="flex pt-1">
                                            <input
                                                v-model="addModalQuote.quote"
                                                type="text"
                                                class="w-full text-white p-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 px-3"
                                                :class="[
                                                    theme.RING,
                                                    theme.DARK_RING,
                                                ]"
                                                placeholder="Quote..."
                                            />
                                        </div>

                                        <div class="pt-1">
                                            <Combobox
                                                v-model="addModalQuote.quotee"
                                            >
                                                <div class="w-full relative">
                                                    <div
                                                        class="w-full text-left bg-gray-100 dark:bg-gray-800 rounded-md shadow-md cursor-default focus:outline-none focus:ring-2"
                                                        :class="[
                                                            theme.RING,
                                                            theme.DARK_RING,
                                                        ]"
                                                    >
                                                        <ComboboxInput
                                                            class="rounded-md w-full bg-gray-100 dark:bg-gray-800 border-none py-2 pl-3 pr-10 leading-5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                                                            :class="[
                                                                theme.RING,
                                                                theme.DARK_RING,
                                                            ]"
                                                            placeholder="Quotee..."
                                                            @change="
                                                                addModalQuote.quotee =
                                                                    $event.target.value
                                                            "
                                                        />
                                                    </div>
                                                    <TransitionRoot
                                                        leave="transition ease-in duration-100"
                                                        leave-from="opacity-100"
                                                        leave-to="opacity-0"
                                                    >
                                                        <ComboboxOptions
                                                            class="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-gray-100 dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black dark:text-white ring-opacity-5 focus:outline-none sm:text-sm"
                                                        >
                                                            <div
                                                                v-if="
                                                                    quoteeSearch.length ===
                                                                        0 &&
                                                                    addModalQuote.quotee !==
                                                                        ''
                                                                "
                                                                class="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-300"
                                                            >
                                                                No results
                                                            </div>

                                                            <ComboboxOption
                                                                v-for="quotee in quoteeSearch"
                                                                :key="quotee"
                                                                v-slot="{
                                                                    selected,
                                                                    active,
                                                                }"
                                                                as="template"
                                                                :value="quotee"
                                                            >
                                                                <li
                                                                    class="cursor-default select-none relative py-2 px-4"
                                                                    :class="[
                                                                        active
                                                                            ? `text-white ${theme.BG} ${theme.DARK_BG}`
                                                                            : 'text-gray-900 dark:text-gray-100',

                                                                        selected
                                                                            ? 'ring-2 ring-pink-500'
                                                                            : '',
                                                                    ]"
                                                                >
                                                                    <span
                                                                        class="block truncate"
                                                                        :class="{
                                                                            'font-medium':
                                                                                selected,
                                                                            'font-normal':
                                                                                !selected,
                                                                        }"
                                                                        v-text="
                                                                            quotee
                                                                        "
                                                                    />
                                                                </li>
                                                            </ComboboxOption>
                                                        </ComboboxOptions>
                                                    </TransitionRoot>
                                                </div>
                                            </Combobox>
                                        </div>

                                        <div class="pt-1">
                                            <Combobox
                                                v-model="addModalQuote.media"
                                            >
                                                <div class="w-full relative">
                                                    <div
                                                        class="w-full text-left bg-gray-100 dark:bg-gray-800 rounded-md shadow-md cursor-default focus:outline-none focus:ring-2"
                                                        :class="[
                                                            theme.RING,
                                                            theme.DARK_RING,
                                                        ]"
                                                    >
                                                        <ComboboxInput
                                                            class="rounded-md w-full bg-gray-100 dark:bg-gray-800 border-none py-2 pl-3 pr-10 leading-5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2"
                                                            :class="[
                                                                theme.RING,
                                                                theme.DARK_RING,
                                                            ]"
                                                            placeholder="Media..."
                                                            @change="
                                                                addModalQuote.media =
                                                                    $event.target.value
                                                            "
                                                        />
                                                    </div>
                                                    <TransitionRoot
                                                        leave="transition ease-in duration-100"
                                                        leave-from="opacity-100"
                                                        leave-to="opacity-0"
                                                    >
                                                        <ComboboxOptions
                                                            class="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-gray-100 dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black dark:text-white ring-opacity-5 focus:outline-none sm:text-sm"
                                                        >
                                                            <div
                                                                v-if="
                                                                    mediaSearch.length ===
                                                                        0 &&
                                                                    addModalQuote.media !==
                                                                        ''
                                                                "
                                                                class="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-300"
                                                            >
                                                                No results
                                                            </div>

                                                            <ComboboxOption
                                                                v-for="media in mediaSearch"
                                                                :key="media"
                                                                v-slot="{
                                                                    selected,
                                                                    active,
                                                                }"
                                                                as="template"
                                                                :value="media"
                                                            >
                                                                <li
                                                                    class="cursor-default select-none relative py-2 px-4"
                                                                    :class="[
                                                                        active
                                                                            ? `text-white ${theme.BG} ${theme.DARK_BG}`
                                                                            : 'text-gray-900 dark:text-gray-100',

                                                                        selected
                                                                            ? 'ring-2 ring-pink-500'
                                                                            : '',
                                                                    ]"
                                                                >
                                                                    <span
                                                                        class="block truncate"
                                                                        :class="{
                                                                            'font-medium':
                                                                                selected,
                                                                            'font-normal':
                                                                                !selected,
                                                                        }"
                                                                        v-text="
                                                                            media
                                                                        "
                                                                    />
                                                                </li>
                                                            </ComboboxOption>
                                                        </ComboboxOptions>
                                                    </TransitionRoot>
                                                </div>
                                            </Combobox>
                                        </div>
                                    </div>

                                    <div class="mt-4">
                                        <button
                                            v-if="
                                                addModalQuote.quote.trim() !==
                                                    '' &&
                                                addModalQuote.quotee.trim() !==
                                                    '' &&
                                                addModalQuote.media.trim() !==
                                                    ''
                                            "
                                            type="button"
                                            class="w-full inline-flex justify-center px-4 py-2 text-sm text-white dark:text-black font-medium border border-transparent rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            :class="[
                                                theme.BG,
                                                theme.DARK_BG,
                                                theme.HOVER_BG,
                                                theme.DARK_HOVER_BG,
                                                theme.RING,
                                                theme.DARK_RING,
                                            ]"
                                            @click="addQuoteAction"
                                        >
                                            Add Quote
                                        </button>
                                    </div>
                                </div>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </TransitionRoot>
        </main>
    </div>
</template>
