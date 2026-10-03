import ejs from "ejs";
import path from "path";
import { getTemplateData, validateTemplateData } from "./get-template-data.js";

export async function renderEmail(templateKey, payload) {
  const templatePath = path.join(
    process.cwd(),
    "app/views/emails",
    `${templateKey}.ejs`,
  );

  const data = getTemplateData(templateKey, payload);
  validateTemplateData(templateKey, data);

  return ejs.renderFile(templatePath, payload);
}
