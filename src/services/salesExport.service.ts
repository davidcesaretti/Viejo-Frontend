import ExcelJS from "exceljs";
import type { Sale, SaleItem } from "@/types/sale";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  // Main header (section titles)
  HEADER_MAIN_BG:   "FF3730A3", // indigo-700
  HEADER_MAIN_FG:   "FFFFFFFF",
  // Column headers
  COL_HEADER_BG:    "FF4F46E5", // indigo-600
  COL_HEADER_FG:    "FFFFFFFF",
  // Client group bar
  CLIENT_BAR_BG:    "FFEDE9FE", // violet-100
  CLIENT_BAR_FG:    "FF4C1D95", // violet-900
  // Subtotal rows
  SUBTOTAL_BG:      "FFE0E7FF", // indigo-100
  SUBTOTAL_FG:      "FF312E81", // indigo-900
  // Alternating rows
  ROW_ODD:          "FFFFFFFF",
  ROW_EVEN:         "FFF5F3FF", // violet-50
  // Summary section header
  SUMMARY_BG:       "FF1E1B4B", // indigo-950
  SUMMARY_FG:       "FFFFFFFF",
  // Summary total
  TOTAL_BG:         "FFC7D2FE", // indigo-200
  TOTAL_FG:         "FF1E1B4B",
  // Status colors
  PAID_FG:          "FF16A34A", // green-600
  PARTIAL_FG:       "FFD97706", // amber-600
  UNPAID_FG:        "FFDC2626", // red-600
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtDateRange(dateFrom?: string, dateTo?: string): string {
  if (dateFrom && dateTo) return `${fmtDate(dateFrom)} al ${fmtDate(dateTo)}`;
  if (dateFrom) return `Desde ${fmtDate(dateFrom)}`;
  if (dateTo) return `Hasta ${fmtDate(dateTo)}`;
  return "Todas las fechas";
}

function fill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function font(argb: string, bold = false, size = 10): Partial<ExcelJS.Font> {
  return { color: { argb }, bold, size, name: "Calibri" };
}

function border(): Partial<ExcelJS.Borders> {
  const thin: ExcelJS.BorderStyle = "thin";
  const side = { style: thin, color: { argb: "FFD4D4D4" } };
  return { top: side, bottom: side, left: side, right: side };
}

function applyHeaderStyle(row: ExcelJS.Row, bgArgb: string, fgArgb: string) {
  row.eachCell((cell) => {
    cell.fill = fill(bgArgb);
    cell.font = font(fgArgb, true, 10);
    cell.border = border();
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
  });
  row.height = 22;
}

