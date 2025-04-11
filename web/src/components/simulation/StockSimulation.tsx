import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stock } from '../../lib/stockMarketSimulation';
import { Window } from '../ui/Window';
import { StockChart, PortfolioChart } from '../portfolio/Charts';
import { PrimaryButton } from '../ui/UIComponents';
import styled from 'styled-components';
import { NumberInput, Fieldset, Select } from 'react95';

interface SimulationProps {
  stocks: Stock[];
  market: any;
  portfolio: {[key: string]: number};
  cash: number;
  isRunning: boolean;
  gameOver: boolean;
  simulationSpeed: number;
  toggleSimulation: () => void;
  setSpeed: (speed: number) => void;
  advanceSimulation: () => void;
  advanceToNextDay: () => void;
  resetSimulation: () => void;
  onBuy: (stockId: string, shares: number) => void;
  onSell: (stockId: string, shares: number) => void;
}

const SimulationContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px;
  border: 2px solid #c0c0c0;
  background-color: #efefef;
`;

const StatsPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatBox = styled.div`
  padding: 8px;
  border: 2px solid #c0c0c0;
  background-color: #efefef;
  flex: 1;
  margin: 0 4px;
  text-align: center;
`;

const NewsPanel = styled.div`
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
  border: 2px inset #c0c0c0;
  padding: 8px;
`;

const NewsItemContainer = styled.div`
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #c0c0c0;
`;

// Increased height for graph containers
const GraphContainer = styled.div`
  height: 400px; // Increased from default
