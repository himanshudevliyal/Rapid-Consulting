// import path from "path";
// import PDFDocument from "pdfkit";
// // import fs from "fs";
// import fs from "fs/promises";
// import ejs from "ejs";
// import puppeteer from "puppeteer";
// import { PDFInvoice } from "@h1dd3nsn1p3r/pdf-invoice";
// export async function generateShippingLabel({ shipTo, from, order }) {
//   const uploadDir = path.join(process.cwd(), "public/docs");
//   await fsPromises.mkdir(uploadDir, { recursive: true });

//   const output = path.join(uploadDir, `${Date.now()}_shipping_details.pdf`);
//   const doc = new PDFDocument({ size: "A6", margin: 15 });

//   const stream = fs.createWriteStream(output);
//   doc.pipe(stream);

//   // Outer border
//   doc.roundedRect(5, 5, 270, 250, 5).stroke();

//   // Header boxes
//   doc.rect(5, 5, 150, 120).stroke();
//   doc.rect(155, 5, 120, 120).stroke();

//   // Lower details box
//   doc.rect(5, 125, 270, 120).stroke();

//   // ---- SHIP TO ----
//   doc
//     .font("Helvetica-Bold")
//     .fontSize(10)
//     .fillColor("white")
//     .rect(10, 10, 60, 15)
//     .fill();
//   doc.fillColor("black").text("SHIP TO:", 12, 12);

//   doc.font("Helvetica").fontSize(9);
//   doc.text(shipTo.name || "", 10, 30);
//   doc.text(shipTo.addressLine1 || "", 10, 42);
//   if (shipTo.addressLine2) doc.text(shipTo.addressLine2, 10, 54);
//   doc.text(
//     `${shipTo.city || ""}, ${shipTo.zip || ""}, ${shipTo.country || ""}`,
//     10,
//     66
//   );

//   // ---- FROM ----
//   doc.font("Helvetica-Bold").fontSize(10).text("FROM:", 160, 12);
//   doc.font("Helvetica").fontSize(9);
//   doc.text(from.name || "", 160, 30);
//   doc.text(from.addressLine1 || "", 160, 42);
//   doc.text(
//     `${from.city || ""}, ${from.zip || ""}, ${from.country || ""}`,
//     160,
//     54
//   );

//   // ---- ORDER INFO ----
//   doc.font("Helvetica-Bold").fontSize(9);
//   doc.text("ORDER ID:", 10, 132);
//   doc.text("INVOICE NO:", 10, 144); // 👈 Added invoice number line
//   doc.text("WEIGHT:", 10, 160);
//   doc.text("DIMENSIONS:", 10, 176);
//   doc.text("SHIPPING DATE:", 10, 192);

//   doc.font("Helvetica").fontSize(9);
//   doc.text(order.id || "", 80, 132);
//   doc.text(order.invoice || "", 80, 144); // 👈 Added here
//   doc.text(order.weight || "", 80, 160);
//   doc.text(order.dimensions || "", 80, 176);
//   doc.text(order.date || "", 80, 192);

//   doc.font("Helvetica-Bold").fontSize(9).text("REMARKS:", 160, 132);
//   doc
//     .font("Helvetica")
//     .fontSize(9)
//     .text(order.remarks || "N/A", 160, 152);

//   doc.end();

//   await new Promise((resolve) => stream.on("finish", resolve));
//   return path.relative(process.cwd(), output);
// }

// // export const dummyData = {
// //   id: "396ed349-e08f-4526-ba95-8a363b21ff8c",
// //   user_id: "76febf31-fc90-40f6-9301-ed402fa9e33f",
// //   order_number: "ORD-0001",
// //   subtotal: "418.00",
// //   tax: "0.00",
// //   shipping_fee: "0.00",
// //   total: "418.00",
// //   shipping_address: {
// //     city: "Sequi et omnis culpa",
// //     house: "Eiusmod illo nesciun",
// //     phone: "+1 (381) 458-2124",
// //     state: "Voluptates nostrum i",
// //     street: "Voluptatem enim enim",
// //     fullname: "Virginia Forbes",
// //     postal_code: "322222",
// //   },
// //   billing_address: null,
// //   created_at: "2025-10-24T07:49:17.986Z",
// //   updated_at: "2025-10-24T09:31:02.849Z",
// //   payment_method: "card",
// //   order_status: "Order Processing",
// //   fullname: "Vishal Gautam",
// //   email: "vishal@gmail.com",
// //   mobile_number: "+918700591131",
// //   invoiceNumber: "INV-001",
// //   invoiceDate: "2025-10-24",
// //   poNumber: "PO-12345",
// //   dueDate: "2025-11-10",
// //   gstPercentage: 18,
// //   items: [
// //     { qty: 2, description: "Electric Motor", unitPrice: 150 },
// //     { qty: 1, description: "Controller Board", unitPrice: 118 },
// //   ],
// //   signature: `${path.join(process.cwd(), "views/sign.jpg")}`,
// // };

