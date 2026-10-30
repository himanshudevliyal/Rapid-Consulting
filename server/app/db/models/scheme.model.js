"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let SchemeModel = null;

const TABLE = "schemes";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  SchemeModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      ministry: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      eligibility: { type: DataTypes.TEXT, allowNull: true },
      benefits: { type: DataTypes.TEXT, allowNull: true },
      application_process: { type: DataTypes.TEXT, allowNull: true },
      official_url: { type: DataTypes.STRING(500), allowNull: true },
      cover_image: { type: DataTypes.STRING(500), allowNull: true },
      // An uploaded PDF (path); the website links to it and opens it in a new tab.
      pdf_url: { type: DataTypes.STRING(500), allowNull: true },
      category_id: { type: DataTypes.UUID, allowNull: true },
      tags: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Quick facts shown on the scheme page.
      assistance_type: { type: DataTypes.STRING(255), allowNull: true },
      relevant_activity: { type: DataTypes.STRING(255), allowNull: true },
      policy_period: { type: DataTypes.STRING(255), allowNull: true },
      application_window: { type: DataTypes.STRING(255), allowNull: true },
      // The "at a glance" rows: [{ label, value, bold }], in the order shown.
      // Replaces the four fixed facts above when it has rows.
      quick_facts: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      // Extra page sections, the same shape as a service's sections
      // ({ key, title, role, html, intro_html, items, outro_html, ... }).
      sections: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      // open | upcoming | closed | historical
      status: { type: DataTypes.STRING(20), allowNull: true },
      // Author and reviewer are team members (advisers); the review date only
      // counts when a reviewer is set.
      author_id: { type: DataTypes.UUID, allowNull: true },
      reviewer_id: { type: DataTypes.UUID, allowNull: true },
      // none | assigned | pending | completed (null = not tracked yet).
      review_status: { type: DataTypes.STRING(20), allowNull: true },
      reviewed_at: { type: DataTypes.DATEONLY, allowNull: true },
      // Featured schemes are the ones shown on the home page.
      is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await SchemeModel.sync({ alter: false, force: false });
};

const slugBase = (title) => makeSlug(title) || `scheme-${Date.now()}`;

// Slug for a new scheme: the one given, or one made from the title that does
// not clash with an existing scheme (adds -2, -3, ...).
const uniqueSlug = async (title, wanted) => {
  if (wanted) return wanted;
  const base = slugBase(title);
  let slug = base;
  for (let n = 2; await SchemeModel.findOne({ where: { slug }, attributes: ["id"] }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

// Is the slug already used by another scheme?
const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await SchemeModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.title, data.slug);
  return SchemeModel.create({ ...data, slug });
};

// published_only: public site. is_published: "true" | "false" filters the
// admin list. tag: only schemes carrying that tag.
const getAll = async ({
  published_only = false,
  is_published,
  tag,
  category_id,
  featured,
  q,
  page = 1,
  limit = 20,
} = {}) => {
  const where = {};
  if (published_only) where.is_published = true;
  else if (is_published === "true") where.is_published = true;
  else if (is_published === "false") where.is_published = false;
  if (tag) where.tags = { [Op.contains]: [tag] };
  if (category_id) where.category_id = category_id;
  if (featured === "true" || featured === true) where.is_featured = true;
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { ministry: { [Op.iLike]: `%${q}%` } },
      { slug: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await SchemeModel.findAndCountAll({
    where,
    order: [["title", "ASC"]],
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getBySlug = async (slug) => SchemeModel.findOne({ where: { slug } });

// Published schemes by slug, in the order the slugs are given (industry pages).
const getPublishedBySlugs = async (slugs) => {
  if (!slugs?.length) return [];
  const rows = await SchemeModel.findAll({
    where: { slug: { [Op.in]: slugs }, is_published: true },
    attributes: [
      "id", "title", "slug", "ministry", "description", "cover_image", "tags",
      "assistance_type", "relevant_activity", "policy_period", "application_window", "status",
    ],
  });
  const order = new Map(slugs.map((slug, index) => [slug, index]));
  return rows.sort((a, b) => order.get(a.slug) - order.get(b.slug));
};
const getById = async (id) => SchemeModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await SchemeModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => SchemeModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getPublishedBySlugs, getById, updateById, deleteById, slugTaken };
