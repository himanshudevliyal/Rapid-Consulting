import bwipjs from "bwip-js"; // For barcode generation
import { launchBrowser } from "./launch-browser.js";
import { getPaidStamp } from "./generate-invoice-pdf.js";
import path from "path";
import fs from "fs";

export const generateShippingLabelPDF = async (labelData, isPaid) => {
  let browser;

  const logoPath = path.join(process.cwd(), "assets/logo.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const paidStampSrc = isPaid ? getPaidStamp() : null;

  try {
    browser = await launchBrowser();

    const page = await browser.newPage();

    // Generate barcode as base64
    let barcodeBase64 = "";
    try {
      const png = await bwipjs.toBuffer({
        bcid: "code128",
        text: labelData.orderNo,
        scale: 2,
        height: 10,
        includetext: true,
        textxalign: "center",
      });
      barcodeBase64 = png.toString("base64");
    } catch (err) {
      console.warn("Barcode generation failed:", err);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; }
          .container { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #d1d5db; position: relative; padding: 0 20px; }

          /* Paid Stamp */
          .paid-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3; z-index: 10; pointer-events: none; }
          .paid-stamp img { width: 400px; height: auto; }

          /* Header */
          .header { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; }
          .header-left { display: flex; align-items: center; padding: 16px; border-right: 1px solid #d1d5db; }
          .header-left img { width: 100px; height: 100px; object-fit: contain; }
          .header-right { display: flex; align-items: center; justify-content: center; padding: 16px; }
          .header-right h1 { font-size: 30px; font-weight: bold; }

          /* Order Number strip */
          .order-strip { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; font-size: 12px; }
          .order-strip .detail-row { display: grid; grid-template-columns: 1fr 1fr; }
          .order-strip .detail-row:first-child { border-right: 1px solid #d1d5db; }
          .detail-label { padding: 8px; border-right: 1px solid #d1d5db; font-weight: 600; }
          .detail-value { padding: 8px; }

          /* Parties */
          .parties { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; font-size: 12px; }
          .party { padding: 12px; border-right: 1px solid #d1d5db; }
          .party:last-child { border-right: none; }
          .address-type { font-weight: 600; margin-bottom: 6px; }
          .party-name { font-weight: 500; margin-bottom: 4px; }
          .party-address { white-space: pre-line; line-height: 1.5; }

          /* Barcode */
          .barcode-section { text-align: center; padding: 12px; border-bottom: 1px solid #d1d5db; display: none; }
          .barcode-section img { max-width: 100%; height: auto; }

          /* Table */
          table { width: 100%; font-size: 12px; border-collapse: collapse; }
          th, td { padding: 8px; border-right: 1px solid #d1d5db; text-align: left; }
          th { font-weight: 600; background-color: #f9fafb; border-bottom: 1px solid #d1d5db; }
          td { border-bottom: 1px solid #d1d5db; }
          th:last-child, td:last-child { border-right: none; }
          .text-center { text-align: center; }

          /* Footer */
          .footer { padding: 12px; font-size: 11px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${isPaid ? `<div class="paid-stamp"><img src="${paidStampSrc}" alt="Paid"></div>` : ""}

          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <img src="${logoSrc}" alt="logo">
            </div>
            <div class="header-right">
              <h1>SHIPPING LABEL</h1>
            </div>
          </div>

          <!-- Order Number -->
          <div class="order-strip">
            <div class="detail-row">
              <div class="detail-label">Order No.</div>
              <div class="detail-value">${labelData.orderNo}</div>
            </div>
          </div>

          <!-- Addresses -->
          <div class="parties">
            <div class="party">
              <div class="address-type">Ship To</div>
              <div class="party-name">${labelData.customer.name}</div>
              <div class="party-address">${labelData.customer.address
                .filter(Boolean)
                .join(", ")}
${labelData.customer.city}
Phone: ${labelData.customer.phone || "N/A"}</div>
            </div>
            <div class="party">
              <div class="address-type">Return To</div>
              <div class="party-name">${labelData.returnAddress.name}</div>
              <div class="party-address">${labelData.returnAddress.address
                .filter(Boolean)
                .join("\n")}</div>
            </div>
          </div>

          <!-- Barcode -->
          ${
            barcodeBase64
              ? `
          <div class="barcode-section">
            <img src="data:image/png;base64,${barcodeBase64}" alt="barcode">
          </div>
          `
              : ""
          }

          <!-- Products -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${labelData.products
                .map(
                  (product) => `
                <tr>
                  <td>${product.description}</td>
                  <td class="text-center">${product.qty}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <!-- Footer -->
          <div class="footer">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      printBackground: true,
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};