function applyDataRow(row: ExcelJS.Row, isEven: boolean) {
  const bgArgb = isEven ? C.ROW_EVEN : C.ROW_ODD;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fill(bgArgb);
    cell.border = border();
    cell.font = font("FF1F2937", false, 10);
    cell.alignment = { vertical: "middle" };
  });
  row.height = 18;
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportSalesToExcel(
  sales: Sale[],
  options: { clientId?: string; clientName?: string; dateFrom?: string; dateTo?: string } = {}
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema de Gestión";
  wb.created = new Date();

  // ── Sheet 1: Detalle de ventas ──────────────────────────────────────────────
  await buildDetailSheet(wb, sales, options);

  // ── Sheet 2: Resumen por producto ──────────────────────────────────────────
  await buildProductSummarySheet(wb, sales);

  // ── Download ───────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const datePart = options.dateFrom
    ? `_${options.dateFrom}${options.dateTo ? `_${options.dateTo}` : ""}`
    : "";
  a.download = `ventas${datePart}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── Sheet 1: Detalle ────────────────────────────────────────────────────────

async function buildDetailSheet(
  wb: ExcelJS.Workbook,
  sales: Sale[],
  options: { clientId?: string; clientName?: string; dateFrom?: string; dateTo?: string }
) {
  const ws = wb.addWorksheet("Detalle de ventas", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  const COLS = 9;

  // Title block
  const titleRow = ws.addRow(["REPORTE DE VENTAS"]);
  ws.mergeCells(`A${titleRow.number}:I${titleRow.number}`);
  titleRow.getCell(1).fill = fill(C.HEADER_MAIN_BG);
  titleRow.getCell(1).font = font(C.HEADER_MAIN_FG, true, 14);
  titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
  titleRow.height = 28;

  const subtitleRow = ws.addRow([
    `Período: ${fmtDateRange(options.dateFrom, options.dateTo)}${options.clientName ? `  |  Cliente: ${options.clientName}` : ""}  |  Generado: ${fmtDate(new Date().toISOString())}`,
  ]);
  ws.mergeCells(`A${subtitleRow.number}:I${subtitleRow.number}`);
  subtitleRow.getCell(1).fill = fill("FFE0E7FF");
  subtitleRow.getCell(1).font = font("FF312E81", false, 10);
  subtitleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
  subtitleRow.height = 18;

  ws.addRow([]); // spacer

  // Column widths
  ws.getColumn("A").width = 14; // Fecha
  ws.getColumn("B").width = 22; // Cliente
  ws.getColumn("C").width = 24; // Producto
  ws.getColumn("D").width = 14; // Variante
  ws.getColumn("E").width = 10; // Cantidad
  ws.getColumn("F").width = 14; // Precio unit.
  ws.getColumn("G").width = 14; // Subtotal
  ws.getColumn("H").width = 14; // Cobrado
  ws.getColumn("I").width = 14; // Saldo

  // Column headers
  const colHeaders = ["Fecha", "Cliente", "Producto", "Variante", "Cantidad", "Precio unit.", "Subtotal", "Cobrado", "Saldo"];
  const colHeaderRow = ws.addRow(colHeaders);
  applyHeaderStyle(colHeaderRow, C.COL_HEADER_BG, C.COL_HEADER_FG);

  // Group sales by client
  const byClient = new Map<string, { name: string; sales: Sale[] }>();
  for (const sale of sales) {
    const clientId = sale.clientId;
    const clientName = sale.client?.name ?? "Sin cliente";
    if (!byClient.has(clientId)) byClient.set(clientId, { name: clientName, sales: [] });
    byClient.get(clientId)!.sales.push(sale);
  }

  let rowIndex = 0;

  for (const { name: clientName, sales: clientSales } of byClient.values()) {
    // Client group bar
    const clientBarRow = ws.addRow([clientName, ...Array(COLS - 1).fill("")]);
    ws.mergeCells(`A${clientBarRow.number}:I${clientBarRow.number}`);
    clientBarRow.getCell(1).fill = fill(C.CLIENT_BAR_BG);
    clientBarRow.getCell(1).font = font(C.CLIENT_BAR_FG, true, 10);
    clientBarRow.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    clientBarRow.eachCell((cell) => { cell.border = border(); });
    clientBarRow.height = 20;

    let clientTotal = 0;
    let clientPaid = 0;

    for (const sale of clientSales) {
      const saleTotal = sale.totalAmount;
      const salePaid = sale.amountPaid ?? 0;
      const saleBalance = saleTotal - salePaid;

      for (const item of sale.items ?? []) {
        // Proportional payment per item
        const fraction = saleTotal > 0 ? item.subtotal / saleTotal : 0;
        const itemPaid = Math.round(salePaid * fraction * 100) / 100;
        const itemBalance = Math.round((item.subtotal - itemPaid) * 100) / 100;

        const dataRow = ws.addRow([
          fmtDate(sale.saleDate),
          clientName,
          item.productName,
          item.variantName || "—",
          item.quantity,
          fmt(item.unitPrice),
          fmt(item.subtotal),
          fmt(itemPaid),
          fmt(itemBalance),
        ]);
        applyDataRow(dataRow, rowIndex % 2 === 1);

        // Align numeric columns right
        for (const col of [5, 6, 7, 8, 9]) {
          dataRow.getCell(col).alignment = { vertical: "middle", horizontal: "right" };
        }

        // Color saldo cell
        const saldoCell = dataRow.getCell(9);
        if (itemBalance <= 0) saldoCell.font = { ...font(C.PAID_FG, false, 10) };
        else if (itemPaid > 0) saldoCell.font = { ...font(C.PARTIAL_FG, false, 10) };
        else saldoCell.font = { ...font(C.UNPAID_FG, false, 10) };

        rowIndex++;
      }

      clientTotal += saleTotal;
      clientPaid += salePaid;
    }

    // Client subtotal row
    const stRow = ws.addRow([
      "",
      `Subtotal ${clientName}`,
      "", "", "",
      "",
      fmt(clientTotal),
      fmt(clientPaid),
      fmt(clientTotal - clientPaid),
    ]);
    stRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = fill(C.SUBTOTAL_BG);
      cell.font = font(C.SUBTOTAL_FG, true, 10);
      cell.border = border();
      cell.alignment = { vertical: "middle" };
    });
    for (const col of [7, 8, 9]) {
      stRow.getCell(col).alignment = { vertical: "middle", horizontal: "right" };
    }
    stRow.height = 20;
    ws.mergeCells(`B${stRow.number}:F${stRow.number}`);
  }

  // Grand total row
  const grandTotal = sales.reduce((s, x) => s + x.totalAmount, 0);
  const grandPaid = sales.reduce((s, x) => s + (x.amountPaid ?? 0), 0);
  ws.addRow([]);

  const totalRow = ws.addRow([
    "", "TOTAL GENERAL", "", "", "",
    "",
    fmt(grandTotal),
    fmt(grandPaid),
    fmt(grandTotal - grandPaid),
  ]);
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fill(C.TOTAL_BG);
    cell.font = font(C.TOTAL_FG, true, 11);
    cell.border = border();
    cell.alignment = { vertical: "middle" };
  });
  for (const col of [7, 8, 9]) {
    totalRow.getCell(col).alignment = { vertical: "middle", horizontal: "right" };
  }
  totalRow.height = 24;
  ws.mergeCells(`B${totalRow.number}:F${totalRow.number}`);
}

// ─── Sheet 2: Resumen por producto ───────────────────────────────────────────

async function buildProductSummarySheet(wb: ExcelJS.Workbook, sales: Sale[]) {
  const ws = wb.addWorksheet("Resumen por producto", {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });

  // Title
  const titleRow = ws.addRow(["RESUMEN POR PRODUCTO"]);
  ws.mergeCells(`A${titleRow.number}:G${titleRow.number}`);
  titleRow.getCell(1).fill = fill(C.SUMMARY_BG);
  titleRow.getCell(1).font = font(C.SUMMARY_FG, true, 13);
  titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
  titleRow.height = 28;

  ws.addRow([]);

  // Columns
  ws.getColumn("A").width = 26; // Producto
  ws.getColumn("B").width = 16; // Variante
  ws.getColumn("C").width = 14; // Unidades
  ws.getColumn("D").width = 16; // Total facturado
  ws.getColumn("E").width = 16; // Total cobrado
  ws.getColumn("F").width = 16; // Saldo pendiente
  ws.getColumn("G").width = 12; // Ventas

  const colHeaderRow = ws.addRow(["Producto", "Variante", "Unidades", "Total facturado", "Total cobrado", "Saldo pendiente", "# Ventas"]);
  applyHeaderStyle(colHeaderRow, C.COL_HEADER_BG, C.COL_HEADER_FG);

  // Aggregate by product+variant
  type ProductKey = string;
  interface ProductSummary {
    productName: string;
    variantName: string;
    units: number;
    totalAmount: number;
    totalPaid: number;
    salesCount: number;
  }

  const map = new Map<ProductKey, ProductSummary>();

  for (const sale of sales) {
    const saleTotal = sale.totalAmount;
    const salePaid = sale.amountPaid ?? 0;

    for (const item of sale.items ?? []) {
      const key = `${item.productName}|${item.variantName ?? ""}`;
      if (!map.has(key)) {
        map.set(key, {
          productName: item.productName,
          variantName: item.variantName ?? "",
          units: 0,
          totalAmount: 0,
          totalPaid: 0,
          salesCount: 0,
        });
      }
      const ps = map.get(key)!;
      ps.units += item.quantity;
      ps.totalAmount += item.subtotal;
      const fraction = saleTotal > 0 ? item.subtotal / saleTotal : 0;
      ps.totalPaid += Math.round(salePaid * fraction * 100) / 100;
      ps.salesCount += 1;
    }
  }

  // Sort by totalAmount desc
  const sorted = [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount);

  let rowIndex = 0;
  let sumUnits = 0, sumAmount = 0, sumPaid = 0, sumSales = 0;

  for (const ps of sorted) {
    const saldo = ps.totalAmount - ps.totalPaid;
    const row = ws.addRow([
      ps.productName,
      ps.variantName || "—",
      ps.units,
      fmt(ps.totalAmount),
      fmt(ps.totalPaid),
      fmt(saldo),
      ps.salesCount,
    ]);
    applyDataRow(row, rowIndex % 2 === 1);
    for (const col of [3, 4, 5, 6, 7]) {
      row.getCell(col).alignment = { vertical: "middle", horizontal: "right" };
    }
    // Color saldo
    const saldoCell = row.getCell(6);
    if (saldo <= 0) saldoCell.font = { ...font(C.PAID_FG, false, 10) };
    else if (ps.totalPaid > 0) saldoCell.font = { ...font(C.PARTIAL_FG, false, 10) };
    else saldoCell.font = { ...font(C.UNPAID_FG, false, 10) };

    sumUnits += ps.units;
    sumAmount += ps.totalAmount;
    sumPaid += ps.totalPaid;
    sumSales += ps.salesCount;
    rowIndex++;
  }

  // Totals row
  ws.addRow([]);
  const totalRow = ws.addRow([
    "TOTAL",
    "",
    sumUnits,
    fmt(sumAmount),
    fmt(sumPaid),
    fmt(sumAmount - sumPaid),
    sumSales,
  ]);
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fill(C.TOTAL_BG);
    cell.font = font(C.TOTAL_FG, true, 11);
    cell.border = border();
    cell.alignment = { vertical: "middle" };
  });
  for (const col of [3, 4, 5, 6, 7]) {
    totalRow.getCell(col).alignment = { vertical: "middle", horizontal: "right" };
  }
  totalRow.height = 24;
}
