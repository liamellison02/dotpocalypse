import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { TextField, Button, Fieldset } from 'react95';
import { Stock, MarketState } from '../../lib/stockMarketSimulation';
import { generateInvestmentAdvice } from '../../lib/openaiService';

interface AdvisorProps {
  stocks: Stock[];
  market: MarketState;
  portfolio: {[key: string]: number};
  cash: number;
}

const AdvisorContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 2px inset #c0c0c0;
  background-color: white;
  padding: 10px;
`;

const MessageBubble = styled.div<{ isAdvisor: boolean }>`
  max-width: 80%;
  margin: 5px;
  padding: 8px 12px;
  border-radius: 4px;
  align-self: ${props => props.isAdvisor ? 'flex-start' : 'flex-end'};
  background-color: ${props => props.isAdvisor ? '#c0c0c0' : '#0000aa'};
  color: ${props => props.isAdvisor ? 'black' : 'white'};
  font-family: 'MS Sans Serif';
  font-size: 14px;
  position: relative;
  margin-bottom: 15px;
`;

const MessageTimestamp = styled.div`
  font-size: 10px;
  color: #666;
  position: absolute;
  bottom: -15px;
  right: 5px;
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 10px;
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  margin-right: 10px;
`;

interface Message {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
}

const InvestmentAdvisor: React.FC<AdvisorProps> = ({ stocks, market, portfolio, cash }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'advisor',
          text: welcomeMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the OpenAI service to get a response
      const response = await import('../../lib/openaiService')
        .then(module => module.generateInvestmentAdvice(
          inputMessage,
          stocks,
          market,
          portfolio,
          cash
        ));
      
      const advisorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'advisor',
        text: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, advisorMessage]);
    } catch (error) {
      console.error('Error getting advisor response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'advisor',
        text: "Sorry, I'm having trouble connecting to my Wall Street sources right now. Try again in a bit!",
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, stocks, market, portfolio, cash, setMessages, setInputMessage, setIsLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <AdvisorContainer>
      <Fieldset label="Y2K Investment Advisor">
        <ChatContainer>
          {messages.map((message) => (
            <MessageBubble key={message.id} isAdvisor={message.sender === 'advisor'}>
              {message.text}
              <MessageTimestamp>{message.timestamp}</MessageTimestamp>
            </MessageBubble>
          ))}
          {isLoading && (
            <MessageBubble isAdvisor={true}>
              <div>Thinking...</div>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatContainer>
      </Fieldset>
      <InputContainer>
        <StyledTextField
          placeholder="Ask your investment advisor..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          fullWidth
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          Send
        </Button>
      </InputContainer>
    </AdvisorContainer>
  );
};

// Helper functions for advisor responses
const getWelcomeMessage = (): string => {
  const welcomeMessages = [
    "Yo, what's up? I'm your investment advisor, ready to help you crush this market! The dotcom scene is ON FIRE right now. What stocks are you eyeing?",
    "Hey there, hotshot! Welcome to the future of investing. I'm your personal guru for navigating this insane dotcom market. What can I do you for?",
    "Sup? I'm your investment advisor, straight from Wall Street to your desktop. These internet stocks are going to the MOON! How can I help you make some serious cash?",
    "Welcome aboard, player! I'm your investment advisor, and let me tell you, this dotcom market is INSANE right now. What's your investment strategy looking like?",
    "Hey hey! Your personal investment advisor here. Ready to make some serious bank in this dotcom gold rush? What can I help you with today?"
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

const generateAdvisorResponse = (
  userMessage: string, 
  stocks: Stock[], 
  market: MarketState,
  portfolio: {[key: string]: number},
  cash: number
): string => {
  const userMessageLower = userMessage.toLowerCase();
  
  // Check for specific question types
  if (userMessageLower.includes('recommend') || userMessageLower.includes('what should i buy') || userMessageLower.includes('what stock')) {
    return getStockRecommendation(stocks, market);
  }
  
  if (userMessageLower.includes('market') && (userMessageLower.includes('crash') || userMessageLower.includes('bubble'))) {
    return getBubbleInsight(market);
  }
  
  if (userMessageLower.includes('portfolio') || userMessageLower.includes('my stocks') || userMessageLower.includes('how am i doing')) {
    return getPortfolioAdvice(stocks, portfolio, cash, market);
  }
  
  if (userMessageLower.includes('sell') || userMessageLower.includes('exit') || userMessageLower.includes('get out')) {
    return getSellAdvice(market);
  }
  
  // Generic responses if no specific pattern is matched
  return getGenericResponse(market);
};

const getStockRecommendation = (stocks: Stock[], market: MarketState): string => {
  // Filter stocks based on market stage
  let potentialStocks: Stock[] = [];
  
  switch (market.bubbleStage) {
    case 'early':
    case 'growth':
      // In early stages, recommend established companies with good survival chances
      potentialStocks = stocks.filter(stock => 
        stock.survivalChance === 'high' || stock.survivalChance === 'very high'
      );
      break;
    case 'mania':
      // In mania phase, recommend volatile tech stocks
      potentialStocks = stocks.filter(stock => 
        stock.volatility === 'high' || stock.volatility === 'extreme'
      );
      break;
    case 'peak':
      // At peak, mix of recommendations
      potentialStocks = stocks.filter(stock => 
        stock.category === 'E-commerce' || stock.category === 'Search'
      );
      break;
    case 'decline':
    case 'crash':
      // During decline/crash, recommend survivors
      potentialStocks = stocks.filter(stock => 
        stock.survivalChance === 'very high'
      );
      break;
    default:
      potentialStocks = stocks;
  }
  
  // If no stocks match criteria, use all stocks
  if (potentialStocks.length === 0) {
    potentialStocks = stocks;
  }
  
  // Pick 1-3 random stocks from potential stocks
  const numRecommendations = Math.min(Math.floor(Math.random() * 3) + 1, potentialStocks.length);
  const shuffled = [...potentialStocks].sort(() => 0.5 - Math.random());
  const recommendations = shuffled.slice(0, numRecommendations);
  
  // Generate response based on market stage
  let response = '';
  
  switch (market.bubbleStage) {
    case 'early':
      response = "Listen up! The internet revolution is just getting started. You want to get in EARLY on ";
      break;
    case 'growth':
      response = "The growth phase is where the REAL money is made! I'm seeing huge potential in ";
      break;
    case 'mania':
      response = "It's absolute MANIA out there! Everyone's making bank! You can't go wrong with ";
      break;
    case 'peak':
      response = "The market's on FIRE right now! These valuations might seem crazy, but this is the new economy, baby! Check out ";
      break;
    case 'decline':
      response = "Look, there's some volatility, but that means OPPORTUNITY for smart investors like you. I'd consider ";
      break;
    case 'crash':
      response = "OK, so we're seeing a bit of a correction. But that means BARGAINS! The strong companies will survive, like ";
      break;
    default:
      response = "Based on my analysis, you should look at ";
  }
  
  // Add stock recommendations
  recommendations.forEach((stock, index) => {
    if (index === recommendations.length - 1 && recommendations.length > 1) {
      response += `and ${stock.name} (${stock.symbol})`;
    } else {
      response += `${stock.name} (${stock.symbol})${recommendations.length > 2 ? ', ' : ' '}`;
    }
  });
  
  // Add reasoning
  response += `. ${getRecommendationReasoning(recommendations[0], market)}`;
  
  // Add Y2K finance bro flair
  response += ` ${getFinanceBroFlair()}`;
  
  return response;
};

const getRecommendationReasoning = (stock: Stock, market: MarketState): string => {
  const reasonings = [
    `Their ${stock.category} play is absolutely KILLER right now.`,
    `They're disrupting the entire ${stock.category} space with their internet strategy.`,
    `They've got first-mover advantage in the ${stock.category} vertical.`,
    `Their burn rate is high, but their growth metrics are OFF THE CHARTS.`,
    `Forget P/E ratios, we're talking about EYEBALLS and MINDSHARE here.`,
    `They're not profitable yet, but they're growing users at 40% month over month!`,
    `Their IPO is going to be HUGE, get in before the institutional money does.`
  ];
  
  return reasonings[Math.floor(Math.random() * reasonings.length)];
};

