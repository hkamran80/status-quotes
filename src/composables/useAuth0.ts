import createAuth0Client, { Auth0Client, User } from "@auth0/auth0-spa-js";
import { ref } from "vue";

export const AuthState = ref<AuthStateModel>({
    user: null,
    loading: false,
    isAuthenticated: false,
    auth0: null,
});

const config = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
};

export const useAuth0 = (state: AuthStateModel) => {
    const handleStateChange = async () => {
        if (state.auth0) {
            state.isAuthenticated = !!(await state.auth0.isAuthenticated());
            state.user = (await state.auth0.getUser()) || null;
            state.loading = false;
        }
    };

    const initializeAuth0 = () => {
        state.loading = true;
        createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            cacheLocation: "localstorage",
            redirect_uri: window.location.origin + "/login",
            legacySameSiteCookie: false,
        })
            .then(async (auth) => {
                state.auth0 = auth;
                await handleStateChange();
            })
            .catch(console.error);
    };

    const login = async () => {
        if (state.auth0) {
            await state.auth0.loginWithPopup();
            await handleStateChange();
        }
    };

    const logout = async () => {
        if (state.auth0) {
            state.auth0.logout({
                returnTo: window.location.origin,
            });
        }
    };

    return {
        login,
        logout,
        initializeAuth0,
    };
};

// Models
export type AuthStateModel = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    auth0: Auth0Client | null;
};
