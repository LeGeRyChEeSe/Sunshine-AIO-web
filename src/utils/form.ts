type FormValue = string | File | File[] | Blob;

export function encode(data: Record<string, FormValue>): string {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((file, index) => {
        formData.append(`${key}`, file);
      });
    } else if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return new URLSearchParams(formData as any).toString();
}