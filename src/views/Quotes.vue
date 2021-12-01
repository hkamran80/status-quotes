<script setup lang="ts">
import { ref } from "vue";
import { computed } from "@vue/reactivity";
import { useTitle } from "@vueuse/core";
import { useRouter } from "vue-router";
import featherIcons from "feather-icons";

import { AuthStateModel } from "../utils/useAuth0";
import { addQuote, getQuotes, switchInUseQuote } from "../utils/database";
import { theme } from "../utils/theming";
import { Quote } from "../models/quotes";

const { push } = useRouter();
const props = defineProps<{ authState: AuthStateModel }>();
const emit = defineEmits<{ (e: "logout"): void }>();

useTitle("Status Quotes");

if (!props.authState.isAuthenticated) {
    push({ name: "Login" });
}

const adminUser = props.authState.isAuthenticated
    ? (import.meta.env.VITE_ADMIN_USERS as string)
          .split(",")
          .indexOf(props.authState.user.sub) !== -1
    : false;

const updateQuotes = () =>
    getQuotes()
        .then((quotesList) => {
            quotes.value = quotesList as Quote[];
            addModalQuote.value.id = quotes.value.length;
        })
        .catch(console.error);

const query = ref<string>("");
const used = ref<boolean>(false);
const inUse = ref<boolean>(false);
const notUsed = ref<boolean>(false);
const notInUse = ref<boolean>(false);
let quotes = ref<Quote[]>([]);
updateQuotes();

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
                    -1
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
const filterModalClickAway = () =>
    filterModal.value ? (filterModal.value = false) : null;

const editModal = ref<boolean>(false);
const editModalQuote = ref<Quote | null>(null);
const editModalClickAway = () =>
    editModal.value ? (editModal.value = false) : null;

const addModal = ref<boolean>(false);
const addModalQuote = ref<Quote>({
    id: quotes.value.length,
    quote: "",
    quotee: "",
    media: "",
    used: false,
    inUse: false,
} as Quote);
const addModalClickAway = () =>
    addModal.value ? (addModal.value = false) : null;