// // export async function generateInvoice(invoiceData = dummyData) {
// //   const uploadDir = path.join(process.cwd(), "public/docs");
// //   await fsPromises.mkdir(uploadDir, { recursive: true });

// //   const output = path.join(uploadDir, `invoice_${Date.now()}.pdf`);
// //   const doc = new PDFDocument({ size: "A4", margin: 50 });
// //   const stream = fs.createWriteStream(output);
// //   doc.pipe(stream);

// //   const {
// //     order_number,
// //     subtotal,
// //     tax,
// //     shipping_fee,
// //     total,
// //     shipping_address,
// //     payment_method,
// //     order_status,
// //     fullname,
// //     email,
// //     mobile_number,
// //     invoiceNumber,
// //     invoiceDate,
// //     items,
// //     gstPercentage,
// //     signature,
// //   } = invoiceData;

// //   let y = 50;

// //   // Header
// //   doc.font("Helvetica-Bold").fontSize(18).text("INVOICE", 50, y);
// //   y += 20;

// //   // Basic Order Info
// //   doc.fontSize(10);
// //   doc.text(`Order Number: ${order_number}`, 50, y);
// //   doc.text(`Order Status: ${order_status}`, 250, y);
// //   doc.text(`Payment Method: ${payment_method}`, 400, y);
// //   y += 20;

// //   // Customer Info
// //   doc.text(`Customer Name: ${fullname}`, 50, y);
// //   doc.text(`Email: ${email}`, 250, y);
// //   doc.text(`Mobile: ${mobile_number}`, 400, y);
// //   y += 25;

// //   // Invoice Info (Right Side)
// //   const infoStartY = y;
// //   doc.font("Helvetica-Bold").text("Invoice #:", 400, infoStartY);
// //   doc.font("Helvetica").text(invoiceNumber, 470, infoStartY);
// //   doc.font("Helvetica-Bold").text("Invoice Date:", 400, infoStartY + 15);
// //   doc.font("Helvetica").text(invoiceDate, 470, infoStartY + 15);
// //   // doc.font("Helvetica-Bold").text("P.O.#:", 400, infoStartY + 30);
// //   // doc.font("Helvetica").text(poNumber, 470, infoStartY + 30);
// //   // doc.font("Helvetica-Bold").text("Due Date:", 400, infoStartY + 45);
// //   // doc.font("Helvetica").text(dueDate, 470, infoStartY + 45);

// //   y += 70;

// //   // Shipping Address
// //   doc.font("Helvetica-Bold").text("Shipping Address", 50, y);
// //   y += 15;
// //   doc.font("Helvetica").text(
// //     `${shipping_address.fullname}
// // ${shipping_address.house}, ${shipping_address.street}
// // ${shipping_address.city}, ${shipping_address.state} - ${shipping_address.postal_code}
// // Phone: ${shipping_address.phone}`,
// //     50,
// //     y
// //   );

// //   y += 70;

// //   // Table Header
// //   const tableTop = y;
// //   const qtyX = 50;
// //   const descX = 100;
// //   const priceX = 350;
// //   const amountX = 450;

// //   doc.font("Helvetica-Bold");
// //   doc.text("QTY", qtyX, tableTop);
// //   doc.text("DESCRIPTION", descX, tableTop);
// //   doc.text("UNIT PRICE", priceX, tableTop);
// //   doc.text("AMOUNT", amountX, tableTop);

// //   doc
// //     .moveTo(50, tableTop + 15)
// //     .lineTo(550, tableTop + 15)
// //     .stroke();

// //   // Table Rows
// //   doc.font("Helvetica");
// //   let rowY = tableTop + 25;
// //   let subtotalCalc = 0;

// //   items.forEach((item) => {
// //     const amount = item.qty * item.unitPrice;
// //     subtotalCalc += amount;

// //     doc.text(item.qty, qtyX, rowY);
// //     doc.text(item.title, descX, rowY);
// //     doc.text(item.unitPrice.toFixed(2), priceX, rowY);
// //     doc.text(amount.toFixed(2), amountX, rowY);

// //     rowY += 20;
// //   });

// //   // const gstAmount = (subtotalCalc * gstPercentage) / 100;
// //   // const totalCalc = subtotalCalc + gstAmount;

