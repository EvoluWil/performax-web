import { firebaseApp } from '@/config/firebase';
import { getDestination } from '@/utils/file';
import { normalizeString } from '@/utils/string';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { toast } from 'react-toastify';

const storage = getStorage(firebaseApp);

export const useUpload = () => {
  const sendFile = async (file: File, destination: string) => {
    try {
      const extName = file.name.split('.').pop() || '';

      const storageRef = ref(
        storage,
        destination + '/NS' + normalizeString(file.name).replace(extName, ''),
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { url, type: extName };
    } catch {
      toast.error('Erro ao enviar arquivo');
    }
  };

  const sendFiles = async (files: File[], destination: string) => {
    const uploads = await Promise.all(
      files.map((file) => sendFile(file, destination)),
    );
    const result = uploads?.filter((upload) => upload?.url) as {
      url: string;
      type: string;
    }[];

    return result;
  };

  const deleteFile = async (url: string) => {
    try {
      const fileName = getDestination(url);
      const storageRef = ref(storage, fileName);
      await deleteObject(storageRef);
    } catch {}
  };

  return {
    sendFile,
    sendFiles,
    deleteFile,
  };
};
