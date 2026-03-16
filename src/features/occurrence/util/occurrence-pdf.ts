import { Occurrence } from '@/features/occurrence/types';
import { imageExtensions } from '@/types/file';
import { base64ByElement } from '@/utils/base64';
import { formatCnpj } from '@/utils/cnpj';
import { getFileName } from '@/utils/file';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

type OccurrencePdfInput = Occurrence & {
  resolution?: string | null;
};

export const generateOccurrencePdfObject = async (
  occurrence: OccurrencePdfInput | null,
) => {
  if (!occurrence) return [];

  const files = [];

  for await (const file of occurrence.documents || []) {
    const extension = (file?.type || '').toLowerCase();

    if (imageExtensions.includes(extension)) {
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

  const occurrenceDate = occurrence.date || occurrence.createdAt;
  const resolutionText = occurrence.resolution || occurrence.observation;

  const content: TDocumentDefinitions['content'] = [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: `DADOS DA OCORRÊNCIA: ${occurrence.title?.toUpperCase() || '-'}`,
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: `CLIENTE: ${occurrence.client?.name || '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `CNPJ: ${formatCnpj(occurrence.client?.cnpj || '') || '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `ENDEREÇO: ${occurrence.client?.address || '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `TIPO DA OCORRÊNCIA: ${occurrence.type?.name || occurrence.typeId || 'Não informado'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `DATA DA OCORRÊNCIA: ${occurrenceDate ? format(new Date(occurrenceDate), 'dd/MM/yyyy - HH:mm', { locale: ptBR }) : '-'}`,
              fontSize: 10,
            },
          ],
          [
            {
              text: `RESPONSÁVEL: ${occurrence.responsible?.name || occurrence.createdBy?.name || '-'}`,
              fontSize: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    },
    {
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'RELATO DA OCORRÊNCIA',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: occurrence.description || '-',
              fontSize: 10,
              margin: 10,
            },
          ],
        ],
      },
      margin: [0, 20, 0, 0],
    },
  ];

  if (resolutionText) {
    content.push({
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [
            {
              text: 'TRATATIVA DA OCORRÊNCIA',
              alignment: 'center',
              fontSize: 12,
              bold: true,
              fillColor: '#f2f2f2',
            },
          ],
          [
            {
              text: resolutionText,
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
    content.push(
      {
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: 'DOCUMENTOS ANEXADOS',
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
          if (file?.image) {
            return {
              image: file.image,
              width: file.width,
              height: file.height,
              link: file.url,
            };
          }

          return {
            text: `${file.name?.substring(0, 10) || 'arquivo'}.${file.type || ''}`,
            link: file.url,
            style: 'subtitle',
            bold: true,
            margin: [0, 30],
            color: '#0000EE',
            decoration: 'underline',
          };
        }),
      },
    );
  }

  return content;
};