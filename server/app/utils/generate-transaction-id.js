export function generateTransactionID() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const merchantPrefix = "TXN";
  const transactionID = `${merchantPrefix}${timestamp}${randomNum}`;
  return transactionID;
}
