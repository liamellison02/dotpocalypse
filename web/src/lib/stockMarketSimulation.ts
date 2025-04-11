import { useState, useEffect } from 'react';

// Types for stock market simulation
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
  stockId?: string; // Optional - if news affects a specific stock
}

export interface MarketState {
  currentDate: string;
  marketIndex: number;
  marketIndexHistory: PricePoint[];
  bubbleStage: 'early' | 'growth' | 'mania' | 'peak' | 'decline' | 'crash';
  volatility: number; // 0-1 scale
  sentiment: number; // 0-1 scale (0 = bearish, 1 = bullish)
  news: NewsItem[];
  crashWarningShown: boolean; // Flag to track if crash warning has been shown
  crashProbability: number; // Probability of crash (0-1)
  crashSeverity: number; // How severe the crash will be (0-1)
}

export interface SimulationSettings {
  startYear: number;
  startMonth: number;
  crashYear?: number; // Optional - if user wants to control when crash happens
  volatilityFactor: number; // 0.5-2.0 multiplier for overall volatility
  timeScale: number; // How many days pass per simulation tick
  crashRandomness: number; // 0-1, how random the crash timing is (0 = deterministic, 1 = fully random)
}

// Default simulation settings
const defaultSettings: SimulationSettings = {
  startYear: 1998,
  startMonth: 1,
  volatilityFactor: 1.0,
  timeScale: 1, // 1 day per tick (changed from 7)
  crashRandomness: 0.7, // Somewhat random crash timing
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
    marketIndex: 1000, // Starting index value
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
  const [simulationSpeed, setSimulationSpeed] = useState(3000); // ms between ticks (slowed down from 1000)
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

  // Initialize simulation
  useEffect(() => {
    if (initialStocks.length > 0) {
      const startDate = formatDate(settings.startYear, settings.startMonth, 1);
      
      // Initialize stocks with price history
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
      
      // Determine crash timing
      determineCrashTiming(settings);
    }
  }, [initialStocks, settings]);

  // Generate a stock symbol from company name
  const generateStockSymbol = (name: string): string => {
    // Extract first letters of words, uppercase, max 5 chars
    const symbol = name
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);
    
    // If symbol is too short, add consonants from name
    if (symbol.length < 3) {
      const consonants = name
        .toUpperCase()
        .replace(/[AEIOU\s]/g, '')
        .slice(0, 5 - symbol.length);
      return (symbol + consonants).slice(0, 5);
    }
    
    return symbol;
  };

  // Determine when the crash will happen
  const determineCrashTiming = (settings: SimulationSettings) => {
    // Default crash timing (March 2000 - historical NASDAQ peak)
    let crashYear = 2000;
    let crashMonth = 3;
    
    // If user specified a crash year, use that
    if (settings.crashYear) {
      crashYear = settings.crashYear;
      // Random month if not March
      crashMonth = crashYear === 2000 ? 3 : Math.floor(Math.random() * 12) + 1;
    } else {
      // Add some randomness based on crashRandomness setting
      if (Math.random() < settings.crashRandomness) {
        // Randomly adjust crash timing within 2002-2004 range as specified in requirements
        crashYear = Math.floor(Math.random() * 3) + 2002;
        crashMonth = Math.floor(Math.random() * 12) + 1;
      }
    }
    
    // Calculate warning date (1-3 months before crash)
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
      peakIndex: 0, // Will be set when peak is reached
    });
  };

  // Advance simulation by one tick
  const advanceSimulation = () => {
    if (gameOver) return;
    
    // Update market state
    setMarket(prevMarket => {
      const newDate = addDays(prevMarket.currentDate, settings.timeScale);
      const currentYear = parseInt(newDate.split('-')[0]);
      const currentMonth = parseInt(newDate.split('-')[1]);
      
      // Determine bubble stage based on date and crash events
      let newBubbleStage = prevMarket.bubbleStage;
      let newVolatility = prevMarket.volatility;
      let newSentiment = prevMarket.sentiment;
      let newCrashProbability = prevMarket.crashProbability;
      let newCrashWarningShown = prevMarket.crashWarningShown;
      let newCrashSeverity = prevMarket.crashSeverity;
      
      // Check if we've reached the warning date
      if (crashEvents.warningDate && newDate >= crashEvents.warningDate && !newCrashWarningShown) {
        newCrashWarningShown = true;
        newCrashProbability = 0.3; // Initial crash probability after warning
        
        // Generate warning news
        const warningNews: NewsItem = {
          id: `crash-warning-${Date.now()}`,
          date: newDate,
          headline: "Analysts Warn of Potential Tech Bubble",
          content: "Several prominent Wall Street analysts have raised concerns about the sustainability of current tech stock valuations. They point to excessive speculation, particularly in internet stocks with little or no earnings. Some are drawing comparisons to previous market bubbles.",
          impact: 'negative'
        };
        
        // Add warning news
        prevMarket.news.unshift(warningNews);
      }
      
      // Check if we've reached the crash date
      if (crashEvents.crashDate && newDate >= crashEvents.crashDate) {
        // Once we reach crash date, increase crash probability significantly
        newCrashProbability = Math.min(newCrashProbability + 0.1, 0.95);
        
        // Determine crash severity based on how far past crash date we are
        const daysPastCrashDate = (new Date(newDate).getTime() - new Date(crashEvents.crashDate).getTime()) / (1000 * 60 * 60 * 24);
        newCrashSeverity = Math.min(0.5 + (daysPastCrashDate / 30) * 0.5, 1.0);
      }
      
      // Roll for crash if probability is high enough
      if (newCrashProbability > 0 && Math.random() < newCrashProbability * 0.1) {
        newBubbleStage = 'crash';
        newVolatility = 1.0;
        newSentiment = 0.1 + getRandomFloat(0, 0.1);
        
        // Generate crash news
        const crashNews: NewsItem = {
          id: `crash-event-${Date.now()}`,
          date: newDate,
          headline: "MARKET CRASH: Tech Stocks in Free Fall as Bubble Bursts",
          content: "The tech-heavy market index is experiencing its worst decline in history as the dotcom bubble finally bursts. Internet stocks are leading the selloff, with many losing more than half their value in a matter of days. Panic selling has gripped the market as investors flee what many are now calling vastly overvalued assets.",
          impact: 'negative'
        };
        
        // Add crash news
        prevMarket.news.unshift(crashNews);
        
        // Record peak index if not already set
        if (crashEvents.peakIndex === 0) {
          setCrashEvents(prev => ({
            ...prev,
            peakIndex: prevMarket.marketIndex
          }));
        }
      } 
      // Simple bubble progression based on time if not in crash
      else if (newBubbleStage !== 'crash') {
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
      
      // Calculate new market index
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
          // More severe crash based on crash severity
          indexChange = getRandomFloat(-0.15 * newCrashSeverity, 0.01) * settings.volatilityFactor;
          break;
      }
      
      const newMarketIndex = Math.max(100, prevMarket.marketIndex * (1 + indexChange));
      
      // Check if game should end (sometime after crash begins and market drops significantly)
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
    
    // Update stock prices
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        // Calculate price change based on stock properties and market conditions
        const volatilityFactor = getVolatilityFactor(stock.volatility);
        const survivalFactor = getSurvivalFactor(stock.survivalChance);
        const marketInfluence = market.bubbleStage === 'crash' ? 0.7 : 0.4; // How much market affects stock
        
        // Base change is influenced by market sentiment and stock's own factors
        let baseChange = getRandomFloat(-0.05, 0.05) * volatilityFactor * settings.volatilityFactor;
        
        // Add market influence
        const marketChange = ((market.marketIndex / market.marketIndexHistory[0].price) - 1) * marketInfluence;
        baseChange += marketChange * getRandomFloat(0.5, 1.5);
        
        // Adjust for bubble stage
        if (market.bubbleStage === 'mania' && stock.category === 'E-commerce') {
          baseChange += getRandomFloat(0, 0.05); // E-commerce stocks boom in mania phase
        }
        
        if (market.bubbleStage === 'crash') {
          // Stocks with low survival chance crash harder
          const crashImpact = (1 - survivalFactor) * getRandomFloat(0.01, 0.1) * market.crashSeverity;
          baseChange -= crashImpact;
          
          // Some stocks might go bankrupt during crash
          if (stock.survivalChance === 'very low' && Math.random() < 0.05 * market.crashSeverity) {
            baseChange = -0.5; // Catastrophic loss
          }
        }
        
        // Calculate new price
        let newPrice = stock.price * (1 + baseChange);
        
        // Ensure price doesn't go below 0.1
        newPrice = Math.max(0.1, newPrice);
        
        // Ensure price doesn't exceed peak price too much during bubble
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

  // Start/stop simulation
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  // Run simulation when isRunning is true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !gameOver) {
      interval = setInterval(advanceSimulation, simulationSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, simulationSpeed, gameOver]);

  // Advance to next day (skips directly to next day regardless of timeScale)
  const advanceToNextDay = () => {
    if (gameOver) return;
    
    // Update market state
    setMarket(prevMarket => {
      // Always advance by exactly 1 day
      const newDate = addDays(prevMarket.currentDate, 1);
      const currentYear = parseInt(newDate.split('-')[0]);
      const currentMonth = parseInt(newDate.split('-')[1]);
      
      // Determine bubble stage based on date and crash events
      let newBubbleStage = prevMarket.bubbleStage;
      let newVolatility = prevMarket.volatility;
      let newSentiment = prevMarket.sentiment;
      let newCrashProbability = prevMarket.crashProbability;
      let newCrashWarningShown = prevMarket.crashWarningShown;
      let newCrashSeverity = prevMarket.crashSeverity;
      
      // Check if we've reached the warning date
      if (crashEvents.warningDate && newDate >= crashEvents.warningDate && !newCrashWarningShown) {
        newCrashWarningShown = true;
        newCrashProbability = 0.3; // Initial crash probability after warning
        
        // Generate warning news
        const warningNews: NewsItem = {
          id: `crash-warning-${Date.now()}`,
          date: newDate,
          headline: "Analysts Warn of Potential Tech Bubble",
          content: "Several prominent Wall Street analysts have raised concerns about the sustainability of current tech stock valuations. They point to excessive speculation, particularly in internet stocks with little or no earnings. Some are drawing comparisons to previous market bubbles.",
          impact: 'negative'
        };
        
        // Add warning news
        prevMarket.news.unshift(warningNews);
      }
      
      // Check if we've reached the crash date
      if (crashEvents.crashDate && newDate >= crashEvents.crashDate) {
        // Once we reach crash date, increase crash probability significantly
        newCrashProbability = Math.min(newCrashProbability + 0.1, 0.95);
        
        // Determine crash severity based on how far past crash date we are
        const daysPastCrashDate = (new Date(newDate).getTime() - new Date(crashEvents.crashDate).getTime()) / (1000 * 60 * 60 * 24);
        newCrashSeverity = Math.min(0.5 + (daysPastCrashDate / 30) * 0.5, 1.0);
      }
      
      // Roll for crash if probability is high enough
      if (newCrashProbability > 0 && Math.random() < newCrashProbability * 0.1) {
        newBubbleStage = 'crash';
        newVolatility = 1.0;
        newSentiment = 0.1 + getRandomFloat(0, 0.1);
        
        // Generate crash news
        const crashNews: NewsItem = {
          id: `crash-event-${Date.now()}`,
          date: newDate,
          headline: "MARKET CRASH: Tech Stocks in Free Fall as Bubble Bursts",
          content: "The tech-heavy market index is experiencing its worst decline in history as the dotcom bubble finally bursts. Internet stocks are leading the selloff, with many losing more than half their value in a matter of days. Panic selling has gripped the market as investors flee what many are now calling vastly overvalued assets.",
          impact: 'negative'
        };
        
        // Add crash news
        prevMarket.news.unshift(crashNews);
        
        // Record peak index if not already set
        if (crashEvents.peakIndex === 0) {
          setCrashEvents(prev => ({
            ...prev,
            peakIndex: prevMarket.marketIndex
          }));
        }
      } 
      // Simple bubble progression based on time if not in crash
      else if (newBubbleStage !== 'crash') {
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
      
      // Calculate new market index
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
          // More severe crash based on crash severity
          indexChange = getRandomFloat(-0.15 * newCrashSeverity, 0.01) * settings.volatilityFactor;
          break;
      }
      
      const newMarketIndex = Math.max(100, prevMarket.marketIndex * (1 + indexChange));
      
      // Check if game should end (sometime after crash begins and market drops significantly)
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
    
    // Update stock prices
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        // Calculate price change based on stock properties and market conditions
        const volatilityFactor = getVolatilityFactor(stock.volatility);
        const survivalFactor = getSurvivalFactor(stock.survivalChance);
        const marketInfluence = market.bubbleStage === 'crash' ? 0.7 : 0.4; // How much market affects stock
        
        // Base change is influenced by market sentiment and stock's own factors
        let baseChange = getRandomFloat(-0.05, 0.05) * volatilityFactor * settings.volatilityFactor;
        
        // Add market influence
        const marketChange = ((market.marketIndex / market.marketIndexHistory[0].price) - 1) * marketInfluence;
        baseChange += marketChange * getRandomFloat(0.5, 1.5);
        
        // Adjust for bubble stage
        if (market.bubbleStage === 'mania' && stock.category === 'E-commerce') {
          baseChange += getRandomFloat(0, 0.05); // E-commerce stocks boom in mania phase
        }
        
        if (market.bubbleStage === 'crash') {
          // Stocks with low survival chance crash harder
          const crashImpact = (1 - survivalFactor) * getRandomFloat(0.01, 0.1) * market.crashSeverity;
          baseChange -= crashImpact;
          
          // Some stocks might go bankrupt during crash
          if (stock.survivalChance === 'very low' && Math.random() < 0.05 * market.crashSeverity) {
            baseChange = -0.5; // Catastrophic loss
          }
        }
        
        // Calculate new price
        let newPrice = stock.price * (1 + baseChange);
        
        // Ensure price doesn't go below 0.1
        newPrice = Math.max(0.1, newPrice);
        
        // Ensure price doesn't exceed peak price too much during bubble
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

  // Change simulation speed
  const setSpeed = (speed: number) => {
    setSimulationSpeed(speed);
  };

  // Reset simulation
  const resetSimulation = () => {
    // Reset to initial state
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
    
    // Determine new crash timing
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
