const VENICE_API_KEY = process.env.VENICE_API_KEY || 'VENICE_INFERENCE_KEY_4pi_gcpZbXp8JMfHjyFLHZTkyck6YVETbfgXo8fP_-';
const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';

async function callVeniceAI(prompt: string, systemPrompt: string = "You are a DeFi risk assessment AI. Always reply with valid JSON only.") {
  const response = await fetch(VENICE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'venice-uncensored',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    console.error('Venice AI API Error:', await response.text());
    throw new Error('Failed to fetch from Venice AI');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Clean up potential markdown formatting around JSON
  if (content.startsWith('```json')) {
    content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  try {
    return JSON.parse(content.trim());
  } catch (e) {
    console.error('Failed to parse Venice AI JSON response:', content);
    throw new Error('Invalid JSON from Venice AI');
  }
}

export const veniceAI = {
  async scoreProtocol(params: {
    protocolName: string;
    tvl: number;
    audited: boolean;
    exploitHistory: number;
  }): Promise<{ score: number; reasoning: string }> {
    console.log(`[Venice AI] Scoring Protocol: ${params.protocolName}`);
    
    const prompt = `Analyze this DeFi protocol and return a JSON object with 'score' (number 0-100, where 100 is highest risk) and 'reasoning' (string explaining why). Protocol: ${params.protocolName}, TVL: $${params.tvl}, Audited: ${params.audited}, Past Exploits: ${params.exploitHistory}.`;
    
    return await callVeniceAI(prompt);
  },

  async scoreAgent(params: {
    agentName: string;
    successRate: number;
    audited: boolean;
  }): Promise<{ score: number; reasoning: string }> {
    console.log(`[Venice AI] Scoring Agent: ${params.agentName}`);
    
    const prompt = `Analyze this executor agent and return a JSON object with 'score' (number 0-100, where 100 is highest risk) and 'reasoning' (string explaining why). Agent Name: ${params.agentName}, Success Rate: ${params.successRate}%, Audited: ${params.audited}.`;
    
    return await callVeniceAI(prompt);
  },

  async decideLiquidationAction(params: {
    liquidation_risk: number;
    time_to_liquidation: number;
    current_ltv: number;
    protocol_safety: string;
    user_risk_tolerance: string;
  }): Promise<{ should_repay: boolean; repay_amount: number; urgency: string; reasoning: string }> {
    console.log(`[Venice AI] Evaluating liquidation risk. LTV: ${params.current_ltv}%`);
    
    const prompt = `You are SENTINEL, an autonomous liquidation protector. Evaluate this position:
Liquidation Risk (0-100%): ${params.liquidation_risk}%
Time to Liquidation: ${params.time_to_liquidation} seconds
Current LTV: ${params.current_ltv}%
Protocol Safety: ${params.protocol_safety}
User Risk Tolerance: ${params.user_risk_tolerance}

Return a JSON object:
{
  "should_repay": boolean,
  "repay_amount": number (suggest an amount in USDC to repay, e.g. 1000 if urgent, 0 if not),
  "urgency": string ("low", "medium", "high", "critical"),
  "reasoning": string
}`;

    return await callVeniceAI(prompt);
  },

  async chatWithContext(userMessage: string, context: any): Promise<string> {
    console.log(`[Venice AI] Answering user query: ${userMessage.substring(0, 50)}...`);
    
    const systemPrompt = `You are the SENTINEL AI Agent directly talking to the user. 
    You manage their DeFi leveraged positions.
    Here is the current state of their account and recent actions taken:
    ${JSON.stringify(context, null, 2)}
    
    Answer their question in a helpful, concise, and professional tone. Do not output JSON.`;

    const response = await fetch(VENICE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'venice-uncensored',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Venice AI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
