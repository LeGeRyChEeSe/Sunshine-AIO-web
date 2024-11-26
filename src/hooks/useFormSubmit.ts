import { encode } from '../utils/form';

export function useFormSubmit() {
  const submitForm = async (form: HTMLFormElement): Promise<boolean> => {
    try {
      const formData = new FormData(form);
      const data: Record<string, string> = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data)
      });

      return response.ok;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    }
  };

  return { submitForm };
}