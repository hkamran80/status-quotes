import { useAuth0 } from "@auth0/auth0-vue";

export const checkAuthorization = () => {
    const { isAuthenticated, user, logout: auth0Logout } = useAuth0();

    const checkAuthorized = () => {
        if (
            isAuthenticated.value &&
            (import.meta.env.VITE_AUTHORIZED_USERS as string)
                .split(",")
                .indexOf(user.value.sub as string) === -1
        ) {
            auth0Logout({ returnTo: window.location.origin });
        }
    };

    const isAdminUser = (): boolean => {
        if (
            isAuthenticated.value &&
            user.value &&
            (import.meta.env.VITE_ADMIN_USERS as string)
                .split(",")
                .indexOf(user.value.sub as string) !== -1
        ) {
            return true;
        } else {
            return false;
        }
    };

    return { checkAuthorized, isAdminUser };
};
