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
  CalendarDays,
  UsersRound,
  LayoutTemplate,
  Menu,
} from "lucide-react";

export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  CUSTOMER: "customer",
};

// Where a role lands after sign in (editors do not have the dashboard).
export const homeRouteForRole = (role) =>
  role === ROLES.EDITOR ? "/site-pages?page=1&limit=10" : "/dashboard";

export const sidebarData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
  {
    title: "Site pages",
    url: "/site-pages?page=1&limit=10",
    icon: LayoutTemplate,
    roles: [ROLES.ADMIN, ROLES.EDITOR],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/site-pages/create",
        roles: [ROLES.ADMIN, ROLES.EDITOR],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/site-pages/:id/edit",
        roles: [ROLES.ADMIN, ROLES.EDITOR],
        isVisible: false,
      },
    ],
  },
  {
    title: "Navigation",
    url: "/settings/navigation",
    icon: Menu,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
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


  {
    title: "Queries",
    url: "/queries?page=1&limit=10",
    icon: FileQuestion,
    roles: [ROLES.ADMIN],
    isVisible: false,
    items: [
      {
        title: "View",
        url: "/queries/:id",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
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
  {
    title: "Sessions",
    url: "/sessions?page=1&limit=10",
    icon: CalendarDays,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/sessions/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/sessions/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Community Groups",
    url: "/community-groups?page=1&limit=10",
    icon: UsersRound,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/community-groups/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/community-groups/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Profile Overview",
    url: "/profile",
    icon: User,
    roles: [],
    isVisible: true,
    items: [],
  },
];

export const publicRoutes = ["/", "/admin", "/register", "/accept-invite"];
