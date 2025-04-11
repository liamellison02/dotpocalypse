import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useAuth } from './context/AuthContext';
import AuthProvider from './context/AuthContext';
import Auth from './components/auth/Auth';
import ThemeWrapper from './components/ui/Theme';
import Desktop from './components/layout/Desktop';
import { Window } from './components/ui/Window';
import { Tabs, Tab, TabBody, Button, Fieldset } from 'react95';
import { useStockMarketSimulation } from './lib/stockMarketSimulation';
import ErrorBoundary from './components/portfolio/ErrorBoundary';
import './App.css';

// Import company data
import companiesData from './data/companies-data.json';

// Lazy load components for code splitting
const StockSimulation = lazy(() => import('./components/simulation/StockSimulation'));
const InvestmentAdvisor = lazy(() => import('./components/advisor/InvestmentAdvisor'));
const PortfolioManager = lazy(() => import('./components/portfolio/PortfolioManager'));
const SaveLoadManager = lazy(() => import('./components/simulation/SaveLoadManager'));
const NewsFeed = lazy(() => import('./components/simulation/NewsFeed'));

const AppContainer = styled.div`
  height: 100%;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  padding: 20px;
  height: calc(100% - 40px);
  overflow: auto;
`;

const MainWindow = styled(Window)`
  width: 95%;
  height: 90%;
  margin: 20px auto;
`;

const TabsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TabContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 10px;
`;

const SettingsContainer = styled.div`
  padding: 16px;
`;

const SettingsRow = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: center;
`;

const SettingsLabel = styled.div`
  width: 150px;
  margin-right: 16px;
`;

const SettingsValue = styled.div`
  flex: 1;
`;

// Loading component for code splitting
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    backgroundColor: '#efefef'
  }}>
    <div style={{ fontFamily: 'MS Sans Serif' }}>Loading...</div>
  </div>
);