const getBubbleInsight = (market: MarketState): string => {
  switch (market.bubbleStage) {
    case 'early':
      return "Bubble? What bubble? This is the INTERNET REVOLUTION we're talking about! This technology is going to change EVERYTHING about how we live and do business. We're talking about a multi-TRILLION dollar opportunity here. Anyone who's not investing in dotcoms right now is going to miss the boat completely!";
    case 'growth':
      return "Listen, the naysayers always talk about 'bubbles' when they're missing out on massive gains. Are valuations aggressive? Sure! But that's because smart money KNOWS these companies are going to dominate the 21st century economy. This growth phase is just the beginning!";
    case 'mania':
      return "Look, I hear the bubble talk, but this is a NEW PARADIGM. The old valuation models don't apply to internet stocks. We're not looking at earnings, we're looking at EYEBALLS and MINDSHARE. The growth potential is literally infinite! This train has NO BRAKES!";
    case 'peak':
      return "OK, so valuations are a bit frothy, I'll give you that. But the companies that survive this shakeout period are going to be the Microsofts and Intels of the next decade. It's not about timing the market, it's about TIME IN THE MARKET. Stay the course!";
    case 'decline':
      return "We're seeing a healthy correction, that's all. Every bull market has its pullbacks. This is actually GOOD for the sector long-term, weeding out the weak players. The strong companies with real business models will bounce back stronger than ever!";
    case 'crash':
      return "Alright, I'll level with you - things are rough out there. But this is when FORTUNES are made! Warren Buffett says be greedy when others are fearful. The dotcom sector isn't dead, it's just on SALE! The internet isn't going away, and the survivors will be 10-baggers from these levels!";
    default:
      return "The market's always going to fluctuate, but the internet revolution is REAL. Focus on companies with solid fundamentals and disruptive technology, and you'll do fine in the long run.";
  }
};

