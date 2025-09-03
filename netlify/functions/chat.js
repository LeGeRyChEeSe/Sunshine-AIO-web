import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to fetch GitHub wiki content
async function fetchGitHubWiki() {
  try {
    // Fetch from Sunshine-AIO wiki instead of general Sunshine wiki
    const wikiResponse = await fetch('https://raw.githubusercontent.com/wiki/LeGeRyChEeSe/Sunshine-AIO/Home.md');
    if (!wikiResponse.ok) {
      throw new Error('Failed to fetch Sunshine-AIO wiki content');
    }
    return await wikiResponse.text();
  } catch (error) {
    console.error('Error fetching Sunshine-AIO wiki:', error);
    // Return basic Sunshine-AIO context if wiki fetch fails
    return `
# Sunshine-AIO Wiki Context

Sunshine-AIO is an All-In-One installer and manager for Sunshine, providing an easy installation and management experience for the Sunshine game streaming server.

## Key Information:
- All-In-One installer for Sunshine streaming server
- Automated installation process with PowerShell scripts
- Web-based installer and documentation
- Compatible with Moonlight clients
- Supports H.264 and H.265 encoding
- Requires Windows 10/11 or Linux
- Uses ports 47989 (HTTPS), 47984 (HTTP), and 48010 (RTSP)
- Supports multiple client platforms (Android, iOS, Linux, etc.)
- Includes additional tools and utilities for easier management

For complete documentation, visit the official Sunshine-AIO GitHub wiki at: https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki
    `;
  }
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, language = 'en', image } = JSON.parse(event.body);
    
    if ((!message || typeof message !== 'string') && !image) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message or image is required' })
      };
    }

    // Fetch GitHub wiki content to provide as context
    const wikiContent = await fetchGitHubWiki();

    // Always use Gemini with GitHub wiki context
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const getSystemPrompt = (lang, wikiContext) => {
      const prompts = {
        fr: `Tu es un assistant AI spécialisé dans Sunshine-AIO, un installateur et gestionnaire tout-en-un pour Sunshine, une application de streaming de jeux. Réponds en français de manière utile et précise. Tu DOIS te baser uniquement sur le wiki GitHub officiel de Sunshine-AIO fourni ci-dessous pour répondre aux questions. Si la question n'est pas liée à Sunshine-AIO ou au streaming de jeux, redirige poliment vers des questions sur Sunshine-AIO.

Si une image est fournie, analyse-la dans le contexte de Sunshine-AIO. L'image peut montrer :
- Des erreurs ou messages d'erreur
- Des captures d'écran d'interfaces
- Des configurations ou paramètres
- Des problèmes de performance ou de streaming
- Tout autre aspect lié à Sunshine-AIO

CONTEXTE OFFICIEL DU WIKI GITHUB SUNSHINE-AIO :
${wikiContext}

Instructions importantes :
- Base tes réponses UNIQUEMENT sur les informations du wiki GitHub Sunshine-AIO ci-dessus
- Si l'information n'est pas disponible dans le wiki, dis-le clairement
- Ne fais pas référence à d'autres sources que le wiki GitHub officiel de Sunshine-AIO
- Si une image est fournie, analyse-la et donne des conseils basés sur le contexte Sunshine-AIO
- Réponds de manière concise et utile`,
        
        en: `You are an AI assistant specialized in Sunshine-AIO, an All-In-One installer and manager for Sunshine, a game streaming application. Respond in English in a helpful and accurate manner. You MUST base your responses solely on the official Sunshine-AIO GitHub wiki provided below. If the question is not related to Sunshine-AIO or game streaming, politely redirect to questions about Sunshine-AIO.

If an image is provided, analyze it in the context of Sunshine-AIO. The image may show:
- Errors or error messages
- Interface screenshots
- Configurations or settings
- Performance or streaming issues
- Any other Sunshine-AIO related aspects

OFFICIAL SUNSHINE-AIO GITHUB WIKI CONTEXT:
${wikiContext}

Important instructions:
- Base your responses ONLY on the information from the Sunshine-AIO GitHub wiki above
- If information is not available in the wiki, clearly state that
- Do not reference sources other than the official Sunshine-AIO GitHub wiki
- If an image is provided, analyze it and provide advice based on the Sunshine-AIO context
- Respond concisely and helpfully`,

        de: `Du bist ein KI-Assistent, der auf Sunshine-AIO spezialisiert ist, ein All-In-One Installer und Manager für Sunshine, eine Game-Streaming-Anwendung. Antworte auf Deutsch hilfreich und genau. Du MUSST deine Antworten ausschließlich auf das offizielle Sunshine-AIO GitHub-Wiki basieren, das unten bereitgestellt wird. Falls die Frage nicht mit Sunshine-AIO oder Game-Streaming zusammenhängt, leite höflich zu Fragen über Sunshine-AIO weiter.

OFFIZIELLER SUNSHINE-AIO GITHUB-WIKI KONTEXT:
${wikiContext}

Wichtige Anweisungen:
- Basiere deine Antworten NUR auf den Informationen aus dem Sunshine-AIO GitHub-Wiki oben
- Wenn Informationen im Wiki nicht verfügbar sind, sage das klar
- Verweise nicht auf andere Quellen als das offizielle Sunshine-AIO GitHub-Wiki
- Antworte präzise und hilfreich`,

        es: `Eres un asistente de IA especializado en Sunshine-AIO, un instalador y gestor todo-en-uno para Sunshine, una aplicación de transmisión de juegos. Responde en español de manera útil y precisa. DEBES basar tus respuestas únicamente en el wiki oficial de Sunshine-AIO de GitHub proporcionado a continuación. Si la pregunta no está relacionada con Sunshine-AIO o transmisión de juegos, redirige cortésmente hacia preguntas sobre Sunshine-AIO.

CONTEXTO DEL WIKI OFICIAL DE SUNSHINE-AIO GITHUB:
${wikiContext}

Instrucciones importantes:
- Basa tus respuestas SOLO en la información del wiki de Sunshine-AIO GitHub anterior
- Si la información no está disponible en el wiki, dilo claramente
- No hagas referencia a fuentes distintas del wiki oficial de Sunshine-AIO GitHub
- Responde de manera concisa y útil`,

        it: `Sei un assistente AI specializzato in Sunshine-AIO, un installer e manager tutto-in-uno per Sunshine, un'applicazione di streaming per giochi. Rispondi in italiano in modo utile e preciso. DEVI basare le tue risposte esclusivamente sul wiki ufficiale di Sunshine-AIO GitHub fornito di seguito. Se la domanda non è relativa a Sunshine-AIO o allo streaming di giochi, reindirizza gentilmente verso domande su Sunshine-AIO.

CONTESTO DEL WIKI UFFICIALE DI SUNSHINE-AIO GITHUB:
${wikiContext}

Istruzioni importanti:
- Basa le tue risposte SOLO sulle informazioni del wiki Sunshine-AIO GitHub sopra
- Se le informazioni non sono disponibili nel wiki, dichiaralo chiaramente
- Non fare riferimento a fonti diverse dal wiki ufficiale di Sunshine-AIO GitHub
- Rispondi in modo conciso e utile`,

        ja: `あなたはSunshine-AIO、Sunshineゲームストリーミングアプリケーションのオールインワンインストーラー＆マネージャーに特化したAIアシスタントです。日本語で役に立つように正確に回答してください。以下に提供される公式Sunshine-AIO GitHubウィキのみに基づいて回答する必要があります。質問がSunshine-AIOやゲームストリーミングに関連していない場合は、丁寧にSunshine-AIOに関する質問に誘導してください。

公式SUNSHINE-AIO GITHUB ウィキのコンテキスト：
${wikiContext}

重要な指示：
- 上記のSunshine-AIO GitHubウィキの情報のみに基づいて回答してください
- ウィキに情報がない場合は、明確にそう述べてください
- 公式Sunshine-AIO GitHubウィキ以外のソースを参照しないでください
- 簡潔で役立つ回答をしてください`,

        ko: `당신은 게임 스트리밍 애플리케이션인 Sunshine의 올인원 인스톨러 및 매니저인 Sunshine-AIO에 특화된 AI 어시스턴트입니다. 한국어로 도움이 되고 정확하게 답변하세요. 아래에 제공된 공식 Sunshine-AIO GitHub 위키만을 기반으로 답변해야 합니다. 질문이 Sunshine-AIO나 게임 스트리밍과 관련이 없다면 정중하게 Sunshine-AIO에 대한 질문으로 유도하세요.

공식 SUNSHINE-AIO GITHUB 위키 컨텍스트:
${wikiContext}

중요한 지시사항:
- 위의 Sunshine-AIO GitHub 위키 정보만을 기반으로 답변하세요
- 위키에 정보가 없다면 명확히 말하세요
- 공식 Sunshine-AIO GitHub 위키 이외의 소스를 참조하지 마세요
- 간결하고 도움이 되게 답변하세요`,

        pt: `Você é um assistente de IA especializado em Sunshine-AIO, um instalador e gerenciador tudo-em-um para Sunshine, uma aplicação de streaming de jogos. Responda em português de forma útil e precisa. Você DEVE basear suas respostas exclusivamente no wiki oficial do Sunshine-AIO GitHub fornecido abaixo. Se a pergunta não estiver relacionada ao Sunshine-AIO ou streaming de jogos, redirecione educadamente para perguntas sobre Sunshine-AIO.

CONTEXTO DO WIKI OFICIAL DO SUNSHINE-AIO GITHUB:
${wikiContext}

Instruções importantes:
- Baseie suas respostas APENAS nas informações do wiki Sunshine-AIO GitHub acima
- Se a informação não estiver disponível no wiki, declare isso claramente
- Não referencie fontes diferentes do wiki oficial do Sunshine-AIO GitHub
- Responda de forma concisa e útil`,

        ru: `Вы — ИИ-помощник, специализирующийся на Sunshine-AIO, универсальном установщике и менеджере для Sunshine, приложении для стриминга игр. Отвечайте на русском языке полезно и точно. Вы ДОЛЖНЫ основывать свои ответы исключительно на официальной вики Sunshine-AIO GitHub, представленной ниже. Если вопрос не связан с Sunshine-AIO или стримингом игр, вежливо перенаправьте к вопросам о Sunshine-AIO.

КОНТЕКСТ ОФИЦИАЛЬНОЙ SUNSHINE-AIO GITHUB ВИКИ:
${wikiContext}

Важные инструкции:
- Основывайте ваши ответы ТОЛЬКО на информации из Sunshine-AIO GitHub вики выше
- Если информация недоступна в вики, ясно заявите об этом
- Не ссылайтесь на источники, отличные от официальной Sunshine-AIO GitHub вики
- Отвечайте кратко и полезно`,

        zh: `您是专门针对Sunshine-AIO的AI助手，Sunshine-AIO是Sunshine游戏串流应用程序的一体化安装程序和管理器。请用中文提供有用和准确的回答。您必须仅基于下面提供的官方Sunshine-AIO GitHub wiki回答问题。如果问题与Sunshine-AIO或游戏串流无关，请礼貌地引导到关于Sunshine-AIO的问题。

官方SUNSHINE-AIO GITHUB WIKI上下文：
${wikiContext}

重要说明：
- 仅基于上述Sunshine-AIO GitHub wiki信息回答
- 如果wiki中没有相关信息，请明确说明
- 不要引用官方Sunshine-AIO GitHub wiki以外的其他来源
- 请简洁有用地回答`
      };
      
      return prompts[lang] || prompts['en'];
    };

    const systemPrompt = getSystemPrompt(language, wikiContent);

    // Configure generation with explicit language instruction
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };

    // Create a more explicit prompt structure
    const fullPrompt = `${systemPrompt}

IMPORTANT: Your response MUST be in ${language === 'fr' ? 'French' : language === 'en' ? 'English' : language === 'de' ? 'German' : language === 'es' ? 'Spanish' : language === 'it' ? 'Italian' : language === 'ja' ? 'Japanese' : language === 'ko' ? 'Korean' : language === 'pt' ? 'Portuguese' : language === 'ru' ? 'Russian' : language === 'zh' ? 'Chinese' : 'English'} language only.

User question: ${message || 'Please analyze this image'}

Remember: Respond in ${language === 'fr' ? 'French' : language === 'en' ? 'English' : language === 'de' ? 'German' : language === 'es' ? 'Spanish' : language === 'it' ? 'Italian' : language === 'ja' ? 'Japanese' : language === 'ko' ? 'Korean' : language === 'pt' ? 'Portuguese' : language === 'ru' ? 'Russian' : language === 'zh' ? 'Chinese' : 'English'} language.`;

    // Prepare content parts
    const parts = [{ text: fullPrompt }];
    
    // Add image if provided
    if (image) {
      // Remove data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg' // Default to JPEG, could be made more intelligent
        }
      });
    }

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: parts
      }],
      generationConfig
    });
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        response: text,
        source: 'ai'
      })
    };

  } catch (error) {
    console.error('Chat function error:', error);
    
    // Parse language from event body safely
    let errorLanguage = 'en';
    try {
      const { language } = JSON.parse(event.body || '{}');
      errorLanguage = language || 'en';
    } catch (parseError) {
      // Use default language
    }
    
    const getErrorMessage = (lang) => {
      const errorMessages = {
        fr: 'Désolé, je rencontre actuellement des difficultés techniques. Veuillez réessayer plus tard.',
        en: 'Sorry, I\'m experiencing technical difficulties right now. Please try again later.',
        de: 'Entschuldigung, ich habe derzeit technische Schwierigkeiten. Bitte versuchen Sie es später erneut.',
        es: 'Lo siento, estoy experimentando dificultades técnicas en este momento. Por favor, inténtelo más tarde.',
        it: 'Mi dispiace, sto riscontrando difficoltà tecniche al momento. Riprova più tardi.',
        ja: '申し訳ございませんが、現在技術的な問題が発生しています。後でもう一度お試しください。',
        ko: '죄송합니다. 현재 기술적인 문제가 발생했습니다. 나중에 다시 시도해주세요.',
        pt: 'Desculpe, estou enfrentando dificuldades técnicas no momento. Tente novamente mais tarde.',
        ru: 'Извините, у меня сейчас технические трудности. Пожалуйста, попробуйте позже.',
        zh: '抱歉，我目前遇到技术困难。请稍后再试。'
      };
      
      return errorMessages[lang] || errorMessages['en'];
    };

    const errorMessage = getErrorMessage(errorLanguage);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: errorMessage
      })
    };
  }
};