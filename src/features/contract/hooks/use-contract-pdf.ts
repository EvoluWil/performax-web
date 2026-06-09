import { contractService } from '@/features/contract/services/contract.service';
import { Contract } from '@/features/contract/types';
import { generateAndUploadContractPdf } from '@/features/contract/util/contract-pdf';
import { useSession } from '@/providers/auth';
import { useWhiteLabel } from '@/providers/white-label';
import { companyService } from '@/services/company.service';
import { File as StoredFile } from '@/types/file';
import { useUpload } from '@/hooks/common/upload';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

export const useContractPdf = () => {
  const { user } = useSession();
  const { whiteLabel } = useWhiteLabel();
  const { deleteFile } = useUpload();
  const [generating, setGenerating] = useState(false);

  const generateAndSaveContractPdf = useCallback(
    async (
      contract: Contract,
    ): Promise<(StoredFile & { blob: Blob }) | null> => {
      setGenerating(true);
      try {
        const fullContract = contract.client?.name
          ? contract
          : await contractService.getById(contract.id);

        if (fullContract.generatedPdf?.url) {
          await deleteFile(fullContract.generatedPdf.url);
        }

        const defaultCompany = companyService.getDefaultCompany();
        const companyName =
          whiteLabel?.name?.trim() ||
          defaultCompany?.name?.trim() ||
          'CONTRATADA';

        const { url, blob } = await generateAndUploadContractPdf(fullContract, {
          userName: user?.name,
          bannerUrl: whiteLabel?.banner,
          company: { name: companyName },
        });

        const generatedPdf: StoredFile = { url, type: 'pdf' };
        await contractService.update(contract.id, { generatedPdf });
        return { ...generatedPdf, blob };
      } catch (error) {
        console.error('[contract-pdf]', error);
        toast.error('Erro ao gerar PDF do contrato');
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [deleteFile, user?.name, whiteLabel?.banner, whiteLabel?.name],
  );

  return {
    generateAndSaveContractPdf,
    generating,
  };
};
