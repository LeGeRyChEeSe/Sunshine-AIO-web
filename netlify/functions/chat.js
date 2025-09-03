// netlify/functions/chat.js
// Copier TOUT ce code dans le fichier

import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Base de connaissances int�gr�e
const KNOWLEDGE_BASE = {
  installation: {
    keywords: ['install', 'installer', 'setup', 't�l�charger', 'download', 'powershell'],
    response: `Pour installer Sunshine-AIO:
1. Ouvrez PowerShell en tant qu'administrateur
2. Ex�cutez: irm https://sunshine-aio.com/script.ps1 | iex
3. Le script installera automatiquement Python et Git si n�cessaire
4. Un fichier Sunshine-AIO.bat sera cr�� pour lancer facilement l'application`
  },
  virtualDisplay: {
    keywords: ['virtual display', 'virtual monitor', 'vdd', 'display virtuel', '�cran'],
    response: `Le Virtual Display Driver:
" Cr�e un �cran d�di� pour le streaming
" S'active automatiquement au d�marrage du stream
" Configure la r�solution et le HDR selon Moonlight
" Se d�sactive � la fin du stream`
  },
  moonlight: {
    keywords: ['moonlight', 'client', 'connexion', 'connect'],
    response: `Configuration Moonlight:
1. Assurez-vous que Sunshine est en cours d'ex�cution
2. Ajoutez l'IP de votre PC dans Moonlight
3. Entrez le code PIN affich� dans Sunshine
4. Vos jeux appara�tront automatiquement`
  },
  hdr: {
    keywords: ['hdr', 'high dynamic range', 'couleur'],
    response: `Configuration HDR:
" HDR s'active automatiquement si votre client le supporte
" V�rifiez que Windows HDR est activ�
" Le Virtual Display supporte le HDR natif`
  },
  troubleshooting: {
    keywords: ['probl�me', 'problem', 'erreur', 'error', 'bug'],
    response: `D�pannage:
1. V�rifiez que l'antivirus n'a pas bloqu� Sunshine-AIO
2. Lancez en tant qu'administrateur
3. Consultez les logs dans le dossier d'installation`
  }
};

// Recherche dans la base de connaissances
function searchKnowledgeBase(query) {
  const queryLower = query.toLowerCase();
  
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    for (const keyword of data.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        return data.response;
      }
    }
  }
  return null;
}

// Appel � Gemini
async function callGeminiAPI(message) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Tu es un assistant pour Sunshine-AIO, un outil de game streaming.
Question: ${message}
R�ponds en fran�ais de mani�re concise et claire.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Handler principal
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message required' })
      };
    }

    console.log('Processing message:', message);
    console.log('GEMINI_API_KEY available:', !!GEMINI_API_KEY);

    // Chercher d'abord dans la base locale
    let response = searchKnowledgeBase(message);
    
    // Si pas de r�ponse locale, utiliser Gemini
    if (!response && GEMINI_API_KEY) {
      try {
        response = await callGeminiAPI(message);
      } catch (error) {
        console.error('Gemini error:', error);
        response = "Je ne peux pas r�pondre pour le moment. Consultez: https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki";
      }
    }

    // R�ponse par d�faut
    if (!response) {
      response = "Consultez le wiki pour plus d'informations: https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};