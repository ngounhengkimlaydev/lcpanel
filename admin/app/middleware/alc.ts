export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();

  if (!userStore.isAuthenticated) {
    return navigateTo("/auth/login");
  }

  if (!userStore.user) {
    await userStore.initStore();
  }

  if (!userStore.isAuthenticated) {
    return navigateTo("/auth/login");
  }

  if (!userStore.hasModule(to.meta.moduleKey)) {
    return navigateTo("/403");
  }
});
