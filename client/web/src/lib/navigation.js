// Menu / home data built from the service categories API
// (GET /services/categories): each category with its services. A category's
// own "family" page (type service-family) becomes the heading link; every
// other service is listed under it. Assign a service to a category in the
// admin panel and it appears here, in the menu and on the home page.

const FAMILY = "service-family";

export function toCategoryGroups(categories = []) {
  return categories
    .map((category) => {
      const services = category.services ?? [];
      const family = services.find((service) => service.type === FAMILY) ?? null;
      const children = services.filter((service) => service.type !== FAMILY);
      return { id: category.id, title: category.title, slug: category.slug, family, services: children };
    })
    .filter((group) => group.family || group.services.length);
}
