"use strict";
import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { launchBrowser } from "./launch-browser.js";

export async function generateInvoice(data) {
  const templatePath = path.join(process.cwd(), "views/invoice-template.html");
  let html = fs.readFileSync(templatePath, "utf8");

  const signaturePath = path.resolve(
    process.cwd(),
    "views/images/signature.png"
  );
  const signatureBase64 = fs.readFileSync(signaturePath, {
    encoding: "base64",
  });

  const mimeType = "image/png";

  const signatureDataUri = `data:${mimeType};base64,${signatureBase64}`;

  // Replace placeholders dynamically
  const replacements = {
    "{{invoice_no}}": data.invoice_no,
    "{{invoice_date}}": data.invoice_date,
    "{{due_date}}": data.due_date,
    "{{buyer_name}}": data.buyer_name,
    "{{buyer_gstin}}": data.buyer_gstin,
    "{{buyer_state}}": data.buyer_state,
    "{{buyer_address}}": data.buyer_address,
    "{{buyer_email}}": data.buyer_email,
    "{{subtotal}}": data.subtotal,
    "{{igst}}": data.igst,
    "{{cgst}}": data.cgst,
    "{{sgst}}": data.sgst,
    "{{total}}": data.total,
    "{{amount_words}}": data.amount_words,
    "{{items_html}}": data.items
      .map(
        (item, i) => `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td>${item.description}</td>
          <td class="text-center">${item.hsn}</td>
          <td class="text-center">${item.qty}</td>
          <td class="text-right">${item.rate}</td>
          <td class="text-right">${item.amount}</td>
        </tr>`
      )
      .join(""),
    "{{signature_path}}": signatureDataUri,
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.replaceAll(key, val || "");
  }

  // Output paths

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const tempPath = path.join(
    process.cwd(),
    `uploads/invoice_temp_${Date.now()}.pdf`
  );
  const finalPath = path.join(
    process.cwd(),
    `uploads/invoice_${Date.now()}.pdf`
  );
  const letterheadPath = path.join(
    process.cwd(),
    "views/letterheads/bs-letterhead.pdf"
  );

  // 1️⃣ Generate invoice PDF from HTML (transparent background)
  // const browser = await puppeteer.launch({
  //   headless: true,
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
  // });

  const browser = await launchBrowser();

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: tempPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    omitBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  // 2️⃣ Merge invoice onto letterhead
  const letterBytes = fs.readFileSync(letterheadPath);
  const invoiceBytes = fs.readFileSync(tempPath);

  const letterPdf = await PDFDocument.load(letterBytes);
  const invoicePdf = await PDFDocument.load(invoiceBytes);
  const mergedPdf = await PDFDocument.create();

  // Copy the letterhead’s first page
  const [letterPage] = await mergedPdf.copyPages(letterPdf, [0]);
  mergedPdf.addPage(letterPage);

  const mergedPage = mergedPdf.getPage(0);
  const { width, height } = mergedPage.getSize();

  // Copy and embed the invoice page properly
  const [invoicePage] = await invoicePdf.copyPages(invoicePdf, [0]); // copy from original invoice
  const [embeddedInvoicePage] = await mergedPdf.embedPages([invoicePage]); // embed before drawing

  // Draw invoice content over letterhead
  mergedPage.drawPage(embeddedInvoicePage, {
    x: 0,
    y: 0,
    width,
    height,
  });

  // Save final merged file
  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(finalPath, mergedBytes);

  // Clean up
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

  console.log("✅ Final invoice generated:", finalPath);
  return path.relative(process.cwd(), finalPath);
}
