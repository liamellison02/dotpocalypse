import { useState, useEffect } from 'react';

export interface Stock {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  price: number;
  initialPrice: number;
  peakPrice: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  survivalChance: 'very low' | 'low' | 'medium' | 'high' | 'very high';
  priceHistory: PricePoint[];
  news: NewsItem[];
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface NewsItem {
  id: string;
  date: string;
  headline: string;
  content: string;
  impact: 'positive' | 'negative' | 'neutral';
  stockId?: string;
}

export interface MarketState {
  currentDate: string;
  marketIndex: number;
  marketIndexHistory: PricePoint[];
  bubbleStage: 'early' | 'growth' | 'mania' | 'peak' | 'decline' | 'crash';
  volatility: number;
  sentiment: number;
  news: NewsItem[];
  crashWarningShown: boolean;
  crashProbability: number;
  crashSeverity: number;
}

export interface SimulationSettings {
  startYear: number;
  startMonth: number;
  crashYear?: number;
  volatilityFactor: number;
  timeScale: number;
  crashRandomness: number;
}

// Default simulation settings
const defaultSettings: SimulationSettings = {
  startYear: 1998,
  startMonth: 1,
  volatilityFactor: 1.0,
  timeScale: 1,
  crashRandomness: 0.7,
};

// Helper functions for simulation
const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getVolatilityFactor = (volatility: Stock['volatility']): number => {
  switch (volatility) {
    case 'low': return 0.5;
    case 'medium': return 1.0;
    case 'high': return 2.0;
    case 'extreme': return 3.5;
    default: return 1.0;
  }
};

const getSurvivalFactor = (survivalChance: Stock['survivalChance']): number => {
  switch (survivalChance) {
    case 'very low': return 0.2;
    case 'low': return 0.4;
    case 'medium': return 0.6;
    case 'high': return 0.8;
    case 'very high': return 0.95;
    default: return 0.5;
  }
};

// Main simulation hook
export const useStockMarketSimulation = (
  initialStocks: Stock[],
  settings: SimulationSettings = defaultSettings
) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [market, setMarket] = useState<MarketState>({
    currentDate: formatDate(settings.startYear, settings.startMonth, 1),
    marketIndex: 1000,
    marketIndexHistory: [
      {
        date: formatDate(settings.startYear, settings.startMonth, 1),
        price: 1000,
      },
    ],
    bubbleStage: 'early',
    volatility: 0.2,
    sentiment: 0.6,
    news: [],
    crashWarningShown: false,
    crashProbability: 0,
    crashSeverity: 0.5,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(3000);
  const [gameOver, setGameOver] = useState(false);
  const [crashEvents, setCrashEvents] = useState<{
    warningDate: string | null;
    crashDate: string | null;
    peakIndex: number;
  }>({
    warningDate: null,
    crashDate: null,
    peakIndex: 0,
  });

  useEffect(() => {
    if (initialStocks.length > 0) {
      const startDate = formatDate(settings.startYear, settings.startMonth, 1);
      
      const initializedStocks = initialStocks.map(stock => ({
        ...stock,
        id: stock.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        symbol: generateStockSymbol(stock.name),
        price: stock.initialPrice,
        priceHistory: [
          {
            date: startDate,
            price: stock.initialPrice,
          },
        ],
        news: [],
      }));
      
      setStocks(initializedStocks);
      
      determineCrashTiming(settings);
    }
  }, [initialStocks, settings]);

  const generateStockSymbol = (name: string): string => {
    const symbol = name
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);
    
    if (symbol.length < 3) {
      const consonants = name
        .toUpperCase()
        .replace(/[AEIOU\s]/g, '')
        .slice(0, 5 - symbol.length);
      return (symbol + consonants).slice(0, 5);
    }
    
    return symbol;
  };

  const determineCrashTiming = (settings: SimulationSettings) => {
    let crashYear = 2000;
    let crashMonth = 3;
    
    if (settings.crashYear) {
      crashYear = settings.crashYear;
      crashMonth = crashYear === 2000 ? 3 : Math.floor(Math.random() * 12) + 1;
    } else {
      if (Math.random() < settings.crashRandomness) {
        crashYear = Math.floor(Math.random() * 3) + 2002;
        crashMonth = Math.floor(Math.random() * 12) + 1;
      }
    }
    
    const warningMonthsAhead = Math.floor(Math.random() * 3) + 1;
    let warningYear = crashYear;
    let warningMonth = crashMonth - warningMonthsAhead;
    
    if (warningMonth <= 0) {
      warningYear--;
      warningMonth += 12;
    }
    
    setCrashEvents({
      warningDate: formatDate(warningYear, warningMonth, 15),
      crashDate: formatDate(crashYear, crashMonth, 15),
      peakIndex: 0,
    });
  };

  const advanceSimulation = () => {
    if (gameOver) return;
    
    setMarket(prevMarket => {
      const newDate = addDays(prevMarket.currentDate, settings.timeScale);
      const currentYear = parseInt(newDate.split('-')[0]);
      const currentMonth = parseInt(newDate.split('-')[1]);
      
      let newBubbleStage = prevMarket.bubbleStage;
      let newVolatility = prevMarket.volatility;
      let newSentiment = prevMarket.sentiment;
      let newCrashProbability = prevMarket.crashProbability;
      let newCrashWarningShown = prevMarket.crashWarningShown;
      let newCrashSeverity = prevMarket.crashSeverity;
      
      if (crashEvents.warningDate && newDate >= crashEvents.warningDate && !newCrashWarningShown) {
        newCrashWarningShown = true;
        newCrashProbability = 0.3;
        
        const warningNews: NewsItem = {
          id: `crash-warning-${Date.now()}`,
          date: newDate,
          headline: "Analysts Warn of Potential Tech Bubble",
          content: "Several prominent Wall Street analysts have raised concerns about the sustainability of current tech stock valuations. They point to excessive speculation, particularly in internet stocks with little or no earnings. Some are drawing comparisons to previous market bubbles.",
          impact: 'negative'
        };
        
        prevMarket.news.unshift(warningNews);
      }
      
      if (crashEvents.crashDate && newDate >= crashEvents.crashDate) {
        newCrashProbability = Math.min(newCrashProbability + 0.1, 0.95);
        
        const daysPastCrashDate = (new Date(newDate).getTime() - new Date(crashEvents.crashDate).getTime()) / (1000 * 60 * 60 * 24);
        newCrashSeverity = Math.min(0.5 + (daysPastCrashDate / 30) * 0.5, 1.0);
      }
      
      if (newCrashProbability > 0 && Math.random() < newCrashProbability * 0.1) {
        newBubbleStage = 'crash';
        newVolatility = 1.0;
        newSentiment = 0.1 + getRandomFloat(0, 0.1);
        
        const crashNews: NewsItem = {
          id: `crash-event-${Date.now()}`,
          date: newDate,
          headline: "MARKET CRASH: Tech Stocks in Free Fall as Bubble Bursts",
          content: "The tech-heavy market index is experiencing its worst decline in history as the dotcom bubble finally bursts. Internet stocks are leading the selloff, with many losing more than half their value in a matter of days. Panic selling has gripped the market as investors flee what many are now calling vastly overvalued assets.",
          impact: 'negative'
        };
        
        prevMarket.news.unshift(crashNews);
        
        if (crashEvents.peakIndex === 0) {
          setCrashEvents(prev => ({
            ...prev,
            peakIndex: prevMarket.marketIndex
          }));
        }
      } 
      
      if (newBubbleStage !== 'crash') {
        if (currentYear < 1999) {
          newBubbleStage = 'early';
          newVolatility = 0.2;
          newSentiment = 0.6 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 1999 && currentMonth < 6) {
          newBubbleStage = 'growth';
          newVolatility = 0.3;
          newSentiment = 0.7 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 1999 && currentMonth >= 6) {
          newBubbleStage = 'mania';
          newVolatility = 0.5;
          newSentiment = 0.85 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 2000 && currentMonth < 3) {
          newBubbleStage = 'peak';
          newVolatility = 0.7;
          newSentiment = 0.9 + getRandomFloat(-0.2, 0.1);
        } else if (newDate < crashEvents.crashDate!) {
          newBubbleStage = 'decline';
          newVolatility = 0.8;
          newSentiment = 0.5 + getRandomFloat(-0.3, 0.1);
        }
      }
      
      let indexChange = 0;
      
      switch (newBubbleStage) {
        case 'early':
          indexChange = getRandomFloat(-0.01, 0.03) * settings.volatilityFactor;
          break;
        case 'growth':
          indexChange = getRandomFloat(-0.01, 0.05) * settings.volatilityFactor;
          break;
        case 'mania':
          indexChange = getRandomFloat(-0.02, 0.08) * settings.volatilityFactor;
          break;
        case 'peak':
          indexChange = getRandomFloat(-0.05, 0.05) * settings.volatilityFactor;
          break;
        case 'decline':
          indexChange = getRandomFloat(-0.08, 0.02) * settings.volatilityFactor;
          break;
        case 'crash':
          indexChange = getRandomFloat(-0.15 * newCrashSeverity, 0.01) * settings.volatilityFactor;
          break;
      }
      
      const newMarketIndex = Math.max(100, prevMarket.marketIndex * (1 + indexChange));
      
      if (newBubbleStage === 'crash' && 
          newMarketIndex < prevMarket.marketIndex * 0.7 && 
          currentYear >= 2002 && 
          Math.random() > 0.95) {
        setGameOver(true);
      }
      
      return {
        ...prevMarket,
        currentDate: newDate,
        marketIndex: newMarketIndex,
        marketIndexHistory: [
          ...prevMarket.marketIndexHistory,
          {
            date: newDate,
            price: newMarketIndex,
          },
        ],
        bubbleStage: newBubbleStage,
        volatility: newVolatility,
        sentiment: newSentiment,
        crashWarningShown: newCrashWarningShown,
        crashProbability: newCrashProbability,
        crashSeverity: newCrashSeverity,
      };
    });
    
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        const volatilityFactor = getVolatilityFactor(stock.volatility);
        const survivalFactor = getSurvivalFactor(stock.survivalChance);
        const marketInfluence = market.bubbleStage === 'crash' ? 0.7 : 0.4;
        
        let baseChange = getRandomFloat(-0.05, 0.05) * volatilityFactor * settings.volatilityFactor;
        
        const marketChange = ((market.marketIndex / market.marketIndexHistory[0].price) - 1) * marketInfluence;
        baseChange += marketChange * getRandomFloat(0.5, 1.5);
        
        if (market.bubbleStage === 'mania' && stock.category === 'E-commerce') {
          baseChange += getRandomFloat(0, 0.05);
        }
        
        if (market.bubbleStage === 'crash') {
          const crashImpact = (1 - survivalFactor) * getRandomFloat(0.01, 0.1) * market.crashSeverity;
          baseChange -= crashImpact;
          
          if (stock.survivalChance === 'very low' && Math.random() < 0.05 * market.crashSeverity) {
            baseChange = -0.5;
          }
        }
        
        let newPrice = stock.price * (1 + baseChange);
        
        newPrice = Math.max(0.1, newPrice);
        
        if (market.bubbleStage !== 'crash' && newPrice > stock.peakPrice * 1.5) {
          newPrice = stock.peakPrice * (1 + getRandomFloat(0, 0.5));
        }
        
        return {
          ...stock,
          price: newPrice,
          priceHistory: [
            ...stock.priceHistory,
            {
              date: market.currentDate,
              price: newPrice,
            },
          ],
        };
      });
    });
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !gameOver) {
      interval = setInterval(advanceSimulation, simulationSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, simulationSpeed, gameOver]);

  const advanceToNextDay = () => {
    if (gameOver) return;
    
    setMarket(prevMarket => {
      const newDate = addDays(prevMarket.currentDate, 1);
      const currentYear = parseInt(newDate.split('-')[0]);
      const currentMonth = parseInt(newDate.split('-')[1]);
      
      let newBubbleStage = prevMarket.bubbleStage;
      let newVolatility = prevMarket.volatility;
      let newSentiment = prevMarket.sentiment;
      let newCrashProbability = prevMarket.crashProbability;
      let newCrashWarningShown = prevMarket.crashWarningShown;
      let newCrashSeverity = prevMarket.crashSeverity;
      
      if (crashEvents.warningDate && newDate >= crashEvents.warningDate && !newCrashWarningShown) {
        newCrashWarningShown = true;
        newCrashProbability = 0.3;
        
        const warningNews: NewsItem = {
          id: `crash-warning-${Date.now()}`,
          date: newDate,
          headline: "Analysts Warn of Potential Tech Bubble",
          content: "Several prominent Wall Street analysts have raised concerns about the sustainability of current tech stock valuations. They point to excessive speculation, particularly in internet stocks with little or no earnings. Some are drawing comparisons to previous market bubbles.",
          impact: 'negative'
        };
        
        prevMarket.news.unshift(warningNews);
      }
      
      if (crashEvents.crashDate && newDate >= crashEvents.crashDate) {
        newCrashProbability = Math.min(newCrashProbability + 0.1, 0.95);
        
        const daysPastCrashDate = (new Date(newDate).getTime() - new Date(crashEvents.crashDate).getTime()) / (1000 * 60 * 60 * 24);
        newCrashSeverity = Math.min(0.5 + (daysPastCrashDate / 30) * 0.5, 1.0);
      }
      
      if (newCrashProbability > 0 && Math.random() < newCrashProbability * 0.1) {
        newBubbleStage = 'crash';
        newVolatility = 1.0;
        newSentiment = 0.1 + getRandomFloat(0, 0.1);
        
        const crashNews: NewsItem = {
          id: `crash-event-${Date.now()}`,
          date: newDate,
          headline: "MARKET CRASH: Tech Stocks in Free Fall as Bubble Bursts",
          content: "The tech-heavy market index is experiencing its worst decline in history as the dotcom bubble finally bursts. Internet stocks are leading the selloff, with many losing more than half their value in a matter of days. Panic selling has gripped the market as investors flee what many are now calling vastly overvalued assets.",
          impact: 'negative'
        };
        
        prevMarket.news.unshift(crashNews);
        
        if (crashEvents.peakIndex === 0) {
          setCrashEvents(prev => ({
            ...prev,
            peakIndex: prevMarket.marketIndex
          }));
        }
      } 
      
      if (newBubbleStage !== 'crash') {
        if (currentYear < 1999) {
          newBubbleStage = 'early';
          newVolatility = 0.2;
          newSentiment = 0.6 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 1999 && currentMonth < 6) {
          newBubbleStage = 'growth';
          newVolatility = 0.3;
          newSentiment = 0.7 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 1999 && currentMonth >= 6) {
          newBubbleStage = 'mania';
          newVolatility = 0.5;
          newSentiment = 0.85 + getRandomFloat(-0.1, 0.1);
        } else if (currentYear === 2000 && currentMonth < 3) {
          newBubbleStage = 'peak';
          newVolatility = 0.7;
          newSentiment = 0.9 + getRandomFloat(-0.2, 0.1);
        } else if (newDate < crashEvents.crashDate!) {
          newBubbleStage = 'decline';
          newVolatility = 0.8;
          newSentiment = 0.5 + getRandomFloat(-0.3, 0.1);
        }
      }
      
      let indexChange = 0;
      
      switch (newBubbleStage) {
        case 'early':
          indexChange = getRandomFloat(-0.01, 0.03) * settings.volatilityFactor;
          break;
        case 'growth':
          indexChange = getRandomFloat(-0.01, 0.05) * settings.volatilityFactor;
          break;
        case 'mania':
          indexChange = getRandomFloat(-0.02, 0.08) * settings.volatilityFactor;
          break;
        case 'peak':
          indexChange = getRandomFloat(-0.05, 0.05) * settings.volatilityFactor;
          break;
        case 'decline':
          indexChange = getRandomFloat(-0.08, 0.02) * settings.volatilityFactor;
          break;
        case 'crash':
          indexChange = getRandomFloat(-0.15 * newCrashSeverity, 0.01) * settings.volatilityFactor;
          break;
      }
      
      const newMarketIndex = Math.max(100, prevMarket.marketIndex * (1 + indexChange));
      
      if (newBubbleStage === 'crash' && 
          newMarketIndex < prevMarket.marketIndex * 0.7 && 
          currentYear >= 2002 && 
          Math.random() > 0.95) {
        setGameOver(true);
      }
      
      return {
        ...prevMarket,
        currentDate: newDate,
        marketIndex: newMarketIndex,
        marketIndexHistory: [
          ...prevMarket.marketIndexHistory,
          {
            date: newDate,
            price: newMarketIndex,
          },
        ],
        bubbleStage: newBubbleStage,
        volatility: newVolatility,
        sentiment: newSentiment,
        crashWarningShown: newCrashWarningShown,
        crashProbability: newCrashProbability,
        crashSeverity: newCrashSeverity,
      };
    });
    
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        const volatilityFactor = getVolatilityFactor(stock.volatility);
        const survivalFactor = getSurvivalFactor(stock.survivalChance);
        const marketInfluence = market.bubbleStage === 'crash' ? 0.7 : 0.4;
        
        let baseChange = getRandomFloat(-0.05, 0.05) * volatilityFactor * settings.volatilityFactor;
        
        const marketChange = ((market.marketIndex / market.marketIndexHistory[0].price) - 1) * marketInfluence;
        baseChange += marketChange * getRandomFloat(0.5, 1.5);
        
        if (market.bubbleStage === 'mania' && stock.category === 'E-commerce') {
          baseChange += getRandomFloat(0, 0.05);
        }
        
        if (market.bubbleStage === 'crash') {
          const crashImpact = (1 - survivalFactor) * getRandomFloat(0.01, 0.1) * market.crashSeverity;
          baseChange -= crashImpact;
          
          if (stock.survivalChance === 'very low' && Math.random() < 0.05 * market.crashSeverity) {
            baseChange = -0.5;
          }
        }
        
        let newPrice = stock.price * (1 + baseChange);
        
        newPrice = Math.max(0.1, newPrice);
        
        if (market.bubbleStage !== 'crash' && newPrice > stock.peakPrice * 1.5) {
          newPrice = stock.peakPrice * (1 + getRandomFloat(0, 0.5));
        }
        
        return {
          ...stock,
          price: newPrice,
          priceHistory: [
            ...stock.priceHistory,
            {
              date: market.currentDate,
              price: newPrice,
            },
          ],
        };
      });
    });
  };

  const setSpeed = (speed: number) => {
    setSimulationSpeed(speed);
  };

  const resetSimulation = () => {
    const startDate = formatDate(settings.startYear, settings.startMonth, 1);
    
    setMarket({
      currentDate: startDate,
      marketIndex: 1000,
      marketIndexHistory: [
        {
          date: startDate,
          price: 1000,
        },
      ],
      bubbleStage: 'early',
      volatility: 0.2,
      sentiment: 0.6,
      news: [],
      crashWarningShown: false,
      crashProbability: 0,
      crashSeverity: 0.5,
    });
    
    setStocks(initialStocks.map(stock => ({
      ...stock,
      id: stock.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      symbol: generateStockSymbol(stock.name),
      price: stock.initialPrice,
      priceHistory: [
        {
          date: startDate,
          price: stock.initialPrice,
        },
      ],
      news: [],
    })));
    
    setGameOver(false);
    setIsRunning(false);
    
    determineCrashTiming(settings);
  };

  return {
    stocks,
    market,
    isRunning,
    gameOver,
    simulationSpeed,
    toggleSimulation,
    setSpeed,
    advanceSimulation,
    advanceToNextDay,
    resetSimulation,
    crashEvents,
  };
};
