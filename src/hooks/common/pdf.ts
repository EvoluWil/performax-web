import { useSession } from "@/providers/auth";
import { getBase64 } from "@/utils/base64";
import pdfMake from "pdfmake/build/pdfmake";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.fonts = {
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

export const usePdfGenerator = () => {
  const { user } = useSession();

  const getPdfHeaderUrl = async () => {
    return "/pdf-header.png";
  };

  const makeDetailPDF = async (title: string, contents: Content[]) => {
    const logoImage = await getBase64(await getPdfHeaderUrl());

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          image: logoImage,
          width: 300,
          alignment: "center",
        },
        {
          text: title,
          style: "header",
          alignment: "center",
          margin: [0, 10],
        },
      ],
      footer: {
        text: `Gerado por: ${user?.name} - ${new Date().toLocaleString()}`,
        alignment: "center",
        fontSize: 10,
      },
      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subtitle: {
          fontSize: 10,
        },
      },
    };

    (documentDefinition.content as any).push(...contents);

    pdfMake.createPdf(documentDefinition).download();
  };

  return {
    makeDetailPDF,
  };
};