// //   // Totals
// //   rowY += 10;
// //   doc.text("Subtotal", priceX, rowY);
// //   doc.text(subtotal.toString(), amountX, rowY);
// //   // rowY += 15;
// //   // doc.text("GST " + gstPercentage + "%", priceX, rowY);
// //   // doc.text(gstAmount.toFixed(2), amountX, rowY);
// //   rowY += 15;
// //   doc.text("Shipping Fee", priceX, rowY);
// //   doc.text(shipping_fee.toString(), amountX, rowY);
// //   rowY += 15;
// //   doc.text("Tax", priceX, rowY);
// //   doc.text(tax.toString(), amountX, rowY);
// //   rowY += 15;

// //   doc.font("Helvetica-Bold").text("TOTAL", priceX, rowY);
// //   doc.text(total.toString(), amountX, rowY);

// //   // Signature
// //   if (signature) {
// //     doc.image(signature, 400, rowY + 40, { width: 100 });
// //   }

// //   doc.end();
// //   await new Promise((resolve) => stream.on("finish", resolve));

// //   return path.relative(process.cwd(), output);
// // }

// // const dummyData = {
// //   seller: {
// //     name: "Brandingwaale Webtech",
// //     address: "Delhi Delhi 110044",
// //     country: "India",
// //     phone: "9667737155",
// //     email: "brandingwaaledata.2024@gmail.com",
// //     website: "www.brandingwaale.com",
// //     gstin: "07BIFPC3399L1ZX",
// //   },
// //   buyer: {
// //     name: "AICRA ACCELERATOR PRIVATE LIMITED",
// //     address:
// //       "Property No. 10 Ground Floor U.S Complex,\n120 Mathura Road opp Apollo Hospital\nSouth East Delhi\nDelhi 110076 Delhi\nIndia",
// //     gstin: "07AAZCAS2066E1ZL",
// //   },
// //   invoice: {
// //     number: "INV-0088",
// //     date: "22.09.25",
// //     terms: "Due on Receipt",
// //     dueDate: "22.09.25",
// //     placeOfSupply: "Delhi (07)",
// //   },
// //   items: [
// //     {
// //       description:
// //         "T-shirt\nVolunteers T-shirts with branding\nTshirt Code: BSMS104",
// //       hsn: "006109",
// //       qty: 400.0,
// //       rate: 200.0,
// //       cgst: 2.5,
// //       sgst: 2.5,
// //     },
// //   ],
// //   bankDetails: {
// //     accountName: "BRANDINGWAALE WEBTECH",
// //     accountNumber: "10067731950",
// //     ifsc: "IDFB0020102",
// //     bank: "IDFC FIRST Bank, NEW FRIENDS COLONY BRANCH",
// //   },
// //   notes:
// //     "Total In Words\nIndian Rupee Zero Only\n\nThanks for your business.\n\nPayment Terms - 100% Advance",
// // };

// const payload = {
//   company: {
//     logo: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="98" height="34" viewBox="0 0 448 145"><image xlink:href="data:image/png;base64,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" x="0" y="0" width="448" height="145"/></svg>',
//     name: "Bharat Drone Systems Private Limited",
//     address: "772, SECTOR 14, FARIDABAD, Faridabad, Haryana, 121007",
//     phone: "Tel: (+11) 245 543 903",
//     email: "Mail: hello@festrol.io",
//     website: "Web: https://www.festrolcorp.io",
//     bank: "GST No: 06AAHCB8230H1ZS",
//   },
//   customer: {
//     name: "John Doe",
//     address: "1234 Main Street, New York, \n NY 10001",
//     phone: "Tel: (555) 555-5555",
//     email: "Mail: joe@example.com",
//   },
//   invoice: {
//     number: 1721,
//     date: "25/12/2023",
//     dueDate: "25/12/2023",
//     status: "Paid!",
//     locale: "de-IN", // en-US, fr-FR, es-ES, de-DE, it-IT, pt-PT
//     currency: "INR", // USD, GBP, JPY, INR, EUR, AUD
//     path: path.join(process.cwd(), "public/docs", `${Date.now()}.pdf`),
//     fee: 2,
//     orderDiscount: 3,
//   },
//   items: [
//     {
//       name: "Cloud VPS Server - Starter Plan",
//       quantity: 1,
//       price: 400,
//       tax: 13,
//       discount: 5,
//     },
//     {
//       name: "Domain Registration - example.com",
//       quantity: 2,
//       price: 20,
//       tax: 0,
//       discount: 0,
//     },
//     {
//       name: "Maintenance Charge - Yearly",
//       quantity: 1,
//       price: 300,
//       tax: 0,
//       discount: 0,
//     },
//   ],
//   qr: {
//     data: "https://www.festrolcorp.io",
//     width: 50,
//   },
//   note: "Note: This is a system generated invoice. If you have any questions concerning this invoice, contact us at sales@festrolcorp.io. Thank you for your business!",
// };

