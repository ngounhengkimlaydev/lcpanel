import { defineStore } from "pinia";
import type { PermissionItem, UserData, UserType } from "~/types";

export const useUserStore = defineStore("user", () => {
  const api = useApiFetch();

  const token = useCookie<string | null>("token", {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: false,
  });

  const user = useCookie<UserData | null>("user", {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: false,
    default: () => null,
  });
  
  const userTypes = ref<UserType[]>([]);
  const permissions = ref<string[]>([]);
  const roles = ref<string[]>([]);

  const isAuthenticated = computed(() => !!token.value);

  const role = computed(() => {
    return (
      user.value?.role?.role_name ||
      user.value?.role ||
      user.value?.role_key ||
      user.value?.user_role ||
      user.value?.user_type?.type ||
      roles.value?.[0] ||
      null
    );
  });

  const isSuperAdmin = computed(() => {
    return role.value === "super_admin" || role.value === "SUPER_ADMIN";
  });

  const setData = (payload: {
    token?: string | null;
    user?: UserData | null;
    roles?: string[];
    permissions?: string[];
    userTypes?: UserType[];
  }) => {
    if ("token" in payload) {
      token.value = payload.token || null;
    }

    if ("user" in payload) {
      user.value = payload.user || null;
    }

    roles.value =
      payload.roles ||
      payload.user?.roles ||
      (payload.user?.role ? [payload.user.role] : []) ||
      [];

    permissions.value = payload.permissions || payload.user?.permissions || [];
    userTypes.value = payload.userTypes || [];
  };

  const initStore = async () => {
    if (!token.value) {
      setData({
        token: null,
        user: null,
        roles: [],
        permissions: [],
        userTypes: [],
      });
      return null;
    }

    if (user.value) {
      setData({
        token: token.value,
        user: user.value,
        roles: user.value.roles || [],
        permissions: user.value.permissions || [],
        userTypes: userTypes.value || [],
      });
    }

    try {
      const res: any = await api.post("/auth/me");

      setData({
        token: token.value,
        user: res.user || res,
        roles: res.roles || res.user?.roles || [],
        permissions: res.permissions || res.user?.permissions || [],
        userTypes: res.user_type_all || [],
      });

      return res;
    } catch (error) {
      setData({
        token: null,
        user: null,
        roles: [],
        permissions: [],
        userTypes: [],
      });

      return null;
    }
  };

  const login = async (form: { username: string; password: string }) => {
    const res: any = await api.post("/auth/login", form);

    setData({
      token: res.access_token || res.token || null,
      user: res.user || null,
      roles: res.roles || res.user?.roles || [],
      permissions: res.permissions || res.user?.permissions || [],
      userTypes: res.user_type_all || [],
    });

    return res;
  };

  const logout = () => {
    setData({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      userTypes: [],
    });

    return navigateTo("/login");
  };

  const hasRole = (roleKey: string) => {
    return roles.value.includes(roleKey) || role.value === roleKey;
  };

  const hasPermission = (permission: string) => {
    if (isSuperAdmin.value) return true;
    return permissions.value.includes(permission);
  };

  return {
    token,
    user,
    roles,
    role,
    permissions,
    isSuperAdmin,
    isAuthenticated,
    userTypes,
    setData,
    initStore,
    login,
    logout,
    hasRole,
    hasPermission,
  };
});
