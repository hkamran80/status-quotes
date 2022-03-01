import { useAuth0 } from "@auth0/auth0-vue";

export const checkAuthorization = () => {
    const { isAuthenticated, user, logout: auth0Logout } = useAuth0();

    const checkAuthorized = (redirect = true): boolean => {
        if (
            isAuthenticated.value &&
            (user.value === undefined ||
                (import.meta.env.VITE_AUTHORIZED_USERS as string)
                    .split(",")
                    .indexOf(user.value.sub as string) === -1)
        ) {
            if (redirect) {
                auth0Logout({ returnTo: window.location.origin });
            }
            return false;
        } else {
            return true;
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
