"use strict";

import organizationModel from "./models/organization.model.js";
import roleModel from "./models/role.model.js";
import userOrganizationModel from "./models/user-organization.model.js";
import userModel from "./models/user.model.js";
import { sequelize } from "./postgres.js";

const User = userModel(sequelize);
const Organization = organizationModel(sequelize);
const UserOrganization = userOrganizationModel(sequelize);
const Role = roleModel(sequelize);

/* =========================
   Define Associations
========================= */

// User ↔ Organization (Many-to-Many)
User.belongsToMany(Organization, {
  through: UserOrganization,
  foreignKey: "user_id",
});

Organization.belongsToMany(User, {
  through: UserOrganization,
  foreignKey: "org_id",
});

// Roles per organization
Role.belongsTo(Organization, { foreignKey: "org_id" });
Organization.hasMany(Role, { foreignKey: "org_id" });

// Membership relations
UserOrganization.belongsTo(User, { foreignKey: "user_id" });
UserOrganization.belongsTo(Organization, { foreignKey: "org_id" });
UserOrganization.belongsTo(Role, { foreignKey: "role_id" });
