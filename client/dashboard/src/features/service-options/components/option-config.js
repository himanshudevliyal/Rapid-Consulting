import {
  familyTopicHooks,
  formatHooks,
} from "@/hooks/use-service-options";

// Format and Family / topic are two option lists with the same screens.
// `kind` is passed from the (server) page as a plain string.
const configs = {
  format: {
    kind: "format",
    singular: "Format",
    plural: "Formats",
    basePath: "/services/format",
    description:
      "The kind of page a service is (stored in the service as its Format). The built-in formats are used by the website and cannot be deleted.",
    hasIcon: false,
    hooks: formatHooks,
  },
  "family-topic": {
    kind: "family-topic",
    singular: "Family / topic",
    plural: "Family / topics",
    basePath: "/services/family-topic",
    description:
      "The group a service belongs to, for example Subsidies & Incentives. Admins pick it by name when adding a service.",
    hasIcon: true,
    hooks: familyTopicHooks,
    hint: "To give a topic its own landing page, add a service with Format “Service family” and choose this topic.",
  },
};

export const getOptionConfig = (kind) => configs[kind] ?? configs.format;
