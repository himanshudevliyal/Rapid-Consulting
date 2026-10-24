
import {
  FileQuestion,
  LayoutDashboard,
  User,
  Users,
  MessageSquare,
  FileText,
  BookOpen,
  UserCheck,
  Briefcase,
  Building2,
  ScrollText,
} from "lucide-react";

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const sidebarData = [
  // 1. Dashboard
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },

  // 2. Users
  {
    title: "Users",
    url: "/users?page=1&limit=10",
    icon: Users,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/users/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/users/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 3. Categories
  {
    title: "Categories",
    url: "/categories?page=1&limit=10",
    icon: Users,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/categories/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/categories/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 4. Services
  {
    title: "Services",
    url: "/services?page=1&limit=10",
    icon: Briefcase,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/services/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/services/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "Formats",
        url: "/services/format?page=1&limit=10",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Create format",
        url: "/services/format/create",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "Edit format",
        url: "/services/format/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "Family / topics",
        url: "/services/family-topic?page=1&limit=10",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Create family / topic",
        url: "/services/family-topic/create",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "Edit family / topic",
        url: "/services/family-topic/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 5. Schemes
  {
    title: "Schemes",
    url: "/schemes?page=1&limit=10",
    icon: ScrollText,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/schemes/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/schemes/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 6. Articles
  {
    title: "Articles",
    url: "/articles?page=1&limit=10",
    icon: FileText,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/articles/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/articles/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 7. Case Studies
  {
    title: "Case Studies",
    url: "/case-studies?page=1&limit=10",
    icon: BookOpen,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/case-studies/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/case-studies/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 8. Industries
  {
    title: "Industries",
    url: "/industries?page=1&limit=10",
    icon: Building2,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/industries/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/industries/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 9. Blogs
  {
    title: "Blogs",
    url: "/blogs?page=1&limit=10",
    icon: Users,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/blogs/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/blogs/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 10. Queries
  {
    title: "Queries",
    url: "/queries?page=1&limit=10",
    icon: FileQuestion,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "View",
        url: "/queries/:id",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 11. Service Enquiries
  {
    title: "Service Enquiries",
    url: "/enquiries?page=1&limit=10",
    icon: MessageSquare,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "View",
        url: "/enquiries/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 12. Contact Enquiries
  {
    title: "Contact Enquiries",
    url: "/contact-enquiries?page=1&limit=10",
    icon: MessageSquare,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "View",
        url: "/contact-enquiries/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 13. Advisers
  {
    title: "Advisers",
    url: "/advisers?page=1&limit=10",
    icon: UserCheck,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/advisers/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/advisers/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 14. Jobs
  {
    title: "Jobs",
    url: "/jobs?page=1&limit=10",
    icon: Briefcase,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/jobs/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/jobs/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },

  // 15. Profile
  {
    title: "Profile Overview",
    url: "/profile",
    icon: User,
    roles: [],
    isVisible: true,
    items: [],
  },
];

export const publicRoutes = [
  "/",
  "/admin",
  "/register",
  "/accept-invite",
];
