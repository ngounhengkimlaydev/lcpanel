export default defineNuxtRouteMiddleware(() => {
  const user = useUserStore()

  if (user.role !== 'super_admin') {
    return navigateTo('/')
  }
})