// /* --------------------------------------------------------------------------
// 	Optional: Config
//   -------------------------------------------------------------------------- */
// const config = {
//   string: {
//     invoice: "I N V O I C E",
//     refNumber: "Ref no",
//     date: "Date",
//     dueDate: "Due Date",
//     status: "Status",
//     billTo: "Bill To",
//     item: "Item",
//     quantity: "Qty",
//     price: "Price",
//     discount: "Discount",
//     tax: "Tax",
//     total: "Total",
//     subTotal: "Subtotal",
//     totalTax: "Total Tax",
//     totalDiscount: "Total Discount",
//     fee: "Fees",
//     grandTotal: "Grand Total",
//   },
//   style: {
//     //font: "Noto", // "Helvetica", "Times", "Courier"
//     fontSize: 10,
//     lineHeight: 1.2,
//     color: "#000000",
//   },
//   //font: {
//   //	Noto: {
//   //		normal: path.join(__dirname, "fonts/noto/regular.ttf"),
//   //		italics: path.join(__dirname, "fonts/noto/italic.ttf"),
//   //		bold: path.join(__dirname, "fonts/noto/bold.ttf"),
//   //		bolditalics: path.join(__dirname, "fonts/noto/bold-italic.ttf"),
//   //	},
//   //},
// };

// // export async function generateInvoice() {
// //   // const outputDir = path.join(process.cwd(), "public/docs");
// //   // if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// //   // const filePath = path.join(outputDir, `${Date.now()}.pdf`);

// //   // const invoice = new PDFInvoice(payload);
// //   // const pdf = await invoice.create(); // Returns promise, await it.
// //   // fs.writeFileSync(filePath, pdf, "base64");
// //   // console.log(`✅ Invoice generated: ${filePath}`);
// //   // return pdf;

// //   try {
// //     const invoice = new PDFInvoice(payload, config);
// //     const result = await invoice.create();
// //     console.log("✨ [Success] Invoice created : " + result + "\n");
// //   } catch (err) {
// //     console.log(err);
// //   }
// // }

// const dummyData = {
//   company: { logo: path.join(process.cwd(), "public/logo.svg") },
//   seller: {
//     name: "Brandingwaale Webtech",
//     address: "Delhi Delhi 110044",
//     country: "India",
//     phone: "9667737155",
//     email: "brandingwaaledata.2024@gmail.com",
//     website: "www.brandingwaale.com",
//     gstin: "07BIFPC3399L1ZX",
//   },
//   buyer: {
//     name: "AICRA ACCELERATOR PRIVATE LIMITED",
//     address: `Property No. 10 Ground Floor U.S Complex,
// 120 Mathura Road opp Apollo Hospital
// South East Delhi
// Delhi 110076 Delhi
// India`,
//     gstin: "07AAZCAS2066E1ZL",
//   },
//   invoice: {
//     number: "INV-0088",
//     date: "22.09.25",
//     terms: "Due on Receipt",
//     dueDate: "22.09.25",
//     placeOfSupply: "Delhi (07)",
//   },
//   items: [
//     {
//       description: `T-shirt
// Volunteers T-shirts with branding
// Tshirt Code: BSMS104`,
//       hsn: "006109",
//       qty: 400.0,
//       rate: 200.0,
//       cgst: 2.5,
//       sgst: 2.5,
//     },
//   ],
//   bankDetails: {
//     accountName: "BRANDINGWAALE WEBTECH",
//     accountNumber: "10067731950",
//     ifsc: "IDFB0020102",
//     bank: "IDFC FIRST Bank, NEW FRIENDS COLONY BRANCH",
//   },
//   notes: ["Thanks for your business."].join("<br/>"),
// };

// export async function generateInvoice(data = dummyData) {
//   console.log(path.join(process.cwd(), "public/logo.svg"));
//   const templatePath = path.join(process.cwd(), "templates", "invoice.ejs");
//   const html = await ejs.renderFile(templatePath, data, { async: true });

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: "networkidle0" });

//   const outputDir = path.join(process.cwd(), "public/docs");
//   await fs.mkdir(outputDir, { recursive: true });

//   const output = path.join(outputDir, `invoice_${Date.now()}.pdf`);

//   await page.pdf({
//     path: output,
//     format: "A4",
//     printBackground: true,
//     margin: { top: "15mm", bottom: "15mm", left: "10mm", right: "10mm" },
//   });

//   await browser.close();

//   console.log(`✅ Invoice generated: ${output}`);
//   return output;
// }
