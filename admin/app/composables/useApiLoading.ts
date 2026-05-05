export const useApiLoading = () => {
  const pendingCount = useState<number>("api-loading-count", () => 0);

  const isLoading = computed(() => pendingCount.value > 0);

  const start = () => {
    pendingCount.value++;
  };

  const stop = () => {
    pendingCount.value = Math.max(0, pendingCount.value - 1);
  };

  return {
    isLoading,
    start,
    stop,
  };
};
