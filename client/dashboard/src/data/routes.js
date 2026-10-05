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
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
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
  {
    title: "Enquiries",
    url: "/enquiries?page=1&limit=10",
    icon: MessageSquare,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Edit",
        url: "/enquiries/:id/edit",
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
    title: "Profile Overview",
    url: "/profile",
    icon: User,
    roles: [],
    isVisible: true,
    items: [],
  },
];

export const publicRoutes = ["/", "/admin", "/register", "/accept-invite"];