`;

const StockSimulation: React.FC<SimulationProps> = ({ 
  stocks, 
  market, 
  portfolio, 
  cash, 
  isRunning, 
  gameOver, 
  simulationSpeed, 
  toggleSimulation, 
  setSpeed, 
  advanceSimulation, 
  advanceToNextDay,
  resetSimulation,
  onBuy,
  onSell
}) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState(1);
  
  // Generate simulated time based on date
  const getCurrentTime = useCallback(() => {
    // Create a deterministic but seemingly random time based on the date
    const dateParts = market.currentDate.split('-');
    const day = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]);
    
    // Use the day and month to generate hours and minutes
    const hours = (9 + (day % 8)) % 24; // Market hours between 9 and 16 (9am to 4pm)
    const minutes = ((month * day) % 60); // Minutes between 0 and 59
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [market.currentDate]);

  // Set first stock as selected when stocks are loaded
  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock]);

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [stockId, shares]) => {
      const stock = stocks.find(s => s.id === stockId);
      return total + (stock ? stock.price * shares : 0);
    }, 0);
  };

  // Buy stock
  const buyStock = useCallback(() => {
    if (!selectedStock) return;
    onBuy(selectedStock.id, purchaseAmount);
  }, [selectedStock, purchaseAmount, onBuy]);

  // Sell stock
  const sellStock = useCallback(() => {
    if (!selectedStock) return;
    onSell(selectedStock.id, purchaseAmount);
  }, [selectedStock, purchaseAmount, onSell]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Get bubble stage display name
  const getBubbleStageDisplay = useCallback(() => {
    switch (market.bubbleStage) {
      case 'early': return 'Early Growth';
      case 'growth': return 'Steady Growth';
      case 'mania': return 'Mania Phase';
      case 'peak': return 'Market Peak';
      case 'decline': return 'Decline';
      case 'crash': return 'Market Crash';
      default: return market.bubbleStage;
    }
  }, [market.bubbleStage]);

  // Generate portfolio history data for chart
  const portfolioHistoryData = useMemo(() => {
    // This is a simplified version - in a real implementation, we would track portfolio value over time
    return market.marketIndexHistory.map((point: {date: string, price: number}) => ({
      date: point.date,
      value: point.price / 10, // Just for demonstration
    }));
  }, [market.marketIndexHistory]);

  return (
    <SimulationContainer>
      <ControlPanel>
        <div>
          <PrimaryButton onClick={toggleSimulation} style={{ marginRight: '8px' }}>
            {isRunning ? 'Pause' : 'Start'}
          </PrimaryButton>
          <PrimaryButton onClick={advanceSimulation} disabled={isRunning} style={{ marginRight: '8px' }}>
            Step
          </PrimaryButton>
          <PrimaryButton onClick={advanceToNextDay} disabled={isRunning} style={{ marginRight: '8px' }}>
            Next Day
          </PrimaryButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>Speed:</span>
          <Select
            value={simulationSpeed.toString()}
            onChange={(e) => setSpeed(parseInt(e.value))}
            options={[
              { value: '10000', label: 'Very Slow' },
              { value: '7000', label: 'Slow' },
              { value: '5000', label: 'Normal' },
              { value: '3000', label: 'Fast' },
            ]}
            width={120}
          />
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>Date: {market.currentDate} {getCurrentTime()}</span>
        </div>
      </ControlPanel>

      <StatsPanel>
        <StatBox>
          <div>Cash</div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(cash)}</div>
        </StatBox>
        <StatBox>
          <div>Portfolio Value</div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(calculatePortfolioValue())}</div>
        </StatBox>
        <StatBox>
          <div>Total Assets</div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(cash + calculatePortfolioValue())}</div>
        </StatBox>
        <StatBox>
          <div>Market Stage</div>
          <div style={{ fontWeight: 'bold' }}>{getBubbleStageDisplay()}</div>
        </StatBox>
        <StatBox>
          <div>Market Index</div>
          <div style={{ fontWeight: 'bold' }}>{Math.round(market.marketIndex)}</div>
        </StatBox>
      </StatsPanel>

      <div style={{ padding: '16px', height: '600px', overflow: 'auto' }}>
        <div>
          <Fieldset label="Market Overview">
            <GraphContainer>
              <StockChart 
                data={market.marketIndexHistory.map((point: {date: string, price: number}) => ({
                  date: point.date,
                  price: point.price,
                }))}
                stockName="Market Index"
              />
            </GraphContainer>
          </Fieldset>
          
          <div style={{ display: 'flex', marginTop: '16px' }}>
            <div style={{ width: '30%', marginRight: '16px' }}>
              <Fieldset label="Stocks">
                <div style={{ height: '300px', overflowY: 'auto' }}>
                  {stocks.map(stock => (
                    <div 
                      key={stock.id}
                      onClick={() => setSelectedStock(stock)}
                      style={{ 
                        padding: '8px', 
                        cursor: 'pointer',
                        backgroundColor: selectedStock?.id === stock.id ? '#000080' : 'transparent',
                        color: selectedStock?.id === stock.id ? 'white' : 'black',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{stock.symbol}</div>
                      <div>{stock.name}</div>
                      <div>{formatCurrency(stock.price)}</div>
                    </div>
                  ))}
                </div>
              </Fieldset>
            </div>
            
            <div style={{ width: '70%' }}>
              {selectedStock && (
                <Fieldset label={`${selectedStock.name} (${selectedStock.symbol})`}>
                  <div style={{ marginBottom: '8px' }}>
                    <div><strong>Current Price:</strong> {formatCurrency(selectedStock.price)}</div>
                    <div><strong>Category:</strong> {selectedStock.category}</div>
                    <div><strong>Description:</strong> {selectedStock.description}</div>
                  </div>
                  
                  <GraphContainer>
                    <StockChart 
                      data={selectedStock.priceHistory}
                      stockName={selectedStock.symbol}
                    />
                  </GraphContainer>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>Shares:</span>
                      <NumberInput
                        value={purchaseAmount}
                        onChange={setPurchaseAmount}
                        min={1}
                        max={1000}
                        width={80}
                      />
                    </div>
                    
                    <div>
                      <PrimaryButton onClick={buyStock} style={{ marginRight: '8px' }}>
                        Buy
                      </PrimaryButton>
                      <PrimaryButton onClick={sellStock}>
                        Sell
                      </PrimaryButton>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    <div><strong>You own:</strong> {portfolio[selectedStock.id] || 0} shares</div>
                    <div><strong>Value:</strong> {formatCurrency((portfolio[selectedStock.id] || 0) * selectedStock.price)}</div>
                  </div>
                </Fieldset>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {gameOver && (
        <Window
          title="Game Over"
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            width: '400px',
            height: 'auto'
          }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h2>The Dotcom Bubble Has Burst!</h2>
            <p>The market has crashed and the dotcom bubble has come to an end.</p>
            <p>Your final portfolio value: {formatCurrency(calculatePortfolioValue())}</p>
            <p>Your final cash: {formatCurrency(cash)}</p>
            <p>Total assets: {formatCurrency(cash + calculatePortfolioValue())}</p>
            <PrimaryButton onClick={resetSimulation} style={{ marginTop: '16px' }}>
              Start New Game
            </PrimaryButton>
          </div>
        </Window>
      )}
    </SimulationContainer>
  );
};

export default StockSimulation;
