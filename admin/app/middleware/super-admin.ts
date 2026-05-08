export default defineNuxtRouteMiddleware(() => {
  const user = useUserStore()

  if (user.role !== 'Super Admin') {
    return navigateTo('/403')
  }
})