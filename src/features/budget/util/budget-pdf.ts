import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Budget, budgetStatusLabels } from "../types/budget";

export const generateBudgetPdfObject = async (budget: Budget | null) => {
  if (!budget) return [];

  const content: TDocumentDefinitions["content"] = [
    {
      table: {
        headerRows: 1,
        widths: ["*"],
        body: [
          [
            {
              text: `DADOS DO ORÇAMENTO: ${budget.title?.toUpperCase()}`,
              alignment: "center",
              fontSize: 12,
              bold: true,
              fillColor: "#f2f2f2",
              borderColor: ["#000", "#000", "#000", "#f2f2f2"],
            },
          ],
        ],
      },
    },
    {
      table: {
        headerRows: 1,
        widths: ["*", "*"],
        body: [
          [
            { text: `PROTOCOLO: ${budget.protocol}`, fontSize: 10 },
            {
              text: `STATUS: ${budgetStatusLabels[budget.status]?.label}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CRIADO EM: ${format(
                new Date(budget.createdAt),
                "dd/MM/yyyy - HH:mm",
                { locale: ptBR }
              )}`,
              fontSize: 10,
            },
            {
              text: `ATUALIZADO EM: ${format(
                new Date(budget.updatedAt),
                "dd/MM/yyyy - HH:mm",
                { locale: ptBR }
              )}`,
              fontSize: 10,
            },
          ],
          [
            { text: `CLIENTE: ${budget.client?.name ?? "-"}`, fontSize: 10 },
            {
              text: `RESPONSÁVEL: ${budget.responsible?.name ?? "-"}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `TIPO: ${budget.type?.name ?? budget.typeId ?? "-"}`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
          [
            {
              text: `CRIADO POR: ${budget.createdBy?.name ?? "-"}`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
        ],
      },
    },
  ];

  // descrição
  if (budget.description) {
    content.push({
      table: {
        headerRows: 1,
        widths: ["*"],
        body: [
          [
            {
              text: "DESCRIÇÃO DO ORÇAMENTO",
              alignment: "center",
              fontSize: 12,
              bold: true,
              fillColor: "#f2f2f2",
            },
          ],
          [{ text: budget.description, fontSize: 10, margin: 10 }],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  // itens
  const items = budget.items || [];
  if (items.length > 0) {
    const rows: any[] = [];
    rows.push([
      { text: "DESCRIÇÃO", bold: true },
      { text: "QTDE", bold: true, alignment: "right" },
      { text: "VALOR UNIT.", bold: true, alignment: "right" },
      { text: "SUBTOTAL", bold: true, alignment: "right" },
    ]);

    let total = 0;
    for (const it of items) {
      const qty = it.quantity ?? 0;
      const unit = it.value ?? 0;
      const subtotal = qty * unit;
      total += subtotal;
      rows.push([
        { text: it.label ?? "-" },
        { text: String(qty), alignment: "right" },
        {
          text: unit.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          alignment: "right",
        },
        {
          text: subtotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          alignment: "right",
        },
      ]);
    }

    rows.push([
      { text: "TOTAL", colSpan: 3, alignment: "right" },
      {},
      {},
      {
        text: total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        alignment: "right",
        bold: true,
      },
    ]);

    content.push({
      table: { headerRows: 1, widths: ["*", 60, 100, 100], body: rows },
      margin: [0, 20, 0, 0],
    } as any);
  }

  // observação
  if (budget.observation) {
    content.push({
      table: {
        headerRows: 1,
        widths: ["*"],
        body: [
          [
            {
              text: "OBSERVAÇÃO",
              alignment: "center",
              fontSize: 12,
              bold: true,
              fillColor: "#f2f2f2",
            },
          ],
          [{ text: budget.observation, fontSize: 10, margin: 10 }],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  return content;
};
