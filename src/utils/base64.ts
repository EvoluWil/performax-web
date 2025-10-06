export const getBase64 = async (url: string): Promise<any> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ByElement = async (elementId: string) => {
  const element = document.getElementById(elementId) as HTMLImageElement;
  const canvas = document.createElement("canvas");
  canvas.width = element.width;
  canvas.height = element.height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(element, 0, 0, element.width, element.height);

  return {
    image: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
};
