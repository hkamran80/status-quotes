module.exports = {
    mode: "jit",
    purge: ["./index.html", "./src/**/*.{vue,js,ts}"],
    darkMode: "media",
    theme: {
        extend: { maxWidth: { "8xl": "88rem" } },
    },
    variants: {
        extend: { backgroundColor: ["disabled"] },
    },
    plugins: [],
};
