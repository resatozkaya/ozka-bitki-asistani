// Özka Bitki Asistanı AI Diagnosis Service
// Uses Claude API for image-based plant disease diagnosis

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `Sen Özka Bitki Asistanı'in uzman hidroponik bitki patoloğusun. Görevin bitki fotoğraflarını analiz ederek:

1. Hastalık veya sorun tespiti yapman
2. Olası nedenleri açıklaman  
3. Tedavi planı sunman
4. Önleyici tedbirler önermen

Analiz yaparken şunlara dikkat et:
- Yaprak rengi, dokusu ve şekli
- Kök sağlığı (görünüyorsa)
- Gövde durumu
- Böcek varlığı
- Besin eksikliği belirtileri
- Mantar veya bakteri enfeksiyonu belirtileri

Yanıtını MUTLAKA şu JSON formatında ver ve başka hiçbir şey yazma:
{
  "diagnosis": "Ana teşhis başlığı",
  "diseaseId": "disease_id veya null",
  "confidence": 85,
  "severity": "low|medium|high|critical",
  "symptoms": ["Belirti 1", "Belirti 2", "Belirti 3"],
  "causes": ["Neden 1", "Neden 2"],
  "immediateActions": ["Acil adım 1", "Acil adım 2", "Acil adım 3"],
  "treatments": [
    {"step": 1, "action": "Yapılacak işlem", "detail": "Detay açıklama"},
    {"step": 2, "action": "İkinci adım", "detail": "Detay"}
  ],
  "prevention": ["Önlem 1", "Önlem 2"],
  "recoveryChance": 80,
  "recoveryTime": "1-2 hafta",
  "phRecommendation": "5.5-6.5",
  "ecRecommendation": "1.0-2.0",
  "additionalNotes": "Ek önemli notlar",
  "isHealthy": false
}

diseaseId için geçerli değerler: root_rot, powdery_mildew, nutrient_deficiency_nitrogen, calcium_deficiency, iron_deficiency, botrytis, aphids, whitefly, null`;

export async function analyzeImage(imageBase64, plantType, additionalContext = '') {
  try {
    const userMessage = `Lütfen bu ${plantType} bitkisinin fotoğrafını analiz et ve hastalık teşhisi yap.${
      additionalContext ? ` Ek bilgi: ${additionalContext}` : ''
    }`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content?.find(c => c.type === 'text')?.text || '';
    
    // Clean JSON from markdown if needed
    const cleaned = textContent.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getExpertAdvice(question, plantType, context = '') {
  try {
    const systemPrompt = `Sen Özka Bitki Asistanı'in hidroponik tarım uzmanısın. Türkçe, net ve pratik yanıtlar ver. 
    Bilimsel ama anlaşılır ol. Yanıtlarını madde madde yapılandır.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Bitki: ${plantType}\n${context ? `Bağlam: ${context}\n` : ''}Soru: ${question}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(c => c.type === 'text')?.text || '';
    
    return { success: true, text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getSeverityColor(severity) {
  const colors = {
    low: '#00D4A1',
    medium: '#F7B731',
    high: '#FFA94D',
    critical: '#FF5E6C',
  };
  return colors[severity] || '#8BA8C4';
}

export function getSeverityLabel(severity) {
  const labels = {
    low: 'Düşük Risk',
    medium: 'Orta Risk',
    high: 'Yüksek Risk',
    critical: 'KRİTİK',
  };
  return labels[severity] || 'Bilinmiyor';
}
