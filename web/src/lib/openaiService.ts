import OpenAI from 'openai';
import { Stock, MarketState } from './stockMarketSimulation';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow API key usage in browser for this demo
});

// Function to generate investment advice using OpenAI
export const generateInvestmentAdvice = async (
  userMessage: string,
  stocks: Stock[],
  market: MarketState,
  portfolio: {[key: string]: number},
  cash: number
): Promise<string> => {
  try {
    // Create a context for the AI based on market conditions and portfolio
    const portfolioStocks = Object.entries(portfolio).map(([stockId, shares]) => {
      const stock = stocks.find(s => s.id === stockId);
      return stock ? `${stock.name} (${stock.symbol}): ${shares} shares at $${stock.price.toFixed(2)} per share` : null;
    }).filter(Boolean);

    const portfolioValue = Object.entries(portfolio).reduce((sum, [stockId, shares]) => {
      const stock = stocks.find(s => s.id === stockId);
      return sum + (stock ? stock.price * shares : 0);
    }, 0);

    const topStocks = [...stocks]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map(stock => `${stock.name} (${stock.symbol}): $${stock.price.toFixed(2)}`);

    const context = `
      Current date: ${market.currentDate}
      Market stage: ${market.bubbleStage}
      Market index: ${market.marketIndex.toFixed(2)}
      Market sentiment: ${(market.sentiment * 100).toFixed(2)}%
      
      User's portfolio:
      ${portfolioStocks.length > 0 ? portfolioStocks.join('\n') : 'No stocks owned'}
      
      Cash: $${cash.toFixed(2)}
      Portfolio value: $${portfolioValue.toFixed(2)}
      Total assets: $${(cash + portfolioValue).toFixed(2)}
      
      Top performing stocks:
      ${topStocks.join('\n')}
    `;

    // Create the prompt for OpenAI
    const prompt = `
      You are a Y2K-era Wall Street investment advisor during the dotcom bubble. You have a finance bro personality but don't make it too overbearing. You're enthusiastic about internet stocks and the "new economy" but your advice should vary based on the current market stage.
      
      Current market information:
      ${context}
      
      User question: "${userMessage}"
      
      Respond as a Y2K Wall Street finance bro would, with appropriate enthusiasm and slang from that era. Your advice should reflect the current market stage:
      - early/growth: Very bullish, recommend getting in early on promising internet companies
      - mania: Extremely bullish, dismiss concerns about valuations, focus on growth and "eyeballs"
      - peak: Still bullish but with some caution, suggest diversification
      - decline: Reassuring but cautious, suggest focusing on quality companies
      - crash: Acknowledge problems but look for "bargains" and survivors
      
      Keep your response concise (under 150 words) and conversational.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a Y2K-era Wall Street investment advisor during the dotcom bubble." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message.content?.trim() || "Sorry, I couldn't generate advice right now. The markets are crazy!";
  } catch (error) {
    console.error('Error generating investment advice:', error);
    return "Sorry, I'm having trouble connecting to my Wall Street sources right now. Try again in a bit!";
  }
};

// Function to generate news headlines using OpenAI
export const generateNewsHeadlines = async (
  date: string,
  bubbleStage: string,
  stocks: Stock[],
  marketIndex: number,
  previousMarketIndex: number
): Promise<any[]> => {
  try {
    const marketChange = ((marketIndex - previousMarketIndex) / previousMarketIndex) * 100;
    const isMarketUp = marketChange > 0;
    
    // Select a few random stocks to potentially feature in news
    const shuffledStocks = [...stocks].sort(() => 0.5 - Math.random());
    const selectedStocks = shuffledStocks.slice(0, 3);
    
    const stockInfo = selectedStocks.map(stock => {
      const priceHistory = stock.priceHistory;
      const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : stock.price;
      const priceChange = ((stock.price - previousPrice) / previousPrice) * 100;
      
      return `${stock.name} (${stock.symbol}): Current price $${stock.price.toFixed(2)}, ${priceChange > 0 ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(2)}%, Category: ${stock.category}`;
    }).join('\n');
    
    // Create the prompt for OpenAI
    const prompt = `
      Generate 3 realistic news headlines and brief content for a dotcom bubble era stock market simulator set on ${date}. The current market stage is "${bubbleStage}" and the market index is ${isMarketUp ? 'up' : 'down'} ${Math.abs(marketChange).toFixed(2)}%.
      
      Some notable stocks:
      ${stockInfo}
      
      For each headline, provide:
      1. A catchy headline typical of financial news from 1998-2004
      2. A brief 1-2 sentence content expanding on the headline
      3. The impact (positive, negative, or neutral)
      4. If the news is about a specific company, include the company name
      
      The tone and content should match the current bubble stage:
      - early: Optimistic about internet potential, focus on innovation
      - growth: Strong enthusiasm about internet stocks and rapid growth
      - mania: Extreme exuberance, dismissal of traditional valuation metrics
      - peak: Mix of extreme optimism and first signs of concern
      - decline: Growing concerns about profitability and business models
      - crash: Reports of bankruptcies, layoffs, and market collapse
      
      Format the response as JSON with this structure:
      [
        {
          "headline": "Headline text",
          "content": "Content text",
          "impact": "positive/negative/neutral",
          "stockId": "company_name_if_applicable"
        }
      ]
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a financial news generator for a dotcom bubble era stock market simulator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message.content?.trim() || "[]";
    
    try {
      // Parse the JSON response
      const newsItems = JSON.parse(text);
      
      // Add IDs and dates to each news item
      return newsItems.map((item: any) => ({
        ...item,
        id: `news-${Date.now()}-${Math.random()}`,
        date,
        stockId: item.stockId ? stocks.find(s => s.name.toLowerCase().includes(item.stockId.toLowerCase()))?.id : undefined
      }));
    } catch (e) {
      console.error('Error parsing news JSON:', e);
      return [];
    }
  } catch (error) {
    console.error('Error generating news headlines:', error);
    return [];
  }
};
