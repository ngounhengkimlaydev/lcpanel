type ApiOptions = Parameters<typeof $fetch>[1];
type ApiMethod = NonNullable<ApiOptions>["method"];

export type PaginationParams = {
  page?: number;
  table_size?: number;
  filter?: string | Record<string, any>;
  sort_by?: string;
  sort_type?: "asc" | "desc";
};

export const useApiFetch = () => {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("token");
  const toast = useToast();
  const apiLoading = useApiLoading();

  const request = async <T = any>(
    url: string,
    method: ApiMethod,
    body?: any,
    options: ApiOptions = {},
    isLoading: boolean = true,
  ): Promise<T> => {
    if (isLoading) {
      apiLoading.start();
    }

    try {
      const headers: Record<string, string> = {
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      };

      return (await $fetch<T>(url, {
        baseURL: config.public.apiBase as string,
        method,
        body,
        ...options,
        headers,
      })) as Promise<T>;
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.response?._data?.message ||
        error?.message ||
        "Something went wrong";

      toast.add({
        title: "Error",
        description: Array.isArray(message) ? message[0] : message,
        color: "error",
      });

      throw error;
    } finally {
      apiLoading.stop();
    }
  };

  const toQuery = (params: PaginationParams = {}) => {
    return {
      page: params.page ?? 1,
      table_size: params.table_size ?? 10,
      filter:
        typeof params.filter === "object"
          ? JSON.stringify(params.filter)
          : (params.filter ?? JSON.stringify({})),
      sort_by: params.sort_by ?? "id",
      sort_type: params.sort_type ?? "desc",
    };
  };

  return {
    get: <T = any>(url: string, options?: ApiOptions, isLoading = true) =>
      request<T>(url, "GET", undefined, options, isLoading),

    paginate: <T = any>(
      url: string,
      params: PaginationParams = {},
      options: ApiOptions = {},
      isLoading = true,
    ) =>
      request<T>(
        url,
        "GET",
        undefined,
        {
          ...options,
          query: {
            ...toQuery(params),
            ...(options.query as Record<string, any>),
          },
        },
        isLoading,
      ),

    post: <T = any>(url: string, body?: any, options?: ApiOptions) =>
      request<T>(url, "POST", body, options),

    put: <T = any>(
      url: string,
      body?: any,
      options?: ApiOptions,
      isLoading = true,
    ) => request<T>(url, "PUT", body, options, isLoading),

    patch: <T = any>(
      url: string,
      body?: any,
      options?: ApiOptions,
      isLoading = true,
    ) => request<T>(url, "PATCH", body, options, isLoading),

    delete: <T = any>(url: string, options?: ApiOptions, isLoading = true) =>
      request<T>(url, "DELETE", undefined, options, isLoading),
  };
};
