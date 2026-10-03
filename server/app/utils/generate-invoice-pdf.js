import path from "path";
import fs from "fs";
import { launchBrowser } from "./launch-browser.js";

export function getCompanyStamp() {
  const logoPath = path.join(process.cwd(), "assets/signature.svg");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return logoSrc;
}

export function getPaidStamp() {
  const logoPath = path.join(process.cwd(), "assets/paid.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return logoSrc;
}

export const generateInvoicePDF = async (invoiceData, isPaid = false) => {
  let browser;
  const logoPath = path.join(process.cwd(), "assets/logo.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const paidStampSrc = isPaid ? getPaidStamp() : null;

  try {
    browser = await launchBrowser();

    const page = await browser.newPage();

    // Create HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; }
          .container { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #d1d5db; position: relative; padding:0 20px; }
          
          /* Paid Stamp */
          .paid-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3; z-index: 10; pointer-events: none; }
          .paid-stamp img { width: 400px; height: auto; }
          
          /* Header */
          .header { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; }
          .header-left { display: flex; flex-direction: column; gap: 16px; padding: 16px; border-right: 1px solid #d1d5db; }
          .logo { text-align: center; }
          .logo img { width: 150px; height: 150px; object-fit: contain }
          .seller-info { font-size: 12px; }
          .seller-info .name { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
          .header-right { display: flex; align-items: center; justify-content: center; padding: 16px; }
          .header-right h1 { font-size: 30px; font-weight: bold; }
          
          /* Invoice Details */
          .invoice-details { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; font-size: 12px; }
          .invoice-details-left { border-right: 1px solid #d1d5db; }
          .detail-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; }
          .detail-row:last-child { border-bottom: none; height: 100%; }
          .detail-label { padding: 8px; border-right: 1px solid #d1d5db; font-weight: 600; }
          .detail-value { padding: 8px; }
          
          /* Parties */
          .parties { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; font-size: 12px; }
          .party { padding: 12px; border-right: 1px solid #d1d5db; }
          .party:last-child { border-right: none; }
          .address-type { font-weight: 600; margin-bottom: 6px; }
          .party-name { font-weight: 500; margin-bottom: 4px; text-transform: capitalize; }
          .party-address { white-space: pre-line; }
          
          /* Table */
          table { width: 100%; font-size: 12px; border-collapse: collapse; }
          th, td { padding: 8px; border-right: 1px solid #d1d5db; text-align: left; }
          th { font-weight: 600; background-color: #f9fafb; border-bottom: 1px solid #d1d5db; }
          td { border-bottom: 1px solid #d1d5db; }
          th:last-child, td:last-child { border-right: none; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          /* Footer */
          .footer { display: grid; grid-template-columns: 1fr 1fr; }
          .footer-left { padding: 12px; font-size: 12px; white-space: pre-line; border-right: 1px solid #d1d5db; }
          .footer-right { }
          .total-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d1d5db; font-size: 12px; }
          .total-row:last-child { border-bottom: none; }
          .total-label { padding: 8px; border-right: 1px solid #d1d5db; text-align: right; }
          .total-value { padding: 8px; text-align: right; }
          .total-label.bold { font-weight: 600; }

          /* System generated note */
          .system-note { border-top: 1px solid #d1d5db; padding: 14px 0; font-size: 11px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${isPaid ? `<div class="paid-stamp"><img src="${paidStampSrc}" alt="Paid"></div>` : ""}
          
          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <div class="logo">
                <img src="${logoSrc}" alt="logo">
              </div>
              <div class="seller-info">
                <div class="name">${invoiceData.seller.name}</div>
                <div>${invoiceData.seller.address}</div>
                <div>${invoiceData.seller.country}</div>
                <div>${invoiceData.seller.phone}</div>
                <div>${invoiceData.seller.email}</div>
                <div>${invoiceData.seller.website}</div>
                <div>GSTIN: ${invoiceData.seller.gstin}</div>
              </div>
            </div>
            <div class="header-right">
              <h1>TAX INVOICE</h1>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="invoice-details-left">
              <div class="detail-row">
                <div class="detail-label">Invoice No.</div>
                <div class="detail-value">${invoiceData.invoice.number}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Invoice Date</div>
                <div class="detail-value">${invoiceData.invoice.date}</div>
              </div>
            </div>
            <div>
              <div class="detail-row">
                <div class="detail-label">Place Of Supply</div>
                <div class="detail-value text-right">${invoiceData.invoice.placeOfSupply.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <!-- Parties -->
          <div class="parties">
            <div class="party">
              <div class="address-type">Shipping address</div>
              <div class="party-name">${invoiceData.buyer.shipping_address.name}</div>
              <div class="party-address">${invoiceData.buyer.shipping_address.address}</div>
               <!-- <div style="margin-top: 4px;">GSTIN: ${invoiceData.buyer.shipping_address.gstin || "N/A"}</div> -->
              </div>
              <div class="party">
              <div class="address-type">Billing address</div>
              <div class="party-name">${invoiceData.buyer.billing_address.name}</div>
              <div class="party-address">${invoiceData.buyer.billing_address.address}</div>
              <div style="margin-top: 4px;">GSTIN: ${invoiceData.buyer.billing_address.gstin || "N/A"}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                ${
                  invoiceData.is_inter_state
                    ? `<th class="text-center">IGST %</th><th class="text-right">IGST Amt</th>`
                    : `<th class="text-center">CGST %</th><th class="text-right">CGST Amt</th><th class="text-center">SGST %</th><th class="text-right">SGST Amt</th>`
                }
                <th class="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items
                .map((item, idx) => {
                  const rateInclGst = Number(item.rate);
                  const qty = Number(item.qty);

                  if (!Number.isFinite(rateInclGst) || !Number.isFinite(qty)) {
                    throw new Error("Invalid rate or quantity");
                  }

                  const GST_RATE = 18;

                  // Reverse GST
                  const rateExclGst = rateInclGst / (1 + GST_RATE / 100);
                  const baseAmount = rateExclGst * qty;

                  const totalInclGst = rateInclGst * qty;
                  const gstAmount = totalInclGst - baseAmount;

                  // Tax split
                  const cgstRate = 9;
                  const sgstRate = 9;
                  const igstRate = 18;

                  const cgstAmt = invoiceData.is_inter_state
                    ? 0
                    : gstAmount / 2;
                  const sgstAmt = invoiceData.is_inter_state
                    ? 0
                    : gstAmount / 2;
                  const igstAmt = invoiceData.is_inter_state ? gstAmount : 0;

                  return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.description}</td>
                      <td class="text-right">${qty} pcs</td>

                      <!-- Rate EXCLUDING GST -->
                      <td class="text-right">₹${rateExclGst.toFixed(2)}</td>

                      ${
                        invoiceData.is_inter_state
                          ? `
                            <td class="text-center">${igstRate}%</td>
                            <td class="text-right">₹${igstAmt.toFixed(2)}</td>
                          `
                          : `
                            <td class="text-center">${cgstRate}%</td>
                            <td class="text-right">₹${cgstAmt.toFixed(2)}</td>
                            <td class="text-center">${sgstRate}%</td>
                            <td class="text-right">₹${sgstAmt.toFixed(2)}</td>
                          `
                      }

                      <!-- Line total EXCLUDING GST -->
                      <td class="text-right" style="font-weight: 500;">
                        ₹${baseAmount.toFixed(2)}
                      </td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>


          </table>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-left">Total In Words
${invoiceData.total_in_word}

Thanks for your business.</div>
            <div class="footer-right">
              <div class="total-row">
                <div class="total-label bold">Sub Total</div>
                <div class="total-value">₹${invoiceData.subtotal.toFixed(2)}</div>
              </div>
              ${
                invoiceData.is_inter_state
                  ? `
                    <div class="total-row">
                      <div class="total-label">IGST (18%)</div>
                      <div class="total-value">₹${invoiceData.igstTotal.toFixed(2)}</div>
                    </div>
                  `
                  : `
                    <div class="total-row">
                      <div class="total-label">CGST (9%)</div>
                      <div class="total-value">₹${invoiceData.cgstTotal.toFixed(2)}</div>
                    </div>
                    <div class="total-row">
                      <div class="total-label">SGST (9%)</div>
                      <div class="total-value">₹${invoiceData.sgstTotal.toFixed(2)}</div>
                    </div>
                  `
              }
              <div class="total-row">
                <div class="total-label bold">Total</div>
                <div class="total-value">₹${invoiceData.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <!-- System Generated Note (replaces signature) -->
          <div class="system-note">
            This is a system generated invoice and does not require a signature or stamp.
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};
