export const downloadPdf = (data, fileName) => {
  try {
    let binaryData;

    if (typeof data === "string") {
      binaryData = new Uint8Array(
        data.split("").map((char) => char.charCodeAt(0)),
      );
    } else {
      binaryData = data;
    }

    const blob = new Blob([binaryData], {
      type: "application/pdf",
    });

    if (blob.size === 0) {
      console.error("PDF blob is empty!");
      return;
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
};