const addQuoteAction = () => {
    addQuote(addModalQuote.value);
    updateQuotes();

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

const markInUse = (quote: Quote) => {
    const inUseQuote = quotes.value.find((quote) => quote.inUse === true);
    if (inUseQuote) {
        switchInUseQuote(quote.id, inUseQuote.id);
    } else {
        switchInUseQuote(quote.id);
    }

    navigator.clipboard.writeText(quote.quote);
    updateQuotes();
};

const feather = featherIcons;
</script>

<template>
    <div class="py-10">
        <header>
            <div
                class="
                    max-w-7xl
                    mx-auto
                    px-4
                    sm:px-6
                    lg:px-8 lg:flex lg:items-center lg:justify-between
                "
            >
                <div class="flex-1 min-w-0">
                    <h2
                        class="
                            text-2xl
                            font-bold
                            leading-7
                            text-gray-900
                            dark:text-white
                            sm:text-3xl sm:truncate
                        "
                    >
                        Status Quotes
                    </h2>
                    <div
                        class="
                            text-sm text-gray-500
                            dark:text-gray-400
                            flex
                            items-center
                            flex-row flex-wrap
                            mt-0
                            space-x-2
                        "
                    >
                        <div
                            class="mt-2 flex items-center"
                            v-text="
                                `${
                                    quotes.filter((quote) => quote.used).length
                                } used`
                            "
                        ></div>

                        <span
                            class="mt-2 flex items-center"
                            v-text="`•`"
                        ></span>

                        <div
                            class="mt-2 flex items-center"
                            v-text="
                                `${
                                    quotes.filter(
                                        (quote) => !quote.used && !quote.inUse
                                    ).length
                                } unused`
                            "
                        ></div>

                        <span
                            class="mt-2 flex items-center"
                            v-text="`•`"
                            v-if="filteredQuotes.length < quotes.length"
                        ></span>

                        <div
                            class="mt-2 flex items-center"
                            v-text="`${filteredQuotes.length} filtered`"
                            v-if="filteredQuotes.length < quotes.length"
                        ></div>
                    </div>
                </div>
                <div class="mt-5 flex lg:mt-0 lg:ml-4">
                    <span class="ml-3">
                        <button
                            type="button"
                            class="
                                inline-flex
                                items-center
                                px-4
                                py-2
                                border border-gray-300
                                dark:border-gray-700
                                rounded-md
                                shadow-sm
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-300
                                bg-white
                                dark:bg-gray-900
                                hover:bg-gray-50
                                dark:hover:bg-gray-800
                                focus:outline-none focus:ring-2
                            "
                            :class="[theme.RING, theme.DARK_RING]"
                            @click="filterModal = true"
                        >
                            Filter
                        </button>
                    </span>

                    <span class="sm:ml-3">
                        <button
                            type="button"
                            class="
                                inline-flex
                                items-center
                                px-4
                                py-2
                                border border-transparent
                                rounded-md
                                shadow-sm
                                text-sm
                                font-medium
                                text-white
                                focus:outline-none focus:ring-2
                            "
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
                    </span>
                </div>
            </div>
        </header>
        <main>
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="px-4 py-8 sm:px-0">
                    <div class="flex flex-col max-w-7xl">
                        <div class="-my-2 sm:-mx-6 lg:-mx-8">
                            <div
                                class="
                                    py-2
                                    align-middle
                                    inline-block
                                    min-w-full
                                    sm:px-6
                                    lg:px-8
                                "
                            >
                                <div
                                    class="
                                        shadow
                                        border-b border-gray-200
                                        dark:border-gray-800
                                        sm:rounded-lg
                                    "
                                >
                                    <table
                                        class="
                                            min-w-full
                                            divide-y divide-gray-200
                                            dark:divide-gray-800
                                            overflow-x-auto
                                        "
                                    >
                                        <thead
                                            class="bg-gray-50 dark:bg-gray-900"
                                        >
                                            <tr>
                                                <th
                                                    scope="col"
                                                    class="
                                                        px-6
                                                        py-3
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    Quote
                                                </th>

                                                <th
                                                    scope="col"
                                                    class="
                                                        px-6
                                                        py-3
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    Quotee
                                                </th>

                                                <th
                                                    scope="col"
                                                    class="
                                                        px-6
                                                        py-3
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    Media
                                                </th>

                                                <th
                                                    scope="col"
                                                    class="
                                                        px-6
                                                        py-3
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    Used
                                                </th>

                                                <th
                                                    scope="col"
                                                    class="
                                                        px-6
                                                        py-3
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    In Use
                                                </th>

                                                <th
                                                    scope="col"
                                                    class="
                                                        text-left text-xs
                                                        font-medium
                                                        text-gray-500
                                                        dark:text-gray-400
                                                        uppercase
                                                        tracking-wider
                                                    "
                                                >
                                                    Copy
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody x-max="2">
                                            <tr
                                                class="
                                                    bg-white
                                                    dark:bg-gray-900
                                                "
                                                v-for="quote in filteredQuotes"
                                                :key="quote.quote"
                                            >
                                                <td
                                                    class="
                                                        px-6
                                                        py-4
                                                        text-sm
                                                        font-medium
                                                        text-gray-900
                                                        dark:text-gray-300
                                                    "
                                                    v-text="quote.quote"
                                                />
                                                <td
                                                    class="
                                                        px-6
                                                        py-4
                                                        text-sm text-gray-500
                                                        dark:text-gray-400
                                                    "
                                                    v-text="quote.quotee"
                                                />
                                                <td
                                                    class="
                                                        px-6
                                                        py-4
                                                        text-sm text-gray-500
                                                        dark:text-gray-400
                                                    "
                                                    v-text="quote.media"
                                                />
                                                <td
                                                    class="
                                                        px-6
                                                        py-4
                                                        text-sm text-gray-500
                                                        dark:text-gray-400
                                                    "
                                                    v-html="
                                                        quote.used
                                                            ? feather.icons.check.toSvg()
                                                            : feather.icons.x.toSvg()
                                                    "
                                                />
                                                <td
                                                    class="
                                                        px-6
                                                        py-4
                                                        text-sm text-gray-500
                                                        dark:text-gray-400
                                                    "
                                                    v-html="
                                                        quote.inUse
                                                            ? feather.icons.check.toSvg()
                                                            : feather.icons.x.toSvg()
                                                    "
                                                />
                                                <td
                                                    class="
                                                        pl-2
                                                        pr-6
                                                        py-4
                                                        text-sm
                                                    "
                                                    :class="{
                                                        'text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-500 cursor-pointer':
                                                            !quote.used &&
                                                            adminUser,
                                                        'text-gray-500 dark:text-gray-400':
                                                            quote.used ||
                                                            !adminUser,
                                                    }"
                                                    v-html="
                                                        feather.icons.clipboard.toSvg()
                                                    "
                                                    @click="
                                                        !quote.used && adminUser
                                                            ? markInUse(quote)
                                                            : null
                                                    "
                                                />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10 flex justify-center">
                        <button
                            type="button"
                            class="
                                inline-flex
                                items-center
                                px-4
                                py-2
                                border border-gray-300
                                dark:border-gray-700
                                rounded-md
                                shadow-sm
                                text-sm
                                font-medium
                                text-white
                                bg-red-600
                                hover:bg-red-700
                                focus:outline-none focus:ring-2
                                ring-red-600
                            "
                            @click="emit('logout')"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div
                v-if="filterModal"
                class="
                    overflow-auto
                    absolute
                    inset-0
                    z-10
                    flex
                    items-center
                    justify-center
                    bg-black bg-opacity-50
                "
            >
                <div
                    class="
                        bg-gray-800 bg-opacity-90
                        text-white
                        w-11/12
                        md:max-w-xl
                        mx-auto
                        rounded-lg
                        shadow-lg
                        py-4
                        text-left
                        px-6
                    "
                    v-click-away="filterModalClickAway"
                >
                    <div class="flex justify-between items-center pb-3">
                        <p class="text-2xl font-bold">Filter</p>

                        <div
                            class="cursor-pointer z-50"
                            @click="filterModal = false"
                            v-html="feather.icons.x.toSvg()"
                        />
                    </div>

                    <div class="mt-1 mb-2 space-y-4">
                        <div class="flex pt-1">
                            <input
                                type="text"
                                class="
                                    w-full
                                    text-white
                                    p-2
                                    bg-gray-900
                                    rounded-md
                                    focus:outline-none focus:ring-2
                                "
                                :class="[theme.RING, theme.DARK_RING]"
                                placeholder="Query..."
                                v-model="query"
                            />
                        </div>

                        <div class="flex pt-1">
                            <span class="flex-grow"> Used </span>
                            <input
                                type="checkbox"
                                class="flew-grow-0 inline-block"
                                v-model="used"
                                :disabled="notUsed"
                            />
                        </div>

                        <div class="flex pt-1">
                            <span class="flex-grow"> In Use </span>
                            <input
                                type="checkbox"
                                class="flew-grow-0 inline-block"
                                v-model="inUse"
                                :disabled="notInUse || notUsed"
                            />
                        </div>

                        <div class="flex pt-1">
                            <span class="flex-grow"> Not Used </span>
                            <input
                                type="checkbox"
                                class="flew-grow-0 inline-block"
                                v-model="notUsed"
                                :disabled="used"
                            />
                        </div>

                        <div class="flex pt-1">
                            <span class="flex-grow"> Not In Use </span>
                            <input
                                type="checkbox"
                                class="flew-grow-0 inline-block"
                                v-model="notInUse"
                                :disabled="inUse || used"
                            />
                        </div>

                        <button
                            type="button"
                            class="
                                w-full
                                text-center
                                justify-center
                                inline-flex
                                items-center
                                px-4
                                py-2
                                border border-transparent
                                rounded-md
                                shadow-sm
                                text-sm
                                font-medium
                                text-white
                                focus:outline-none focus:ring-2
                            "
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
            </div>

            <div
                v-if="addModal"
                class="
                    overflow-auto
                    absolute
                    inset-0
                    z-10
                    flex
                    items-center
                    justify-center
                    bg-black bg-opacity-50
                "
            >
                <div
                    class="
                        bg-gray-800 bg-opacity-90
                        text-white
                        w-11/12
                        md:max-w-xl
                        mx-auto
                        rounded-lg
                        shadow-lg
                        py-4
                        text-left
                        px-6
                    "
                    v-click-away="addModalClickAway"
                >
                    <div class="flex justify-between items-center pb-3">
                        <p class="text-2xl font-bold">Add</p>

                        <div
                            class="cursor-pointer z-50"
                            @click="addModal = false"
                            v-html="feather.icons.x.toSvg()"
                        />
                    </div>

                    <div class="mt-1 mb-2 space-y-4">
                        <div class="flex pt-1">
                            <input
                                type="text"
                                class="
                                    w-full
                                    text-white
                                    p-2
                                    bg-gray-900
                                    rounded-md
                                    focus:outline-none focus:ring-2
                                "
                                :class="[theme.RING, theme.DARK_RING]"
                                placeholder="Quote..."
                                v-model="addModalQuote.quote"
                            />
                        </div>

                        <div class="flex pt-1">
                            <input
                                type="text"
                                class="
                                    w-full
                                    text-white
                                    p-2
                                    bg-gray-900
                                    rounded-md
                                    focus:outline-none focus:ring-2
                                "
                                :class="[theme.RING, theme.DARK_RING]"
                                placeholder="Quotee..."
                                v-model="addModalQuote.quotee"
                            />
                        </div>

                        <div class="flex pt-1">
                            <input
                                type="text"
                                class="
                                    w-full
                                    text-white
                                    p-2
                                    bg-gray-900
                                    rounded-md
                                    focus:outline-none focus:ring-2
                                "
                                :class="[theme.RING, theme.DARK_RING]"
                                placeholder="Media..."
                                v-model="addModalQuote.media"
                            />
                        </div>

                        <button
                            type="button"
                            class="
                                w-full
                                text-center
                                justify-center
                                inline-flex
                                items-center
                                px-4
                                py-2
                                border border-transparent
                                rounded-md
                                shadow-sm
                                text-sm
                                font-medium
                                text-white
                                focus:outline-none focus:ring-2
                            "
                            :class="[
                                theme.BG,
                                theme.DARK_BG,
                                theme.HOVER_BG,
                                theme.DARK_HOVER_BG,
                                theme.RING,
                                theme.DARK_RING,
                            ]"
                            @click="addQuoteAction"
                            v-if="
                                addModalQuote.quote.trim() !== '' &&
                                addModalQuote.quotee.trim() !== '' &&
                                addModalQuote.media.trim() !== ''
                            "
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
