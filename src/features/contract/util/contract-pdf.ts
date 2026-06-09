import { Contract } from '@/features/contract/types';
import { File as StoredFile } from '@/types/file';
import { formatCnpj } from '@/utils/cnpj';
import { generateAndUploadDetailPdf } from '@/utils/detail-pdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Content } from 'pdfmake/interfaces';

export type ContractPdfCompany = {
  name: string;
};

const formatCurrency = (value?: number) =>
  ((value ?? 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatLongDate = (value?: string | Date | null) => {
  if (!value) return null;
  return format(new Date(value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const clause = (
  title: string,
  body: string,
  marginTop = 12,
): Content => ({
  text: [
    { text: `${title}\n`, bold: true, fontSize: 10 },
    { text: body, fontSize: 10 },
  ],
  alignment: 'justify',
  margin: [0, marginTop, 0, 0],
  lineHeight: 1.35,
});

const buildTermText = (contract: Contract): string => {
  const start = formatLongDate(contract.startDate);
  const end = formatLongDate(contract.endDate);

  if (start && end) {
    return `O presente contrato vigorará de ${start} a ${end}, podendo ser prorrogado mediante termo aditivo escrito entre as partes.`;
  }
  if (start) {
    return `O presente contrato vigorará a partir de ${start}, por prazo indeterminado, podendo ser rescindido conforme cláusula específica neste instrumento.`;
  }
  if (end) {
    return `O presente contrato vigorará até ${end}, contado da data de assinatura deste instrumento.`;
  }
  return 'O presente contrato vigorará por prazo indeterminado, podendo ser rescindido conforme cláusula específica neste instrumento.';
};

const buildPaymentText = (contract: Contract): string => {
  const value = formatCurrency(contract.value);
  const dueDay = contract.dueDate
    ? format(new Date(contract.dueDate), 'dd')
    : null;

  let text = `Pela prestação dos serviços e manutenção objeto deste contrato, a CONTRATANTE pagará à CONTRATADA o valor mensal de ${value}, `;

  if (dueDay) {
    text += `com vencimento no dia ${dueDay} de cada mês, mediante emissão de nota fiscal/fatura pela CONTRATADA.`;
  } else {
    text += 'mediante emissão de nota fiscal/fatura pela CONTRATADA, em data acordada entre as partes.';
  }

  text +=
    ' Os valores poderão ser reajustados anualmente com base no índice IGPM/FGV ou outro índice legalmente aplicável, mediante comunicação prévia de 30 (trinta) dias à CONTRATANTE.';

  return text;
};

const buildObjectText = (contract: Contract): string => {
  const typeName = contract.type?.name ?? 'Prestação de Serviços e Manutenção';

  if (contract.scope?.trim()) {
    return (
      `O presente contrato tem por objeto a prestação de serviços especializados e serviços de manutenção, ` +
      `na modalidade "${typeName}", conforme especificações abaixo:\n\n${contract.scope.trim()}\n\n` +
      `A CONTRATADA executará os serviços com observância das normas técnicas aplicáveis, ` +
      `utilizando mão de obra qualificada e materiais adequados, salvo disposição em contrário acordada entre as partes.`
    );
  }

  return (
    `O presente contrato tem por objeto a prestação de serviços especializados e serviços de manutenção ` +
    `preventiva e corretiva, na modalidade "${typeName}", compreendendo:\n\n` +
    `a) execução dos serviços técnicos necessários ao pleno funcionamento dos equipamentos/sistemas sob responsabilidade da CONTRATANTE;\n` +
    `b) manutenção preventiva periódica conforme cronograma acordado entre as partes;\n` +
    `c) atendimento corretivo em caso de falhas, dentro dos prazos e condições acordados;\n` +
    `d) fornecimento de relatórios técnicos quando aplicável.\n\n` +
    `A CONTRATADA executará os serviços com observância das normas técnicas aplicáveis, ` +
    `utilizando mão de obra qualificada e materiais adequados.`
  );
};

export const generateContractPdfContents = (
  contract: Contract,
  company: ContractPdfCompany,
): Content[] => {
  const companyName = company.name || 'CONTRATADA';
  const clientName = contract.client?.name ?? 'CONTRATANTE';
  const clientCnpj = contract.client?.cnpj
    ? formatCnpj(contract.client.cnpj)
    : '_______________________';
  const clientAddress = contract.client?.address?.trim() || '_______________________';
  const typeName = contract.type?.name ?? 'Prestação de Serviços e Manutenção';
  const signedAt = format(new Date(), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return [
    {
      text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS E MANUTENÇÃO',
      alignment: 'center',
      bold: true,
      fontSize: 13,
      margin: [0, 0, 0, 4],
    },
    {
      text: typeName.toUpperCase(),
      alignment: 'center',
      fontSize: 10,
      margin: [0, 0, 0, 16],
    },
    {
      text: [
        'Pelo presente instrumento particular, as partes abaixo qualificadas:\n\n',
        { text: 'CONTRATADA: ', bold: true },
        `${companyName}, pessoa jurídica de direito privado, doravante denominada CONTRATADA;\n\n`,
        { text: 'CONTRATANTE: ', bold: true },
        `${clientName}, inscrita no CNPJ sob nº ${clientCnpj}, com sede/endereço em ${clientAddress}, doravante denominada CONTRATANTE;\n\n`,
        'As partes acima identificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços e Manutenção, que se regerá pelas cláusulas e condições seguintes:',
      ],
      alignment: 'justify',
      fontSize: 10,
      lineHeight: 1.35,
    },

    clause('CLÁUSULA PRIMEIRA — DO OBJETO', buildObjectText(contract)),

    clause('CLÁUSULA SEGUNDA — DO PRAZO', buildTermText(contract)),

    clause('CLÁUSULA TERCEIRA — DO VALOR E FORMA DE PAGAMENTO', buildPaymentText(contract)),

    clause(
      'CLÁUSULA QUARTA — DAS OBRIGAÇÕES DA CONTRATADA',
      'São obrigações da CONTRATADA:\n\n' +
        'a) executar os serviços objeto deste contrato com zelo, diligência e qualidade técnica;\n' +
        'b) manter sigilo sobre informações confidenciais da CONTRATANTE;\n' +
        'c) designar profissionais habilitados para a execução dos serviços;\n' +
        'd) comunicar previamente à CONTRATANTE eventuais impedimentos ou necessidade de alteração de cronograma;\n' +
        'e) emitir a documentação fiscal correspondente aos serviços prestados;\n' +
        'f) cumprir a legislação trabalhista, previdenciária, fiscal e ambiental aplicável à execução dos serviços.',
    ),

    clause(
      'CLÁUSULA QUINTA — DAS OBRIGAÇÕES DA CONTRATANTE',
      'São obrigações da CONTRATANTE:\n\n' +
        'a) efetuar o pagamento nos prazos e condições estipulados neste contrato;\n' +
        'b) fornecer acesso, informações e condições necessárias à execução dos serviços;\n' +
        'c) designar representante para acompanhamento e recebimento dos serviços;\n' +
        'd) comunicar por escrito eventuais não conformidades no prazo de 5 (cinco) dias úteis após a execução;\n' +
        'e) responsabilizar-se por equipamentos, instalações e dados fornecidos à CONTRATADA, salvo dolo ou culpa desta.',
    ),

    clause(
      'CLÁUSULA SEXTA — DA CONFIDENCIALIDADE',
      'As partes comprometem-se a manter sigilo sobre informações técnicas, comerciais, financeiras ou operacionais ' +
        'a que tiverem acesso em razão deste contrato, durante sua vigência e por 2 (dois) anos após o término, ' +
        'salvo determinação legal ou judicial em contrário.',
    ),

    clause(
      'CLÁUSULA SÉTIMA — DA RESCISÃO',
      'O presente contrato poderá ser rescindido:\n\n' +
        'a) por acordo mútuo entre as partes, mediante termo escrito;\n' +
        'b) por inadimplemento de qualquer cláusula, após notificação com prazo de 15 (quinze) dias para regularização;\n' +
        'c) por denúncia imotivada de qualquer das partes, mediante aviso prévio de 30 (trinta) dias.\n\n' +
        'Na rescisão, a CONTRATANTE pagará os serviços efetivamente prestados até a data do encerramento.',
    ),

    clause(
      'CLÁUSULA OITAVA — DAS DISPOSIÇÕES GERAIS',
      'a) Este contrato não estabelece vínculo empregatício entre as partes ou entre a CONTRATADA e colaboradores da CONTRATANTE;\n' +
        'b) Alterações somente produzirão efeito se formalizadas por escrito e assinadas pelas partes;\n' +
        'c) A tolerância de uma parte quanto ao descumprimento de cláusula não implica renúncia ou novação;\n' +
        'd) Fica eleito o foro da comarca da sede da CONTRATANTE para dirimir quaisquer controvérsias oriundas deste contrato, ' +
        'com renúncia a qualquer outro, por mais privilegiado que seja.',
    ),

    {
      text: `E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.`,
      alignment: 'justify',
      fontSize: 10,
      margin: [0, 20, 0, 8],
      lineHeight: 1.35,
    },

    {
      text: `Local e data: ___________________________, ${signedAt}.`,
      alignment: 'center',
      fontSize: 10,
      margin: [0, 0, 0, 24],
    },

    {
      columns: [
        {
          width: '*',
          stack: [
            { text: '________________________________________', alignment: 'center', fontSize: 10 },
            { text: companyName, alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 0] },
            { text: 'CONTRATADA', alignment: 'center', fontSize: 9, color: '#555555' },
          ],
        },
        {
          width: '*',
          stack: [
            { text: '________________________________________', alignment: 'center', fontSize: 10 },
            { text: clientName, alignment: 'center', bold: true, fontSize: 10, margin: [0, 4, 0, 0] },
            { text: 'CONTRATANTE', alignment: 'center', fontSize: 9, color: '#555555' },
          ],
        },
      ],
      margin: [0, 16, 0, 24],
    },

    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Testemunha 1', bold: true, fontSize: 9 },
            { text: 'Nome: _______________________________', fontSize: 9, margin: [0, 8, 0, 0] },
            { text: 'CPF:  _______________________________', fontSize: 9, margin: [0, 4, 0, 0] },
          ],
        },
        {
          width: '*',
          stack: [
            { text: 'Testemunha 2', bold: true, fontSize: 9 },
            { text: 'Nome: _______________________________', fontSize: 9, margin: [0, 8, 0, 0] },
            { text: 'CPF:  _______________________________', fontSize: 9, margin: [0, 4, 0, 0] },
          ],
        },
      ],
    },
  ];
};

export const getContractPdfTitle = (contract: Contract) =>
  `Contrato - ${contract.client?.name ?? 'Cliente'} - ${contract.type?.name ?? 'Tipo'}`;

export async function generateAndUploadContractPdf(
  contract: Contract,
  options: {
    userName?: string;
    bannerUrl?: string;
    company: ContractPdfCompany;
  },
): Promise<StoredFile & { blob: Blob }> {
  const title = getContractPdfTitle(contract);
  const safeName = title.replace(/[^a-zA-Z0-9\-_]/g, '_').slice(0, 80);
  const storagePath = `contracts/generated/${contract.id}/${safeName}_${Date.now()}.pdf`;

  const { url, blob } = await generateAndUploadDetailPdf({
    title,
    contents: generateContractPdfContents(contract, options.company),
    userName: options.userName,
    bannerUrl: options.bannerUrl,
    storagePath,
    hideTitle: true,
  });

  return { url, type: 'pdf', blob };
}
