import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { fetchServiceBySlug, fetchServices } from "@/services/service-service";

// Client-side service data (e.g. for widgets that load after the page).
// Pages themselves fetch on the server so they are indexed and cached.
export const useServices = (params = {}) => {
  const locale = useLocale();
  return useQuery({
    queryKey: ["services", locale, params],
    queryFn: () => fetchServices(locale, params),
  });
};

export const useService = (slug) => {
  const locale = useLocale();
  return useQuery({
    queryKey: ["services", locale, slug],
    queryFn: () => fetchServiceBySlug(slug, locale),
    enabled: !!slug,
  });
};
