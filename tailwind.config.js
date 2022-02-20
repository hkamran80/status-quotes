/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const defaultTheme = require("tailwindcss/defaultTheme");

const baseLightName = process.env.VITE_COLOR_BASE_LIGHT.split("-")[0];
const baseLightNumber = Number(process.env.VITE_COLOR_BASE_LIGHT.split("-")[1]);
const baseDarkName = process.env.VITE_COLOR_BASE_DARK.split("-")[0];
const baseDarkNumber = Number(process.env.VITE_COLOR_BASE_DARK.split("-")[1]);

module.exports = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{vue,js,ts}"],
    safelist: [
        `bg-${baseLightName}-${baseLightNumber}`,
        `hover:bg-${baseLightName}-${
            baseLightNumber - 100 < 100
                ? baseLightNumber + 100
                : baseLightNumber - 100
        }`,
        `ring-${baseLightName}-${baseLightNumber}`,

        `dark:bg-${baseDarkName}-${baseDarkNumber}`,
        `dark:hover:bg-${baseDarkName}-${
            baseDarkNumber - 100 < 100
                ? baseDarkNumber + 100
                : baseDarkNumber - 100
        }`,
        `dark:ring-${baseDarkName}-${baseDarkNumber}`,
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Nunito Sans", ...defaultTheme.fontFamily.sans],
                serif: [...defaultTheme.fontFamily.serif],
                mono: [...defaultTheme.fontFamily.mono],
            },
        },
    },
    plugins: [],
};
