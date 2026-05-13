import { defineStore } from "pinia";
import type { RoleModule, UserData, UserType } from "~/types";

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
  const roles = ref<any[]>([]);
  const roleModule = ref<RoleModule[]>([]);

  const isAuthenticated = computed(() => !!token.value);

  const normalizeRole = (roleValue: any) => {
    if (!roleValue) return null;
    if (typeof roleValue === "string") return roleValue;
    return roleValue.role_name || roleValue.role_key || roleValue.name || null;
  };

  const role = computed(() => {
    return (
      user.value?.role?.role_name ||
      normalizeRole(user.value?.role) ||
      user.value?.role_key ||
      user.value?.user_role ||
      user.value?.user_type?.type ||
      normalizeRole(roles.value?.[0]) ||
      null
    );
  });

  const isSuperAdmin = computed(() => {
    return role.value === "super_admin" || role.value === "SUPER_ADMIN" || role.value === "Super Admin";
  });

  const setData = (payload: {
    token?: string | null;
    user?: UserData | null;
    roles?: any[];
    permissions?: string[];
    roleModule?: RoleModule[];
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
    roleModule.value = payload.roleModule || [];
    userTypes.value = payload.userTypes || [];
  };

  const initStore = async () => {
    if (!token.value) {
      setData({
        token: null,
        user: null,
        roles: [],
        permissions: [],
        roleModule: [],
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
        roleModule: roleModule.value || [],
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
        roleModule: res.roleModule || res.role_module || [],
        userTypes: res.user_type || [],
      });

      return res;
    } catch (error) {
      setData({
        token: null,
        user: null,
        roles: [],
        permissions: [],
        roleModule: [],
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
      roleModule: res.roleModule || res.role_module || [],
      userTypes: res.user_type || [],
    });

    return res;
  };

  const loginWithFirebase = async (idToken: string) => {
    const res: any = await api.post("/auth/login", {
      provider: "firebase",
      idToken,
    });

    setData({
      token: res.access_token || res.token || null,
      user: res.user || res.customer || null,
      roles: res.roles || res.user?.roles || [],
      permissions: res.permissions || res.user?.permissions || [],
      roleModule: res.roleModule || res.role_module || [],
      userTypes: res.user_type || [],
    });

    return res;
  };

  const registerCustomer = async (form: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    idToken?: string;
  }) => {
    const res: any = await api.post("/auth/register", form);

    setData({
      token: res.access_token || res.token || null,
      user: res.user || res.customer || null,
      roles: res.roles || [],
      permissions: res.permissions || [],
      roleModule: res.roleModule || res.role_module || [],
      userTypes: res.user_type || [],
    });

    return res;
  };

  const requestPasswordReset = async (email: string) => {
    return api.post("/auth/forgot-password", { email });
  };

  const logout = () => {
    setData({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      roleModule: [],
      userTypes: [],
    });

    return navigateTo("/login");
  };

  const hasRole = (roleKey: string) => {
    return roles.value.some((item) => normalizeRole(item) === roleKey) || role.value === roleKey;
  };

  const hasPermission = (permission: string) => {
    if (isSuperAdmin.value) return true;
    return permissions.value.includes(permission);
  };

  const hasModule = (moduleKey?: string | string[] | null) => {
    if (!moduleKey || (Array.isArray(moduleKey) && !moduleKey.length)) return true;
    if (isSuperAdmin.value) return true;

    const requestedKeys = Array.isArray(moduleKey) ? moduleKey : [moduleKey];
    const allowedKeys = new Set([
      ...permissions.value,
      ...roleModule.value.map((item) => item.module_key).filter((key): key is string => Boolean(key)),
    ]);

    return requestedKeys.some((key) => {
      return allowedKeys.has(key) || permissions.value.some((permission) => permission.startsWith(`${key}.`));
    });
  };

  return {
    token,
    user,
    roles,
    role,
    roleModule,
    permissions,
    isSuperAdmin,
    isAuthenticated,
    userTypes,
    setData,
    initStore,
    login,
    loginWithFirebase,
    registerCustomer,
    requestPasswordReset,
    logout,
    hasRole,
    hasPermission,
    hasModule,
  };
});
