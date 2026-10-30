"use strict";
import { DataTypes, Op, literal } from "sequelize";
import slugify from "slugify";

let SessionModel = null;

const TABLE = "sessions";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  SessionModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      topic: { type: DataTypes.STRING(255), allowNull: true },
      audience: { type: DataTypes.STRING(255), allowNull: true },
      summary: { type: DataTypes.TEXT, allowNull: true },
      speaker_name: { type: DataTypes.STRING(160), allowNull: true },
      speaker_title: { type: DataTypes.STRING(200), allowNull: true },
      starts_at: { type: DataTypes.DATE, allowNull: true },
      duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
      registration_url: { type: DataTypes.STRING(500), allowNull: true },
      registration_open: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      recording_url: { type: DataTypes.STRING(500), allowNull: true },
      // One resource per line: "Title | https://url".
      related_resources: { type: DataTypes.TEXT, allowNull: true },
      cover_image: { type: DataTypes.STRING(500), allowNull: true },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await SessionModel.sync({ alter: false, force: false });
};

// What a visitor can do with the session:
//   recording - a recording is available
//   upcoming  - starts in the future and registration is open
//   closed    - everything else (over, or registration shut, no recording)
export const sessionState = (session, now = new Date()) => {
  if (session.recording_url) return "recording";
  if (session.starts_at && new Date(session.starts_at) > now && session.registration_open) {
    return "upcoming";
  }
  return "closed";
};

// Adds the computed `state` to a session or a list of sessions (plain objects).
const withState = (input) => {
  const now = new Date();
  const one = (item) => {
    const row = typeof item?.toJSON === "function" ? item.toJSON() : item;
    return row ? { ...row, state: sessionState(row, now) } : row;
  };
  return Array.isArray(input) ? input.map(one) : one(input);
};

const slugBase = (title) => makeSlug(title) || `session-${Date.now()}`;

// Slug for a new session: the one given, or one made from the title that does
// not clash with an existing session (adds -2, -3, ...).
const uniqueSlug = async (title, wanted) => {
  if (wanted) return wanted;
  const base = slugBase(title);
  let slug = base;
  for (let n = 2; await SessionModel.findOne({ where: { slug }, attributes: ["id"] }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

// Is the slug already used by another session?
const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await SessionModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.title, data.slug);
  return SessionModel.create({ ...data, slug });
};

// SQL conditions matching the computed states (see sessionState).
const hasRecording = {
  [Op.and]: [{ recording_url: { [Op.ne]: null } }, { recording_url: { [Op.ne]: "" } }],
};
const noRecording = { [Op.or]: [{ recording_url: null }, { recording_url: "" }] };
const stateWhere = (state, now) => {
  const upcoming = {
    [Op.and]: [noRecording, { starts_at: { [Op.gt]: now } }, { registration_open: true }],
  };
  const notUpcoming = {
    [Op.or]: [
      hasRecording,
      { starts_at: null },
      { starts_at: { [Op.lte]: now } },
      { registration_open: false },
    ],
  };
  if (state === "upcoming") return upcoming;
  if (state === "past") return notUpcoming;
  if (state === "recording") return hasRecording;
  if (state === "closed") return { [Op.and]: [noRecording, notUpcoming] };
  return null;
};

// active_only: the public site. is_active ("true" | "false" as booleans):
// admin filter. state: upcoming | past | recording | closed (past = anything
// that is not upcoming).
const getAll = async ({
  active_only = false,
  is_active,
  state,
  q,
  page = 1,
  limit = 20,
} = {}) => {
  const now = new Date();
  const clauses = [];
  if (active_only) clauses.push({ is_active: true });
  else if (is_active === true || is_active === false) clauses.push({ is_active });
  const byState = stateWhere(state, now);
  if (byState) clauses.push(byState);
  if (q) {
    clauses.push({
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { topic: { [Op.iLike]: `%${q}%` } },
        { speaker_name: { [Op.iLike]: `%${q}%` } },
        { slug: { [Op.iLike]: `%${q}%` } },
      ],
    });
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await SessionModel.findAndCountAll({
    where: clauses.length ? { [Op.and]: clauses } : {},
    // Soonest first for upcoming sessions; otherwise newest first.
    order: [
      ["sort_order", "ASC"],
      state === "upcoming"
        ? literal("starts_at ASC NULLS LAST")
        : literal("starts_at DESC NULLS LAST"),
      ["created_at", "DESC"],
    ],
    limit,
    offset,
  });
  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: withState(rows),
  };
};

const getBySlug = async (slug) => SessionModel.findOne({ where: { slug } });
const getById = async (id) => SessionModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await SessionModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => SessionModel.destroy({ where: { id } });

export default {
  init,
  create,
  getAll,
  getBySlug,
  getById,
  updateById,
  deleteById,
  slugTaken,
  withState,
};
