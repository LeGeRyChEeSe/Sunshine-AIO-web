import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');

  console.log('Form submission received:', payload);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Form submission received' })
  };
};