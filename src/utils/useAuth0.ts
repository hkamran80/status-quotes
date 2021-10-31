import createAuth0Client from "@auth0/auth0-spa-js";
import { reactive } from "vue";

export const AuthState = reactive({
    user: null,
    loading: false,
    isAuthenticated: false,
    auth0: null,
} as AuthStateModel);

const config = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
};

export const useAuth0 = (state: AuthStateModel) => {
    const handleStateChange = async () => {
        state.isAuthenticated = !!(await state.auth0.isAuthenticated());
        state.user = await state.auth0.getUser();
        state.loading = false;
    };

    const initAuth = () => {
        state.loading = true;
        createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            cacheLocation: "localstorage",
            redirect_uri: window.location.origin + "/login",
        }).then(async (auth) => {
            state.auth0 = auth;
            await handleStateChange();
        });
    };

    const login = async () => {
        await state.auth0.loginWithPopup();
        await handleStateChange();
    };

    const logout = async () => {
        state.auth0.logout({
            returnTo: window.location.origin,
        });
    };

    return {
        login,
        logout,
        initAuth,
    };
};

// Models
export interface AuthStateModel {
    user: any | null;
    loading: boolean;
    isAuthenticated: boolean;
    auth0: any | null;
}
