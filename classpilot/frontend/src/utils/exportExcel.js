import * as XLSX from "xlsx";

/**
 * Exports an array of flat objects to a downloadable .xlsx file.
 * @param {Array<Object>} rows
 * @param {String} filename - without extension
 * @param {String} sheetName
 */
export const exportToExcel = (rows, filename = "export", sheetName = "Sheet1") => {
  if (!rows || rows.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
