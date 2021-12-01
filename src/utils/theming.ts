const baseLightName = (import.meta.env.VITE_COLOR_BASE_LIGHT as string).split(
    "-"
)[0];
const baseLightNumber = Number(
    (import.meta.env.VITE_COLOR_BASE_LIGHT as string).split("-")[1]
);
const baseDarkName = (import.meta.env.VITE_COLOR_BASE_DARK as string).split(
    "-"
)[0];
const baseDarkNumber = Number(
    (import.meta.env.VITE_COLOR_BASE_DARK as string).split("-")[1]
);

export const theme = {
    BG: `bg-${baseLightName}-${baseLightNumber}`,
    HOVER_BG: `hover:bg-${baseLightName}-${
        baseLightNumber - 100 < 100
            ? baseLightNumber + 100
            : baseLightNumber - 100
    }`,
    RING: `ring-${baseLightName}-${baseLightNumber}`,

    DARK_BG: `dark:bg-${baseDarkName}-${baseDarkNumber}`,
    DARK_HOVER_BG: `dark:hover:bg-${baseDarkName}-${
        baseDarkNumber - 100 < 100 ? baseDarkNumber + 100 : baseDarkNumber - 100
    }`,
    DARK_RING: `dark:ring-${baseDarkName}-${baseDarkNumber}`,
};
