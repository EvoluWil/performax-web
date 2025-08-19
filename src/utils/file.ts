import { File } from '@/types/file';

export const getDestination = (url: string): string => {
  const urlParse = url.split('?')[0].split('/');
  const fileName = urlParse.pop()?.replaceAll(/%2F/g, '/') || '';

  return fileName;
};

export const getFileName = (file: File): string => {
  const urlParse = file?.url?.split('?')[0]?.replaceAll(/%2F/g, '/').split('/');
  const fileName = urlParse.pop() as string;

  return fileName;
};
