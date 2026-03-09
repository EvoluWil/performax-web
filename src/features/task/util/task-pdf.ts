import { Task, taskStatusLabels } from '@/features/task/types';
import { imageExtensions } from '@/types/file';
import { base64ByElement } from '@/utils/base64';
import { formatCnpj } from '@/utils/cnpj';
import { getFileName } from '@/utils/file';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const generateTaskPdfObject = async (task: Task | null) => {
  if (!task) return [];
  const files = [];
  const finalizationFiles = [];

  for await (const file of task.files) {
    if (imageExtensions.includes(file?.type)) {
      const result = await base64ByElement(file.url);
      files.push({
        ...file,
        image: result.image,
        name: getFileName(file),
        width: result.width,
        height: result.height,
      });
    } else {
      files.push({
        ...file,
        name: getFileName(file),
      });
    }
  }

  for await (const finalizationFile of task?.conclusionFiles) {
    if (imageExtensions.includes(finalizationFile?.type)) {
      const result = await base64ByElement(finalizationFile.url);
      finalizationFiles.push({
        ...finalizationFile,
        image: result.image,
        name: getFileName(finalizationFile),
        width: result.width,
        height: result.height,
      });
    } else {
      finalizationFiles.push({
        ...finalizationFile,
        name: getFileName(finalizationFile),
      });
    }
  }

  const content: TDocumentDefinitions['content'] = [
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: `DADOS DA OS: ${task.title?.toUpperCase()}`,
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
              borderColor: ['#000', '#000', '#000', '#f2f2f2'],
            },
          ],
        ],
      },
    },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          [
            {
              text: `PROTOCOLO: ${task.protocol}`,
              fontSize: 10,
            },
            {
              text: `STATUS: ${taskStatusLabels[task.status]?.label}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CRIADA EM: ${format(
                new Date(task.createdAt),
                'dd/MM/yyyy - HH:mm',
                { locale: ptBR },
              )}`,
              fontSize: 10,
            },
            {
              text: `ULTIMA ATUALIZAÇÃO: ${format(
                new Date(task.updatedAt),
                'dd/MM/yyyy - HH:mm',
                { locale: ptBR },
              )}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CLIENTE: ${task.client?.name}`,
              fontSize: 10,
            },
            {
              text: `CNPJ: ${formatCnpj(task.client?.cnpj)}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `ENDEREÇO: ${task.client?.address}`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
          [
            {
              text: `DATA PREVISTA: ${format(
                new Date(task.date),
                'dd/MM/yyyy - HH:mm',
                { locale: ptBR },
              )}`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
          [
            {
              text: `RESPONSÁVEL: ${task.responsible?.name}`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
          [
            {
              text: `VALOR: ${
                task.value && task.value > 0
                  ? task.value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  : '-'
              }`,
              fontSize: 10,
              colSpan: 2,
            },
          ],
        ],
      },
    },
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'DESCRIÇÃO DA OS',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: task.description,
              fontSize: 10,
              margin: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    },
  ];

  // metadata (created/updated/completed/by whom)
  content.push({
    table: {
      headerRows: 0,
      widths: ['*', '*'],
      body: [
        [
          {
            text: `TIPO: ${task.type?.name ?? task.typeId ?? '-'}`,
            fontSize: 10,
          },
          {
            text: `CONCLUÍDA: ${
              task.completedAt
                ? format(new Date(task.completedAt), 'dd/MM/yyyy - HH:mm', {
                    locale: ptBR,
                  })
                : '-'
            }`,
            fontSize: 10,
          },
        ],
        [
          { text: `CRIADA POR: ${task.createdBy?.name ?? '-'}`, fontSize: 10 },
          {
            text: `ATUALIZADA POR: ${task.updatedBy?.name ?? '-'}`,
            fontSize: 10,
          },
        ],
      ],
    },
    margin: [0, 10, 0, 0],
  });

  // checklist
  if (
    task.checklist &&
    Array.isArray(task.checklist.modules) &&
    task.checklist.modules.length > 0
  ) {
    content.push({
      text: 'CHECKLIST',
      alignment: 'center',
      fontSize: 12,
      bold: true,
      fillColor: '#f2f2f2',
      margin: [0, 20, 0, 6],
    } as any);
    for (const mod of task.checklist.modules) {
      content.push({
        text: mod.name,
        fontSize: 11,
        bold: true,
        margin: [0, 6, 0, 4],
      } as any);
      const rows: any[] = [];
      for (const it of mod.items || []) {
        let value = '-';
        const t = (it.expectedType || '').toString().toUpperCase();
        if (t === 'BOOLEAN')
          value =
            it.valueBoolean === null || it.valueBoolean === undefined
              ? 'Sem resposta'
              : it.valueBoolean
                ? 'Sim'
                : 'Não';
        else if (t === 'NUMBER')
          value =
            it.valueNumber === null || it.valueNumber === undefined
              ? ''
              : String(it.valueNumber);
        else value = it.valueText ?? '';
        rows.push([
          { text: it.question, fontSize: 10 },
          { text: value, fontSize: 10 },
        ]);
      }
      content.push({
        table: { headerRows: 0, widths: ['*', 120], body: rows },
      } as any);
    }
  }

  // conclusion note
  if (task.conclusionNote) {
    content.push({
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'RESUMO DE CONCLUSÃO',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [{ text: task.conclusionNote, fontSize: 10, margin: 10 }],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  if (task.internalNote) {
    content.push({
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'OBSERVAÇÕES',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: task.internalNote,
              fontSize: 10,
              margin: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  if (task.impedimentNote && task.status === 'IMPEDED') {
    content.push({
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'MOTIVO DO IMPEDIMENTO',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: task.impedimentNote,
              fontSize: 10,
              margin: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  if (files.length > 0) {
    content.push([
      {
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: 'ARQUIVOS ANEXADOS',
                alignment: 'center',
                fontSize: 12,
                bold: true,
                fillColor: '#f2f2f2',
              },
            ],
          ],
        },
        margin: [0, 20, 0, 0],
      },
      {
        columnGap: 10,
        margin: [0, 10, 0, 0],
        columns: files.map((file: any) => {
          if ((file as any)?.image) {
            return {
              image: file?.image,
              width: file.width,
              height: file.height,
              link: file.url,
            };
          } else {
            return {
              text: file.name?.substring(0, 10) + '.' + file.type,
              link: file.url,
              style: 'subtitle',
              bold: true,
              margin: [0, 30],
              color: '#0000EE',
              decoration: 'underline',
            };
          }
        }),
      },
    ]);
  }

  if (task.service) {
    content.push({
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'SERVIÇO REALIZADO',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: task.service,
              fontSize: 10,
              margin: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    });
  }

  if (finalizationFiles.length > 0) {
    content.push([
      {
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: 'ARQUIVOS DA EXECUÇÃO ANEXADOS',
                alignment: 'center',
                fontSize: 12,
                bold: true,
                fillColor: '#f2f2f2',
              },
            ],
          ],
        },
        margin: [0, 20, 0, 0],
      },
      {
        columnGap: 10,
        margin: [0, 10, 0, 0],
        columns: finalizationFiles.map((file: any) => {
          if ((file as any)?.image) {
            return {
              image: file?.image,
              width: file.width,
              height: file.height,
              link: file.url,
            };
          } else {
            return {
              text: file.name?.substring(0, 10) + '.' + file.type,
              link: file.url,
              style: 'subtitle',
              bold: true,
              margin: [0, 30],
              color: '#0000EE',
              decoration: 'underline',
            };
          }
        }),
      },
    ]);
  }

  return content;
};