const getPortfolioAdvice = (
  stocks: Stock[], 
  portfolio: {[key: string]: number}, 
  cash: number,
  market: MarketState
): string => {
  const portfolioStocks = Object.entries(portfolio).map(([stockId, shares]) => {
    const stock = stocks.find(s => s.id === stockId);
    return { stock, shares };
  }).filter(item => item.stock !== undefined);
  
  if (portfolioStocks.length === 0) {
    return "You haven't bought any stocks yet? What are you waiting for?! The internet revolution waits for no one! Check out my recommendations and start building your portfolio ASAP!";
  }
  
  // Calculate portfolio stats
  const totalValue = portfolioStocks.reduce((sum, item) => {
    return sum + (item.stock?.price || 0) * item.shares;
  }, 0);
  
  const cashPercentage = (cash / (cash + totalValue)) * 100;
  
  // Generate advice based on market stage and portfolio composition
  let advice = '';
  
  if (market.bubbleStage === 'crash' || market.bubbleStage === 'decline') {
    if (cashPercentage > 50) {
      advice = "Smart move keeping a lot of cash on hand during this volatility. You're positioned well to pick up some BARGAINS. Consider averaging into quality names that have been beaten down.";
    } else {
      advice = "Your portfolio is heavily invested during a challenging market. Consider raising some cash by trimming positions in the most speculative names. The strongest companies will survive this, but some won't.";
    }
  } else if (market.bubbleStage === 'peak') {
    if (cashPercentage > 30) {
      advice = "You're playing it a bit too safe with all that cash! The market's HOT right now. Consider putting more capital to work in high-growth internet names.";
    } else {
      advice = "You're well-positioned in this strong market! Your portfolio has good exposure to the internet boom. Just keep an eye on your riskier positions.";
    }
  } else if (market.bubbleStage === 'mania') {
    advice = "This market is ABSOLUTELY INSANE right now, and you need maximum exposure! Cash is trash when stocks are moving 10% a DAY. Get fully invested and ride this wave!";
  } else {
    advice = "Your portfolio is looking solid. The internet sector is still in growth mode, so stay invested and look for opportunities to add to your winners.";
  }
  
  // Add specific stock commentary
  if (portfolioStocks.length > 0) {
    const randomStock = portfolioStocks[Math.floor(Math.random() * portfolioStocks.length)];
    if (randomStock.stock) {
      advice += ` I particularly like your position in ${randomStock.stock.name} (${randomStock.stock.symbol}). ${getStockCommentary(randomStock.stock, market)}`;
    }
  }
  
  return advice;
};

