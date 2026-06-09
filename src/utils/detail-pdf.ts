import { firebaseApp } from '@/config/firebase';
import { getBase64 } from '@/utils/base64';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import pdfMake from 'pdfmake/build/pdfmake';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.fonts = {
  Roboto: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
};

type BuildDetailPdfOptions = {
  title: string;
  contents: Content[];
  userName?: string;
  bannerUrl?: string;
  hideTitle?: boolean;
};

export async function buildDetailPdfDefinition({
  title,
  contents,
  userName,
  bannerUrl,
  hideTitle,
}: BuildDetailPdfOptions): Promise<TDocumentDefinitions> {
  const content: Content[] = [];

  if (bannerUrl) {
    const logoImage = await getBase64(bannerUrl);
    content.push({
      image: logoImage,
      width: 515,
      margin: [0, 0, 0, 16],
    });
  }

  if (!hideTitle && title) {
    content.push({
      text: title,
      style: 'header',
      alignment: 'center',
      margin: [0, 10],
    });
  }
  content.push(...contents);

  return {
    content,
    footer: {
      text: `Gerado por: ${userName ?? '-'} - ${new Date().toLocaleString('pt-BR')}`,
      alignment: 'center',
      fontSize: 10,
    },
    styles: {
      header: {
        fontSize: 16,
        bold: true,
      },
    },
  };
}

export function createPdfBlob(definition: TDocumentDefinitions): Promise<Blob> {
  return new Promise((resolve) => {
    pdfMake.createPdf(definition).getBlob(resolve);
  });
}

export async function uploadPdfBlob(blob: Blob, path: string): Promise<string> {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
  return getDownloadURL(storageRef);
}

export async function generateAndUploadDetailPdf(
  options: BuildDetailPdfOptions & { storagePath: string },
): Promise<{ url: string; blob: Blob }> {
  const definition = await buildDetailPdfDefinition(options);
  const blob = await createPdfBlob(definition);
  const url = await uploadPdfBlob(blob, options.storagePath);
  return { url, blob };
}
