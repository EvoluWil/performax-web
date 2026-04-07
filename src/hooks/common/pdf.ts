import { firebaseApp } from '@/config/firebase';
import { useSession } from '@/providers/auth';
import { companyService } from '@/services/company.service';
import { getBase64 } from '@/utils/base64';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import pdfMake from 'pdfmake/build/pdfmake';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { useCallback, useRef, useState } from 'react';

export type PdfTableColumn<T extends Record<string, unknown>> = {
  label: string;
  value: keyof T;
};

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

const firebaseStorage = getStorage(firebaseApp);

export const usePdfGenerator = () => {
  const { user } = useSession();
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfStorageUrl, setPdfStorageUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const getPdfHeaderUrl = async () => {
    const company = companyService.getDefaultCompany();
    if (company?.whiteLabel?.banner) {
      return company.whiteLabel.banner;
    }
    return '/pdf-header.png';
  };

  const makeDetailPDF = async (title: string, contents: Content[]) => {
    const logoImage = await getBase64(await getPdfHeaderUrl());

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          image: logoImage,
          width: 300,
          alignment: 'center',
        },
        {
          text: title,
          style: 'header',
          alignment: 'center',
          margin: [0, 10],
        },
      ],
      footer: {
        text: `Gerado por: ${user?.name} - ${new Date().toLocaleString()}`,
        alignment: 'center',
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

    pdfMake.createPdf(documentDefinition).getBlob(async (blob) => {
      // Local preview URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const localUrl = URL.createObjectURL(blob);
      blobUrlRef.current = localUrl;
      setPdfBlobUrl(localUrl);
      setPdfStorageUrl(null);
      setPdfTitle(title);
      setPdfModalOpen(true);

      // Upload to Firebase Storage
      setPdfUploading(true);
      try {
        const safeName = title.replace(/[^a-zA-Z0-9\-_]/g, '_').slice(0, 80);
        const path = `pdfs/${safeName}_${Date.now()}.pdf`;
        const storageRef = ref(firebaseStorage, path);
        await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
        const downloadUrl = await getDownloadURL(storageRef);
        setPdfStorageUrl(downloadUrl);
      } catch (err) {
        console.error('[pdf] upload error:', err);
      } finally {
        setPdfUploading(false);
      }
    });
  };

  const makeTablePDF = async <T extends Record<string, unknown>>(
    tableHeader: PdfTableColumn<T>[],
    data: T[],
    title: string,
    subtitle = '',
  ) => {
    const tableBody = data.map((item) =>
      tableHeader.map((cell) => ({
        text: String(item[cell.value] ?? '-'),
        style: 'tableReportCell',
      })),
    );

    const logoImage = await getBase64(await getPdfHeaderUrl());

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          image: logoImage,
          width: 300,
          alignment: 'center',
        },
        {
          text: title,
          style: 'header',
          alignment: 'center',
          margin: [0, 10],
        },
        {
          text: subtitle,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, -10, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: Array(tableHeader.length).fill('auto'),
            body: [
              tableHeader.map((cell) => ({
                text: cell.label,
                style: 'tableReportHeader',
                fillColor:
                  companyService.getDefaultCompany()?.whiteLabel
                    ?.primaryColor ?? '#6B2AEE',
                color: '#ffffff',
              })),
              ...tableBody,
            ],
          },
        },
      ],
      footer: {
        text: `Gerado por: ${user?.name} - ${new Date().toLocaleString()}`,
        alignment: 'center',
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
        tableReportHeader: {
          fontSize: 12,
          bold: true,
        },
        tableReportCell: {
          fontSize: 10,
        },
      },
    };

    pdfMake.createPdf(documentDefinition).getBlob(async (blob) => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const localUrl = URL.createObjectURL(blob);
      blobUrlRef.current = localUrl;
      setPdfBlobUrl(localUrl);
      setPdfStorageUrl(null);
      setPdfTitle(title);
      setPdfModalOpen(true);

      setPdfUploading(true);
      try {
        const safeName = title.replace(/[^a-zA-Z0-9\-_]/g, '_').slice(0, 80);
        const path = `pdfs/${safeName}_${Date.now()}.pdf`;
        const storageRef = ref(firebaseStorage, path);
        await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
        const downloadUrl = await getDownloadURL(storageRef);
        setPdfStorageUrl(downloadUrl);
      } catch (err) {
        console.error('[pdf] upload error:', err);
      } finally {
        setPdfUploading(false);
      }
    });
  };

  const downloadPdf = useCallback(() => {
    if (!blobUrlRef.current || !pdfTitle) return;
    const a = document.createElement('a');
    a.href = blobUrlRef.current;
    a.download = `${pdfTitle}.pdf`;
    a.click();
  }, [pdfTitle]);

  const closePdfModal = useCallback(() => {
    setPdfModalOpen(false);
  }, []);

  return {
    makeDetailPDF,
    makeTablePDF,
    pdfModalOpen,
    pdfBlobUrl,
    pdfStorageUrl,
    pdfUploading,
    pdfTitle,
    closePdfModal,
    downloadPdf,
  };
};
