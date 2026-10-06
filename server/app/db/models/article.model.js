"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";
import { literal } from "sequelize";

let ArticleModel = null;

const TABLE = "articles";

const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  ArticleModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      excerpt: { type: DataTypes.TEXT, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      cover_image: { type: DataTypes.STRING(500), allowNull: true },
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
      published_at: { type: DataTypes.DATE, allowNull: true },
      meta_title: { type: DataTypes.STRING(255), allowNull: true },
      meta_description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await ArticleModel.sync({ alter: false, force: false });
};

const slugBase = (title) => makeSlug(title) || `article-${Date.now()}`;

// Slug for a new article: the one given, or one made from the title that does
// not clash with an existing article (adds -2, -3, ...).
const uniqueSlug = async (title, wanted) => {
  if (wanted) return wanted;
  const base = slugBase(title);
  let slug = base;
  for (let n = 2; await ArticleModel.findOne({ where: { slug }, attributes: ["id"] }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

// Is the slug already used by another article?
const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await ArticleModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.title, data.slug);
  const published_at = data.is_published ? new Date() : null;
  return ArticleModel.create({ ...data, slug, published_at });
};

// published_only: public site. is_published: "true" | "false" filters the
// admin list. tag: only articles carrying that tag.
const getAll = async ({
  published_only = false,
  is_published,
  tag,
  category_id,
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
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { excerpt: { [Op.iLike]: `%${q}%` } },
      { slug: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await ArticleModel.findAndCountAll({
    where,
    // Newest published first; drafts (no publish date) after them.
    order: [literal("published_at DESC NULLS LAST"), ["created_at", "DESC"]],
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getBySlug = async (slug) => ArticleModel.findOne({ where: { slug } });
const getById = async (id) => ArticleModel.findByPk(id);

const updateById = async (id, data) => {
  const current = await ArticleModel.findByPk(id);
  if (!current) return null;
  // The publish date is set the first time the article is published and
  // then left alone, so later edits do not move it.
  if (data.is_published && !current.published_at) data.published_at = new Date();
  const [, rows] = await ArticleModel.update(data, { where: { id }, returning: true });
  return rows[0] ?? current;
};

const deleteById = async (id) => ArticleModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById, slugTaken };