// Main application component
const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    startYear: 1998,
    startMonth: 1,
    volatilityFactor: 1.0,
    timeScale: 7,
    crashRandomness: 0.7,
  });
  
  // Initialize stocks from company data - memoized to prevent unnecessary recalculations
  const initialStocks = useMemo(() => [
    ...companiesData.notorious.map(company => ({
      id: company.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: company.name,
      symbol: company.name.split(/\s+/).map(word => word[0]).join('').toUpperCase().slice(0, 5),
      description: company.description,
      category: company.category,
      price: company.initialPrice,
      initialPrice: company.initialPrice,
      peakPrice: company.peakPrice,
      volatility: company.volatility as 'low' | 'medium' | 'high' | 'extreme',
      survivalChance: company.survivalChance as 'very low' | 'low' | 'medium' | 'high' | 'very high',
      priceHistory: [],
      news: [],
    })),
    ...companiesData.survivors.map(company => ({
      id: company.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: company.name,
      symbol: company.name.split(/\s+/).map(word => word[0]).join('').toUpperCase().slice(0, 5),
      description: company.description,
      category: company.category,
      price: company.initialPrice,
      initialPrice: company.initialPrice,
      peakPrice: company.peakPrice,
      volatility: company.volatility as 'low' | 'medium' | 'high' | 'extreme',
      survivalChance: company.survivalChance as 'very low' | 'low' | 'medium' | 'high' | 'very high',
      priceHistory: [],
      news: [],
    }))
  ], []);
  
  // Initialize simulation
  const {
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
  } = useStockMarketSimulation(initialStocks, settings);
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<{[key: string]: number}>({});
  const [cash, setCash] = useState(10000);
  
  // Buy stock - memoized to prevent unnecessary recreations
  const buyStock = useCallback((stockId: string, shares: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;
    
    const cost = stock.price * shares;
    if (cost > cash) return; // Not enough cash
    
    setCash(prev => prev - cost);
    setPortfolio(prev => ({
      ...prev,
      [stockId]: (prev[stockId] || 0) + shares
    }));
  }, [stocks, cash]);
  
  // Sell stock - memoized to prevent unnecessary recreations
  const sellStock = useCallback((stockId: string, shares: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;
    
    const currentShares = portfolio[stockId] || 0;
    const sharesToSell = Math.min(shares, currentShares);
    
    if (sharesToSell <= 0) return; // No shares to sell
    
    const revenue = stock.price * sharesToSell;
    setCash(prev => prev + revenue);
    
    setPortfolio(prev => {
      const newPortfolio = { ...prev };
      newPortfolio[stockId] = currentShares - sharesToSell;
      
      // Remove stock from portfolio if no shares left
      if (newPortfolio[stockId] <= 0) {
        delete newPortfolio[stockId];
      }
      
      return newPortfolio;
    });
  }, [stocks, portfolio]);
  
  // Generate news using OpenAI (in a real implementation)
  useEffect(() => {
    // This would call the OpenAI service in a real implementation
    // For now, we'll use the existing news from the market state
    
    // In a production app, we would do:
    // if (market.marketIndexHistory.length > 1) {
    //   const previousIndex = market.marketIndexHistory[market.marketIndexHistory.length - 2].price;
    //   generateNewsHeadlines(
    //     market.currentDate,
    //     market.bubbleStage,
    //     stocks,
    //     market.marketIndex,
    //     previousIndex
    //   ).then(news => {
    //     // Add news to market state
    //   });
    // }
  }, [market.currentDate]);
  
  // Load game state
  const loadGameState = useCallback((savedGame: any) => {
    // In a real implementation, this would properly restore the game state
    // For this demo, we'll just log it
    console.log('Loading game state:', savedGame);
    
    // We would do something like:
    // setMarket(savedGame.market_state);
    // setStocks(savedGame.stocks);
    setPortfolio(savedGame.portfolio);
    setCash(savedGame.cash);
    setSettings(savedGame.settings);
  }, []);
  
  // Settings panel - memoized to prevent unnecessary rerenders
  const renderSettings = useMemo(() => (
    <SettingsContainer>
      <Fieldset label="Simulation Settings">
        <SettingsRow>
          <SettingsLabel>Start Year:</SettingsLabel>
          <SettingsValue>
            <select 
              value={settings.startYear}
              onChange={(e) => setSettings({...settings, startYear: parseInt(e.target.value)})}
              style={{ width: '100px' }}
            >
              <option value={1997}>1997</option>
              <option value={1998}>1998</option>
              <option value={1999}>1999</option>
            </select>
          </SettingsValue>
        </SettingsRow>
        
        <SettingsRow>
          <SettingsLabel>Start Month:</SettingsLabel>
          <SettingsValue>
            <select 
              value={settings.startMonth}
              onChange={(e) => setSettings({...settings, startMonth: parseInt(e.target.value)})}
              style={{ width: '100px' }}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </SettingsValue>
        </SettingsRow>
        
        <SettingsRow>
          <SettingsLabel>Market Volatility:</SettingsLabel>
          <SettingsValue>
            <select 
              value={settings.volatilityFactor}
              onChange={(e) => setSettings({...settings, volatilityFactor: parseFloat(e.target.value)})}
              style={{ width: '100px' }}
            >
              <option value={0.5}>Low</option>
              <option value={1.0}>Normal</option>
              <option value={1.5}>High</option>
              <option value={2.0}>Extreme</option>
            </select>
          </SettingsValue>
        </SettingsRow>
        
        <SettingsRow>
          <SettingsLabel>Crash Randomness:</SettingsLabel>
          <SettingsValue>
            <select 
              value={settings.crashRandomness}
              onChange={(e) => setSettings({...settings, crashRandomness: parseFloat(e.target.value)})}
              style={{ width: '100px' }}
            >
              <option value={0.3}>Low</option>
              <option value={0.5}>Medium</option>
              <option value={0.7}>High</option>
              <option value={1.0}>Complete</option>
            </select>
          </SettingsValue>
        </SettingsRow>
        
        <SettingsRow>
          <Button onClick={() => {
            resetSimulation();
            setShowSettings(false);
          }} style={{ marginRight: '8px' }}>
            Apply & Restart
          </Button>
          <Button onClick={() => setShowSettings(false)}>
            Cancel
          </Button>
        </SettingsRow>
      </Fieldset>
    </SettingsContainer>
  ), [settings, resetSimulation]);

  // Lazy-loaded tab content to improve performance
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Suspense fallback={<LoadingComponent />}>
              <StockSimulation 
              stocks={stocks}
              market={market}
              portfolio={portfolio}
              cash={cash}
              isRunning={isRunning}
              gameOver={gameOver}
              simulationSpeed={simulationSpeed}
              toggleSimulation={toggleSimulation}
              setSpeed={setSpeed}
              advanceSimulation={advanceSimulation}
              advanceToNextDay={advanceToNextDay}
              resetSimulation={resetSimulation}
              onBuy={buyStock}
              onSell={sellStock}
            />
          </Suspense>
        );
      case 1:
        return (
          <Suspense fallback={<LoadingComponent />}>
            <ErrorBoundary fallback={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>There was an error loading the Portfolio tab</h3>
                <p>Please try refreshing the page or selecting a different tab.</p>
                <Button onClick={() => setActiveTab(0)}>Go to Market Tab</Button>
              </div>
            }>
              <PortfolioManager 
                stocks={stocks}
                portfolio={portfolio}
                cash={cash}
                marketDate={market.currentDate}
                marketIndex={market.marketIndex}
                marketIndexHistory={market.marketIndexHistory}
                onSell={sellStock}
              />
            </ErrorBoundary>
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<LoadingComponent />}>
            <InvestmentAdvisor 
              stocks={stocks}
              market={market}
              portfolio={portfolio}
              cash={cash}
            />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<LoadingComponent />}>
            <NewsFeed news={market.news} />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<LoadingComponent />}>
            <SaveLoadManager 
              currentGameState={{
                marketState: market,
                stocks,
                portfolio,
                cash,
                settings,
              }}
              onLoadGame={loadGameState}
            />
          </Suspense>
        );
      default:
        return <div>Tab content not found</div>;
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'teal'
      }}>
        <div style={{ color: 'white', fontFamily: 'MS Sans Serif' }}>Loading...</div>
      </div>
    );
  }
  
  // Show auth screen if not logged in
  if (!user) {
    return <Auth onLogin={(user) => {
      console.log('User logged in:', user);
      // Force a re-render when user logs in
      window.location.reload();
    }} />;
  }
  
  // Show main application if logged in
  return (
    <Desktop>
      <AppContainer>
        <ContentContainer>
          <MainWindow title="DotCom Bubble Portfolio Simulator">
            <TabsContainer>
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
                <Tab value={0}>Market</Tab>
                <Tab value={1}>Portfolio</Tab>
                <Tab value={2}>Advisor</Tab>
                <Tab value={3}>News</Tab>
                <Tab value={4}>Save/Load</Tab>
              </Tabs>
              
              <TabContent>
                {renderTabContent()}
              </TabContent>
            </TabsContainer>
          </MainWindow>
          
          <div style={{ position: 'fixed', bottom: '50px', right: '20px' }}>
            <Button onClick={() => setShowSettings(true)}>Settings</Button>
          </div>
          
          <div style={{ position: 'fixed', bottom: '50px', left: '20px' }}>
            <Button onClick={signOut}>Sign Out</Button>
          </div>
        </ContentContainer>
      </AppContainer>
      
      {showSettings && (
        <Window 
          title="Settings" 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '400px',
            zIndex: 1000,
          }}
          onClose={() => setShowSettings(false)}
        >
          {renderSettings}
        </Window>
      )}
    </Desktop>
  );
};

// Root component with providers
const App: React.FC = () => {
  return (
    <ThemeWrapper>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeWrapper>
  );
};

export default App;