const getStockCommentary = (stock: Stock, market: MarketState): string => {
  if (stock.survivalChance === 'very high' || stock.survivalChance === 'high') {
    return "That's one of the strongest players in the space with real staying power.";
  } else if (market.bubbleStage === 'crash' || market.bubbleStage === 'decline') {
    return "That one's facing some headwinds in the current market. Keep a close eye on it.";
  } else if (stock.volatility === 'extreme' || stock.volatility === 'high') {
    return "That's a high-flyer with massive upside potential. Volatile, but that's where the big returns come from!";
  } else {
    return "Solid choice in the current market environment.";
  }
};

const getSellAdvice = (market: MarketState): string => {
  switch (market.bubbleStage) {
    case 'early':
    case 'growth':
    case 'mania':
      return "Sell? Are you KIDDING me? This bull market is just getting started! The biggest gains are still ahead. Selling now would be leaving ENORMOUS money on the table. Diamond hands, baby!";
    case 'peak':
      return "Look, timing the market perfectly is impossible. Could we see a pullback? Sure. But the long-term trend is UP. If you're nervous, maybe trim your most speculative positions, but stay invested in the quality names.";
    case 'decline':
      return "Selling into weakness is rarely a good strategy. We're just seeing a healthy correction after a massive run-up. The strong companies will bounce back. If you sell now, you'll probably FOMO back in at higher prices.";
    case 'crash':
      return "I get the panic, I really do. But selling at the bottom is how retail investors ALWAYS get crushed. If you didn't sell at the top, selling now just locks in your losses. The survivors of this crash will be the tech giants of tomorrow.";
    default:
      return "Timing the market is a fool's game. If you believe in the internet revolution long-term, stay invested through the volatility. That said, there's nothing wrong with taking some profits on your biggest winners.";
  }
};

const getGenericResponse = (market: MarketState): string => {
  const genericResponses = [
    "Listen, in this market, you gotta MOVE FAST or get left behind. The internet is changing everything!",
    "I'm telling you, these valuations aren't crazy when you consider the TOTAL ADDRESSABLE MARKET. We're talking TRILLIONS here!",
    "Forget the old economy stocks. Internet is where the REAL action is. These companies are growing users at 50% month over month!",
    "You want my honest advice? Buy high, sell HIGHER. That's how you win in this market.",
    "Cash is TRASH in this environment. You need to be FULLY INVESTED to capture these gains!",
    "The key metrics aren't profits, they're EYEBALLS and MINDSHARE. The profits will come later!",
    "This isn't gambling, it's INVESTING IN THE FUTURE. The internet is the new industrial revolution!",
    "Warren Buffett doesn't get it. The old valuation models don't apply to internet stocks. This is a NEW PARADIGM!"
  ];
  
  // Add market stage specific flair
  let response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
  
  response += ` ${getFinanceBroFlair()}`;
  
  return response;
};

const getFinanceBroFlair = (): string => {
  const flairs = [
    "BOOM!",
    "That's how we do it on Wall Street!",
    "Trust me on this one.",
    "I've got sources you wouldn't believe.",
    "This is financial advice you can take to the BANK!",
    "I'm putting my own money in this, that's how confident I am.",
    "My clients in the Hamptons are ALL over this play.",
    "This is the kind of alpha you can't get from CNBC!",
    "Let's GOOOOO!",
    "To the MOON!"
  ];
  
  return flairs[Math.floor(Math.random() * flairs.length)];
};

export default InvestmentAdvisor;
