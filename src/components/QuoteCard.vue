<script setup lang="ts">
import type { Quote } from "../models/quotes";

const props = defineProps<{
    quote: Quote;
}>();
</script>

<template>
    <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow text-gray-500 dark:text-gray-400"
    >
        <div class="w-full items-center justify-between p-6">
            <div class="flex-1">
                <span
                    v-if="props.quote.used"
                    class="mt-1 ml-1 float-right px-2 py-0.5 text-black dark:text-white text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                    Used
                </span>

                <h3
                    class="text-gray-900 dark:text-white text-md font-medium"
                    v-text="props.quote.quote"
                />
                <p
                    class="mt-2 text-sm whitespace-normal"
                    v-text="props.quote.quotee"
                />
                <p
                    class="mt-0.5 text-sm whitespace-normal"
                    v-text="props.quote.media"
                />
            </div>
        </div>
    </div>
</template>
