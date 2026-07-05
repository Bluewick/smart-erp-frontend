import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/authContext";
import ExcelJS from 'exceljs';

const API_URL = import.meta.env.VITE_API_URL;

export default function PurchaseVoucherCreation() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Dynamic voucher type selection tracking ('PURCHASE' or 'SALES')
  const [voucherType, setVoucherType] = useState("PURCHASE");

  // Master lists for dropdown menus
  const [parties, setParties] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  
  // Voucher fields matching layout
  const [voucherData, setVoucherData] = useState({
    supplierInvoiceNo: "",
    date: new Date().toISOString().split('T')[0],
    partyId: "",
    accountLedgerId: "", // Handles both purchaseLedgerId & salesLedgerId dynamically
    narration: ""
  });

  // Dynamic row array for tracking inventory items inside the voucher
  const [itemRows, setItemRows] = useState([
    { stockItemId: "", quantity: "", rate: "", amount: "0.00", units: "" }
  ]);

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dependencies (Ledgers and Stock Items) on mount
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const ledgerRes = await fetch(`${API_URL}/api/${companyId}/ledgers`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const ledgerResult = await ledgerRes.json();

        const stockRes = await fetch(`${API_URL}/api/${companyId}/stock-items`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const stockResult = await stockRes.json();

        if (ledgerRes.ok && ledgerResult.success) {
          setLedgers(ledgerResult.data || []);
        }
        if (stockRes.ok && stockResult.success) {
          setStockItems(stockResult.data || []);
        }
      } catch (err) {
        console.error("Voucher matrix load error:", err);
        setAlert({ type: "error", message: "Failed to download dependency master tables." });
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchDependencies();
  }, [companyId, token]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            // F8 → Sales Voucher
            if (e.key === 'F8') {
                e.preventDefault();
                setVoucherType('SALES');
                return;
            }
            // F9 → Purchase Voucher
            if (e.key === 'F9') {
                e.preventDefault();
                setVoucherType('PURCHASE');
                return;
            }
            // Escape → Back to Gateway (Home)
            if (e.key === 'Escape') {
                e.preventDefault();
                navigate(`/${companyId}/gateway`);
                return;
            }
            // Intercepts Ctrl + Alt + P
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            handlePrintInvoice();
            }
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "E") {
            e.preventDefault();
            handleExportInvoiceToExcel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [voucherData, itemRows, companyId, navigate]); 




 
  const partyList = ledgers.filter(l => 
    l.under_group?.toLowerCase().includes("creditors") || 
    l.under_group?.toLowerCase().includes("debtors")
  );

  const accountLedgers = ledgers.filter(l => 
    voucherType === "PURCHASE" 
      ? l.under_group?.toLowerCase().includes("purchase")
      : l.under_group?.toLowerCase().includes("sales")
  );

  const handleItemRowChange = (index, field, value) => {
    const updatedRows = [...itemRows];
    updatedRows[index][field] = value;

    if (field === "stockItemId") {
      const selectedItem = stockItems.find(item => item.id === parseInt(value));
      updatedRows[index]["units"] = selectedItem ? selectedItem.units : "";
    }

    if (field === "quantity" || field === "rate") {
      const qty = parseFloat(updatedRows[index].quantity) || 0;
      const rate = parseFloat(updatedRows[index].rate) || 0;
      updatedRows[index].amount = (qty * rate).toFixed(2);
    }

    setItemRows(updatedRows);
  };

  const addRow = () => {
    setItemRows([...itemRows, { stockItemId: "", quantity: "", rate: "", amount: "0.00", units: "" }]);
  };

  const removeRow = (index) => {
    if (itemRows.length === 1) return;
    setItemRows(itemRows.filter((_, i) => i !== index));
  };

  const grandTotal = itemRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toFixed(2);


  const handleExportInvoiceToExcel = async () => {
  // 1. Setup Amount to Words helper inside the scope
  const amountToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1])[0]] + ' ' + a[Number(n[1])[1]]) + 'Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2])[0]] + ' ' + a[Number(n[2])[1]]) + 'Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3])[0]] + ' ' + a[Number(n[3])[1]]) + 'Thousand ' : '';
    str += (Number(n[4]) != 0) ? a[Number(n[4])] + 'Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5])[0]] + ' ' + a[Number(n[5])[1]]) : '';
    return str ? str + 'Only' : 'Zero Only';
  };

  const partyObj = parties.find(p => p.id === parseInt(voucherData.partyId)) || { ledger_name: "Walking Customer/Debitor" };

  // 2. Create Workbook & Worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoice');

  // Show default grid lines
  worksheet.views = [{ showGridLines: true }];

  // 3. Define Standard Columns (6 Columns wide to mimic layout structure)
  worksheet.columns = [
    { key: 'si_no', width: 8 },         // Col A
    { key: 'description', width: 35 },   // Col B
    { key: 'quantity', width: 14 },      // Col C
    { key: 'rate', width: 14 },          // Col D
    { key: 'per', width: 10 },           // Col E
    { key: 'amount', width: 18 }         // Col F
  ];

  // Global styles for strict Tally monochrome styling
  const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
  const fontRegular = { name: 'Arial', size: 10 };
  const fontBold = { name: 'Arial', size: 11, bold: true };
  
  // Helper to quickly format cell alignments and fonts
  const formatCell = (cell, font = fontRegular, alignment = { vertical: 'middle' }, border = {}) => {
    cell.font = font;
    cell.alignment = alignment;
    if (Object.keys(border).length > 0) cell.border = border;
  };

  // --- ROW 1: HEADER ---
  worksheet.mergeCells('A1:F1');
  const r1 = worksheet.getCell('A1');
  r1.value = 'INVOICE';
  formatCell(r1, { name: 'Arial', size: 14, bold: true }, { alignment: 'center', vertical: 'middle' }, { top: thinBorder, left: thinBorder, right: thinBorder, bottom: thinBorder });
  worksheet.getRow(1).height = 25;

  // --- ROW 2 to 5: COMPANY INFO vs INVOICE META ---
  worksheet.mergeCells('A2:C5');
  const compCell = worksheet.getCell('A2');
  compCell.value = `Test Company\nTest Lane 123, Near This Way\nState Name: Maharashtra, Code: 27\nE-Mail: test@email.com`;
  formatCell(compCell, fontRegular, { vertical: 'top', wrapText: true });

  // Invoice Details Grid Blocks
  worksheet.mergeCells('D2:E2');
  worksheet.getCell('D2').value = 'Invoice No.';
  worksheet.getCell('D2').font = fontBold;
  worksheet.getCell('F2').value = voucherData.supplierInvoiceNo || '1';
  worksheet.getCell('F2').font = fontRegular;

  worksheet.mergeCells('D3:E3');
  worksheet.getCell('D3').value = 'Dated';
  worksheet.getCell('D3').font = fontBold;
  worksheet.getCell('F3').value = voucherData.date || '1-Apr-25';
  worksheet.getCell('F3').font = fontRegular;

  worksheet.mergeCells('D4:E4');
  worksheet.getCell('D4').value = "Buyer's Order No.";
  worksheet.getCell('D4').font = fontBold;

  worksheet.mergeCells('D5:E5');
  worksheet.getCell('D5').value = 'Mode/Terms of Payment';
  worksheet.getCell('D5').font = fontBold;

  // Apply borders for the split header block (Rows 2 to 5)
  for (let r = 2; r <= 5; r++) {
    worksheet.getRow(r).height = 18;
    for (let c = 1; c <= 6; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = {
        top: r === 2 ? thinBorder : undefined,
        bottom: r === 5 ? thinBorder : undefined,
        left: c === 1 || c === 4 ? thinBorder : undefined,
        right: c === 3 || c === 6 ? thinBorder : undefined,
      };
    }
  }

  // --- ROW 6 to 8: CONSIGNEE & BUYER INFORMATION ---
  worksheet.mergeCells('A6:C8');
  const consigneeCell = worksheet.getCell('A6');
  consigneeCell.value = `Consignee (Ship to)\n${partyObj.ledger_name}\nState Name: Maharashtra, Code: 27`;
  formatCell(consigneeCell, fontRegular, { vertical: 'top', wrapText: true });

  worksheet.mergeCells('D6:F8');
  const buyerCell = worksheet.getCell('D6');
  buyerCell.value = `Buyer (Bill to)\n${partyObj.ledger_name}\nState Name: Maharashtra, Code: 27`;
  formatCell(buyerCell, fontRegular, { vertical: 'top', wrapText: true });

  // Apply borders to shipping block
  for (let r = 6; r <= 8; r++) {
    worksheet.getRow(r).height = 18;
    for (let c = 1; c <= 6; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = {
        bottom: r === 8 ? thinBorder : undefined,
        left: c === 1 || c === 4 ? thinBorder : undefined,
        right: c === 3 || c === 6 ? thinBorder : undefined,
      };
    }
  }

  // --- ROW 9: TABLE ITEM HEADERS ---
  const headers = ['SI No.', 'Description of Goods', 'Quantity', 'Rate', 'per', 'Amount'];
  const headerRow = worksheet.getRow(9);
  headerRow.height = 22;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    const align = i === 0 ? 'center' : (i === 5 ? 'right' : 'left');
    formatCell(cell, fontBold, { horizontal: align, vertical: 'middle' }, { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder });
  });

  // --- ROWS 10+: POPULATING DATA ROWS ---
  let currentRowNum = 10;

  itemRows.forEach((row, idx) => {
    const itemObj = stockItems.find(i => i.id === parseInt(row.stockItemId)) || { item_name: "Unknown Stock Item" };
    const r = worksheet.getRow(currentRowNum);
    r.height = 20;

    r.getCell(1).value = idx + 1;
    r.getCell(1).alignment = { horizontal: 'center' };

    r.getCell(2).value = itemObj.item_name;
    r.getCell(2).font = fontBold;

    r.getCell(3).value = `${row.quantity} ${row.units || 'p'}`;
    
    r.getCell(4).value = parseFloat(row.rate || 0);
    r.getCell(4).numFormat = '0.00';

    r.getCell(5).value = (row.units || 'P').toUpperCase();

    r.getCell(6).value = parseFloat(row.amount || 0);
    r.getCell(6).numFormat = '##,##,##0.00'; // Indian numbering format support
    r.getCell(6).font = fontBold;

    // Apply basic vertical borders to simulate an invoice matrix panel
    for (let c = 1; c <= 6; c++) {
      r.getCell(c).font = c === 2 || c === 6 ? fontBold : fontRegular;
      if (c !== 1 && r.getCell(c).alignment?.horizontal !== 'center') {
        r.getCell(c).alignment = { horizontal: c === 6 ? 'right' : 'left', vertical: 'middle' };
      }
      r.getCell(c).border = { left: thinBorder, right: thinBorder };
    }
    currentRowNum++;
  });

  // Inject structural filler padding rows if line rows are sparse to look like real Tally prints
  const structuralPadding = Math.max(0, 5 - itemRows.length);
  for (let i = 0; i < structuralPadding; i++) {
    const r = worksheet.getRow(currentRowNum);
    r.height = 18;
    for (let c = 1; c <= 6; c++) {
      r.getCell(c).border = { left: thinBorder, right: thinBorder };
    }
    currentRowNum++;
  }

  // --- SUMMARY ACCUMULATOR TOTAL ROW ---
  const totalRow = worksheet.getRow(currentRowNum);
  totalRow.height = 22;
  totalRow.getCell(2).value = 'Total';
  
  const totalQty = itemRows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
  totalRow.getCell(3).value = `${totalQty} p`;
  
  totalRow.getCell(6).value = parseFloat(grandTotal);
  totalRow.getCell(6).numFormat = '##,##,##0.00';

  for (let c = 1; c <= 6; c++) {
    totalRow.getCell(c).font = fontBold;
    if (c === 6) totalRow.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(c).border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
  }
  currentRowNum++;

  // --- AMOUNT CHARGEABLE WORDS CELL BLOCK ---
  worksheet.mergeCells(`A${currentRowNum}:F${currentRowNum + 1}`);
  const wordsCell = worksheet.getCell(`A${currentRowNum}`);
  wordsCell.value = `Amount Chargeable (in words)\nINR ${amountToWords(parseFloat(grandTotal))}`;
  formatCell(wordsCell, fontRegular, { vertical: 'top', wrapText: true });
  
  // Apply borders around the words summary block
  for (let r = currentRowNum; r <= currentRowNum + 1; r++) {
    worksheet.getRow(r).height = 18;
    for (let c = 1; c <= 6; c++) {
      worksheet.getCell(r, c).border = {
        bottom: r === currentRowNum + 1 ? thinBorder : undefined,
        left: c === 1 ? thinBorder : undefined,
        right: c === 6 ? thinBorder : undefined,
      };
    }
  }
  currentRowNum += 2;

  // --- FOOTER SIGNATURE & DECLARATION BLOCK ---
  worksheet.mergeCells(`A${currentRowNum}:C${currentRowNum + 3}`);
  const declCell = worksheet.getCell(`A${currentRowNum}`);
  declCell.value = `Declaration:\nWe declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.`;
  formatCell(declCell, { name: 'Arial', size: 8 }, { vertical: 'top', wrapText: true });

  worksheet.mergeCells(`D${currentRowNum}:F${currentRowNum}`);
  const companySignTitle = worksheet.getCell(`D${currentRowNum}`);
  companySignTitle.value = 'for Test Company';
  formatCell(companySignTitle, fontBold, { horizontal: 'right', vertical: 'top' });

  worksheet.mergeCells(`D${currentRowNum + 3}:F${currentRowNum + 3}`);
  const authSign = worksheet.getCell(`D${currentRowNum + 3}`);
  authSign.value = 'Authorised Signatory';
  formatCell(authSign, fontRegular, { horizontal: 'right', vertical: 'bottom' });

  // Draw final bounds structural outer borders
  for (let r = currentRowNum; r <= currentRowNum + 3; r++) {
    worksheet.getRow(r).height = 16;
    for (let c = 1; c <= 6; c++) {
      worksheet.getCell(r, c).border = {
        top: r === currentRowNum && c >= 4 ? thinBorder : undefined,
        bottom: r === currentRowNum + 3 ? thinBorder : undefined,
        left: c === 1 || c === 4 ? thinBorder : undefined,
        right: c === 3 || c === 6 ? thinBorder : undefined,
      };
    }
  }

  // 4. Generate the Binary Data Buffer and trigger browser file delivery link
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Invoice_${voucherData.supplierInvoiceNo || '1'}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  
  // Clean up references from memory
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};


  const handlePrintInvoice = () => {
    
    const amountToWords = (num) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1])[0]] + ' ' + a[Number(n[1])[1]]) + 'Crore ' : '';
        str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2])[0]] + ' ' + a[Number(n[2])[1]]) + 'Lakh ' : '';
        str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3])[0]] + ' ' + a[Number(n[3])[1]]) + 'Thousand ' : '';
        str += (Number(n[4]) != 0) ? a[Number(n[4])] + 'Hundred ' : '';
        str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5])[0]] + ' ' + a[Number(n[5])[1]]) : '';
        return str ? str + 'Only' : 'Zero Only';
    };

    // Find entity references to display formal descriptive labels instead of plain numeric raw foreign keys
    const partyObj = parties.find(p => p.id === parseInt(voucherData.partyId)) || { ledger_name: "Walking Customer/Debitor" };

    const printWindow = window.open("", "_blank");
    
    // Construct a standard Tally Prime monochrome line table invoice box frame
    const htmlContent = `
        <html>
        <head>
        <title>Invoice_${voucherData.supplierInvoiceNo || '1'}</title>
        <style>
            @page { size: A4; margin: 5mm; }
            body { font-family: 'Arial', sans-serif; color: #000; font-size: 11px; margin: 0; padding: 0; }
            .invoice-box { border: 1.5px solid #000; width: 100%; max-width: 210mm; margin: 0 auto; box-sizing: border-box; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px solid #000; }
            .border-r { border-right: 1px solid #000; }
            
            /* Layout Grid Columns mimicking structural PDF layout nodes */
            .flex-container { display: flex; width: 100%; }
            .w-50 { width: 50%; box-sizing: border-box; }
            .p-2 { padding: 6px; }
            
            .header-title { font-size: 14px; font-weight: bold; tracking-space: 1px; padding: 4px 0; border-bottom: 1px solid #000; }
            
            /* Table Layout Core Grid matrices */
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 5px; font-size: 11px; background: transparent; }
            td { border-right: 1px solid #000; padding: 4px 6px; font-size: 11px; vertical-align: top; }
            th:last-child, td:last-child { border-right: none; }
            .item-row { min-height: 250px; }
            
            .footer-declaration { font-size: 9px; padding: 4px; }
            .signatory-box { height: 75px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding: 6px; text-align: right; }
        </style>
        </head>
        <body>
        <div class="invoice-box">
            
            <div class="text-center header-title">INVOICE</div>
            
            <div class="flex-container border-b">
            <div class="w-50 border-r p-2">
                <div class="font-bold font-size: 12px;">Test Company</div>
                <div>Test Lane 123, Near This Way</div>
                <div>State Name: Maharashtra, Code: 27</div>
                <div>E-Mail: test@email.com</div>
            </div>
            <div class="w-50">
                <div class="flex-container border-b">
                <div class="w-50 border-r p-2">
                    <span class="font-bold">Invoice No.</span><br/>
                    <span>${voucherData.supplierInvoiceNo || '1'}</span>
                </div>
                <div class="w-50 p-2">
                    <span class="font-bold">Dated</span><br/>
                    <span>${voucherData.date || '1-Apr-25'}</span>
                </div>
                </div>
                <div class="flex-container">
                <div class="w-50 border-r p-2">
                    <span class="font-bold">Buyer's Order No.</span><br/>&nbsp;
                </div>
                <div class="w-50 p-2">
                    <span class="font-bold">Mode/Terms of Payment</span><br/>&nbsp;
                </div>
                </div>
            </div>
            </div>

            <div class="flex-container border-b">
            <div class="w-50 border-r p-2">
                <div class="text-gray-500 font-bold" style="font-size: 10px;">Consignee (Ship to)</div>
                <div class="font-bold">${partyObj.ledger_name}</div>
                <div>State Name: Maharashtra, Code: 27</div>
            </div>
            <div class="w-50 p-2">
                <div class="text-gray-500 font-bold" style="font-size: 10px;">Buyer (Bill to)</div>
                <div class="font-bold">${partyObj.ledger_name}</div>
                <div>State Name: Maharashtra, Code: 27</div>
            </div>
            </div>

            <table class="border-b">
            <thead>
                <tr>
                <th style="width: 8%;">SI No.</th>
                <th style="text-align: left;">Description of Goods</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 15%;">Rate</th>
                <th style="width: 10%;">per</th>
                <th style="width: 18%; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows.map((row, idx) => {
                const itemObj = stockItems.find(i => i.id === parseInt(row.stockItemId)) || { item_name: "Unknown Stock Item" };
                return `
                    <tr class="item-row">
                    <td class="text-center">${idx + 1}</td>
                    <td><span class="font-bold">${itemObj.item_name}</span></td>
                    <td>${row.quantity} ${row.units || 'p'}</td>
                    <td>${parseFloat(row.rate || 0).toFixed(2)}</td>
                    <td style="text-transform: uppercase;">${row.units || 'P'}</td>
                    <td class="text-right font-bold">${parseFloat(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `;
                }).join('')}
                
                ${Array(Math.max(0, 5 - itemRows.length)).fill(0).map(() => `
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                `).join('')}

                <tr style="border-top: 1px solid #000; font-weight: bold;">
                <td class="text-center"></td>
                <td>Total</td>
                <td>${itemRows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0)} p</td>
                <td></td>
                <td></td>
                <td class="text-right">₹ ${parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
            </table>

            <div class="border-b p-2">
            <span style="font-size: 10px;">Amount Chargeable (in words)</span><br/>
            <span class="font-bold">INR ${amountToWords(parseFloat(grandTotal))}</span>
            </div>

            <div class="flex-container">
            <div class="w-50 border-r footer-declaration p-2">
                <span class="font-bold" style="text-decoration: underline;">Declaration:</span><br/>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
            <div class="w-50 signatory-box">
                <div class="font-bold" style="font-size: 10px;">for Test Company</div>
                <div style="font-size: 9px; font-weight: normal; color: #555;">Authorised Signatory</div>
            </div>
            </div>

        </div>
        
        <script>
            window.onload = function() {
            window.print();
            // Auto close the worker tab array window stream clear context after system processing actions finish
            setTimeout(() => { window.close(); }, 500);
            };
        </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const validItems = itemRows.filter(row => row.stockItemId && row.quantity && row.rate);
    if (validItems.length === 0) {
      setAlert({ type: "error", message: "Please assign at least one valid item row." });
      return;
    }

    const payload = {
      ...voucherData,
      voucherType, // Sends 'PURCHASE' or 'SALES' to route dynamically
      items: validItems,
      totalAmount: grandTotal
    };

    const endpoint = `${API_URL}/api/${companyId}/vouchers/${voucherType.toLowerCase()}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setAlert({ type: "success", message: `${voucherType === "PURCHASE" ? "Purchase" : "Sales"} Voucher accepted and saved.` });
        setVoucherData({ supplierInvoiceNo: "", date: new Date().toISOString().split('T')[0], partyId: "", accountLedgerId: "", narration: "" });
        setItemRows([{ stockItemId: "", quantity: "", rate: "", amount: "0.00", units: "" }]);
      } else {
        setAlert({ type: "error", message: result.message || "Failed to process database entry." });
      }
    } catch (err) {
      setAlert({ type: "error", message: "A network configuration error layer failed." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium font-sans">Synchronizing Master Registries...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#edf2f7] flex">
      
      {/* LEFT COLUMN: Main Accounting Workspace */}
      <div className="flex-1 p-4 flex flex-col justify-start">
        <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden flex flex-col justify-between min-h-[88vh]">
          
          {/* Voucher Header Panel */}
          <div className="bg-[#1a202c] text-gray-200 px-4 py-2.5 flex items-center justify-between border-b border-gray-700 text-xs">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} className="hover:bg-gray-700 p-1 rounded text-gray-400 hover:text-white">
                <ArrowLeft size={16} />
              </button>
              <h1 className="font-bold tracking-wide text-white font-sans uppercase">
                Accounting Voucher Creation
              </h1>
            </div>
            <span className={`px-3 py-0.5 rounded font-sans font-bold uppercase text-[11px] ${
              voucherType === "PURCHASE" ? "bg-emerald-800 text-emerald-100" : "bg-blue-800 text-blue-100"
            }`}>
              {voucherType} NO. 2
            </span>
          </div>

          {alert && (
            <div className={`mx-4 mt-3 p-3 border text-xs rounded-lg flex items-center gap-2 ${
              alert.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <CheckCircle2 size={16} className={alert.type === "success" ? "text-emerald-600" : "text-red-600"} />
              <p className="font-medium">{alert.message}</p>
            </div>
          )}

          {/* Metadata Grid Form fields */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-[#f7fafc] border-b border-gray-200 text-xs font-sans">
            <div className="space-y-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-gray-600 font-bold">{voucherType === "PURCHASE" ? "Supplier Invoice No." : "Ref / Invoice No."}</label>
                <input type="text" value={voucherData.supplierInvoiceNo} onChange={(e) => setVoucherData({...voucherData, supplierInvoiceNo: e.target.value})} className="col-span-2 rounded border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 bg-white" required />
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-gray-600 font-bold">Party A/c name</label>
                <select value={voucherData.partyId} onChange={(e) => setVoucherData({...voucherData, partyId: e.target.value})} className="col-span-2 rounded border border-gray-300 px-2 py-1 bg-white focus:outline-none" required>
                  <option value="">-- Select Ledger Account --</option>
                  {partyList.map(p => <option key={p.id} value={p.id}>{p.ledger_name} ({p.under_group})</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-gray-600 font-bold">Date</label>
                <input type="date" value={voucherData.date} onChange={(e) => setVoucherData({...voucherData, date: e.target.value})} className="col-span-2 rounded border border-gray-300 px-2 py-1 focus:outline-none bg-white" required />
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-gray-600 font-bold">{voucherType === "PURCHASE" ? "Purchase ledger" : "Sales ledger"}</label>
                <select value={voucherData.accountLedgerId} onChange={(e) => setVoucherData({...voucherData, accountLedgerId: e.target.value})} className="col-span-2 rounded border border-gray-300 px-2 py-1 bg-white focus:outline-none" required>
                  <option value="">-- Choose Book Account --</option>
                  {accountLedgers.map(al => <option key={al.id} value={al.id}>{al.ledger_name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Table Layout Context */}
          <div className="p-4 flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-gray-300 font-bold text-gray-500 uppercase bg-gray-100">
                  <th className="py-2 px-2">Name of Item</th>
                  <th className="py-2 px-2 w-36">Quantity</th>
                  <th className="py-2 px-2 w-36">Rate per Unit</th>
                  <th className="py-2 px-2 w-40 text-right">Amount</th>
                  <th className="py-2 px-2 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-1">
                      <select value={row.stockItemId} onChange={(e) => handleItemRowChange(index, "stockItemId", e.target.value)} className="w-full rounded border border-gray-200 p-1 bg-white focus:outline-none text-gray-800" required>
                        <option value="">-- Choose Stock Item --</option>
                        {stockItems.map(item => <option key={item.id} value={item.id}>{item.item_name}</option>)}
                      </select>
                    </td>
                    <td className="py-2 px-1">
                      <div className="flex items-center gap-1 border border-gray-200 rounded bg-white px-1.5">
                        <input type="number" value={row.quantity} onChange={(e) => handleItemRowChange(index, "quantity", e.target.value)} placeholder="0" className="w-full py-1 text-right outline-none" required />
                        {row.units && <span className="text-[10px] text-gray-400 font-bold">{row.units}</span>}
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <div className="flex items-center gap-0.5 border border-gray-200 rounded bg-white px-1.5">
                        <span className="text-gray-400">₹</span>
                        <input type="number" step="0.01" value={row.rate} onChange={(e) => handleItemRowChange(index, "rate", e.target.value)} placeholder="0.00" className="w-full py-1 text-right outline-none" required />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-gray-700">
                      ₹ {row.amount}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button type="button" onClick={() => removeRow(index)} disabled={itemRows.length === 1} className="text-gray-300 hover:text-red-500 disabled:opacity-25">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={addRow} className="mt-3 flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded text-[11px] font-bold text-gray-600 transition-all">
              <Plus size={12} /> Add Line Item
            </button>
          </div>

          {/* Footer Ledger Totals */}
          <div className="border-t border-gray-300 bg-[#f7fafc] p-4 flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center font-sans text-xs">
            <div className="w-full sm:max-w-md">
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Narration</label>
              <textarea value={voucherData.narration} onChange={(e) => setVoucherData({...voucherData, narration: e.target.value})} placeholder="Optional logs..." rows={1} className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 bg-white resize-none" />
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Balance</span>
                <span className="text-xl font-bold text-gray-800">₹ {grandTotal}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => navigate(-1)} className="px-4 py-1 border border-gray-300 rounded bg-white font-semibold text-gray-700 hover:bg-gray-50">
                  Quit
                </button>
                <button type="submit" className="px-4 py-1 bg-[#2d3748] hover:bg-[#1a202c] rounded font-semibold text-white shadow">
                  Accept
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* RIGHT COLUMN: The Tally Sidebar Menu Layout Grid */}
      <div className="w-44 bg-[#e2e8f0] border-l border-gray-300 flex flex-col text-[11px] font-sans select-none">
        <div className="bg-[#2d3748] text-white p-2 font-bold text-center tracking-wider uppercase border-b border-gray-600 text-[10px]">
          Voucher Types
        </div>

       
        <button 
            type="button" 
            onClick={handlePrintInvoice}
            className="w-full text-left px-3 py-2 border-b border-gray-300 bg-[#edf2f7] text-gray-800 hover:bg-gray-300 font-bold flex justify-between"
            >
            <span>P: Print</span>
            <span className="text-gray-400 font-normal">Ctrl+Alt+P</span>
        </button>
        <button 
            type="button" 
            onClick={handleExportInvoiceToExcel}
            className="w-full text-left px-3 py-2 border-b border-gray-300 bg-[#edf2f7] text-gray-800 hover:bg-gray-300 font-bold flex justify-between"
            >
            <span>E: Export</span>
            <span className="text-gray-400 font-normal">Ctrl+Alt+E</span>
        </button>




        {/* Dynamic Route/State Swappers */}
        <button 
          type="button" 
          onClick={() => {
            setVoucherType("SALES");
            setVoucherData(prev => ({ ...prev, accountLedgerId: "" })); // Clear selection to prevent cross-contamination
          }}
          className={`w-full text-left px-3 py-2 border-b border-gray-300 font-bold flex justify-between transition-colors ${
            voucherType === "SALES" 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-[#edf2f7] text-gray-800 hover:bg-gray-300"
          }`}
        >
          <span>F8: Sales</span>
          <span className={voucherType === "SALES" ? "text-blue-200" : "text-gray-400 font-normal"}>✔</span>
        </button>

        <button 
          type="button" 
          onClick={() => {
            setVoucherType("PURCHASE");
            setVoucherData(prev => ({ ...prev, accountLedgerId: "" }));
          }}
          className={`w-full text-left px-3 py-2 border-b border-gray-300 font-bold flex justify-between transition-colors ${
            voucherType === "PURCHASE" 
              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
              : "bg-[#edf2f7] text-gray-800 hover:bg-gray-300"
          }`}
        >
          <span>F9: Purchase</span>
          <span className={voucherType === "PURCHASE" ? "text-emerald-200" : "text-gray-400 font-normal"}>✔</span>
        </button>

        <div className="flex-1 bg-[#edf2f7]"></div>
        
        <div className="p-2 text-center text-[9px] text-gray-400 border-t border-gray-300 bg-gray-100 font-sans">
          Press shortcut buttons to cycle transaction books.
        </div>
      </div>

    </div>
  );
}