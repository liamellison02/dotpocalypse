import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Window } from '../ui/Window';
import { PrimaryButton } from '../ui/UIComponents';
import { TextField, Button, Fieldset, ScrollView, Select, Separator, Table, TableBody, TableHead, TableRow, TableHeadCell, TableDataCell } from 'react95';
import { Stock, PricePoint } from '../../lib/stockMarketSimulation';
import { PortfolioChart } from '../portfolio/Charts';

interface PortfolioManagerProps {
  stocks: Stock[];
  portfolio: {[key: string]: number};
  cash: number;
  marketDate: string;
  marketIndex: number;
  marketIndexHistory: PricePoint[];
  onSell: (stockId: string, shares: number) => void;
}

const PortfolioContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow: auto;
`;

const PortfolioSummary = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SummaryCard = styled.div`
  flex: 1;
  margin: 0 8px;
  padding: 16px;
  background-color: #efefef;
  border: 2px solid #c0c0c0;
  text-align: center;
`;

const PortfolioValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
`;

const PerformanceIndicator = styled.div<{ isPositive: boolean }>`
  color: ${props => props.isPositive ? 'green' : 'red'};
  font-weight: bold;
  margin-top: 4px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 8px 0;
`;

const NoStocksMessage = styled.div`
  text-align: center;
  padding: 32px;
  background-color: #efefef;
  border: 2px solid #c0c0c0;
`;

const StockActionCell = styled.div`
  display: flex;
  align-items: center;
`;

const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  stocks,
  portfolio,
  cash,
  marketDate,
  marketIndex,
  marketIndexHistory,
  onSell
}) => {
  const [portfolioHistory, setPortfolioHistory] = useState<Array<{date: string, value: number}>>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [sharesToSell, setSharesToSell] = useState<number>(1);
  
  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [stockId, shares]) => {
      const stock = stocks.find(s => s.id === stockId);
      return total + (stock ? stock.price * shares : 0);
    }, 0);
  };
  
  const portfolioValue = calculatePortfolioValue();
  const totalAssets = cash + portfolioValue;
  
  useEffect(() => {
    const history = marketIndexHistory.map(point => ({
      date: point.date,
      value: point.price / 10 * (0.8 + Math.random() * 0.4),
    }));
    
    setPortfolioHistory(history);
  }, [marketIndexHistory]);
  
  const calculatePerformance = () => {
    if (portfolioHistory.length < 2) return { daily: 0, overall: 0 };
    
    const latest = portfolioHistory[portfolioHistory.length - 1].value;
    const previous = portfolioHistory[portfolioHistory.length - 2].value;
    const first = portfolioHistory[0].value;
    
    const daily = ((latest - previous) / previous) * 100;
    const overall = ((latest - first) / first) * 100;
    
    return { daily, overall };
  };
  
  const performance = calculatePerformance();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Get portfolio stocks
  const portfolioStocks = Object.entries(portfolio).map(([stockId, shares]) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return null;
    
    const value = stock.price * shares;
    const costBasis = stock.initialPrice * shares;
    const profit = value - costBasis;
    const profitPercentage = (profit / costBasis) * 100;
    
    return {
      id: stockId,
      stock,
      shares,
      value,
      costBasis,
      profit,
      profitPercentage,
    };
  }).filter(Boolean) as Array<{
    id: string;
    stock: Stock;
    shares: number;
    value: number;
    costBasis: number;
    profit: number;
    profitPercentage: number;
  }>;
  
  portfolioStocks.sort((a, b) => b.value - a.value);
  
  // Calculate sector allocation
  const sectorAllocation = portfolioStocks.reduce((acc, item) => {
    const sector = item.stock.category;
    if (!acc[sector]) acc[sector] = 0;
    acc[sector] += item.value;
    return acc;
  }, {} as {[key: string]: number});
  
  const sectorAllocationPercentage = Object.entries(sectorAllocation).map(([sector, value]) => ({
    sector,
    value,
    percentage: (value / portfolioValue) * 100,
  }));
  
  sectorAllocationPercentage.sort((a, b) => b.percentage - a.percentage);
  
  // Handle selling stocks
  const handleSell = () => {
    if (!selectedStock || sharesToSell <= 0) return;
    
    const maxShares = portfolio[selectedStock] || 0;
    const sharesToSellCapped = Math.min(sharesToSell, maxShares);
    
    onSell(selectedStock, sharesToSellCapped);
    setSelectedStock(null);
    setSharesToSell(1);
  };
  
  return (
    <PortfolioContainer>
      <Fieldset label="Portfolio Summary">
        <PortfolioSummary>
          <SummaryCard>
            <div>Cash</div>
            <PortfolioValue>{formatCurrency(cash)}</PortfolioValue>
          </SummaryCard>
          <SummaryCard>
            <div>Portfolio Value</div>
            <PortfolioValue>{formatCurrency(portfolioValue)}</PortfolioValue>
            <PerformanceIndicator isPositive={performance.daily >= 0}>
              {formatPercentage(performance.daily)} today
            </PerformanceIndicator>
          </SummaryCard>
          <SummaryCard>
            <div>Total Assets</div>
            <PortfolioValue>{formatCurrency(totalAssets)}</PortfolioValue>
            <PerformanceIndicator isPositive={performance.overall >= 0}>
              {formatPercentage(performance.overall)} overall
            </PerformanceIndicator>
          </SummaryCard>
        </PortfolioSummary>
      </Fieldset>
      
      <Fieldset label="Portfolio Performance">
        <PortfolioChart data={portfolioHistory} />
      </Fieldset>
      
      <SectionTitle>Holdings</SectionTitle>
      
      {portfolioStocks.length === 0 ? (
        <NoStocksMessage>
          You don't own any stocks yet. Go to the Market tab to start investing!
        </NoStocksMessage>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Stock</TableHeadCell>
              <TableHeadCell>Shares</TableHeadCell>
              <TableHeadCell>Price</TableHeadCell>
              <TableHeadCell>Value</TableHeadCell>
              <TableHeadCell>Profit/Loss</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolioStocks.map((item) => (
              <TableRow key={item.id}>
                <TableDataCell>
                  <div style={{ fontWeight: 'bold' }}>{item.stock.symbol}</div>
                  <div style={{ fontSize: '12px' }}>{item.stock.name}</div>
                </TableDataCell>
                <TableDataCell>{item.shares}</TableDataCell>
                <TableDataCell>{formatCurrency(item.stock.price)}</TableDataCell>
                <TableDataCell>{formatCurrency(item.value)}</TableDataCell>
                <TableDataCell>
                  <div style={{ color: item.profit >= 0 ? 'green' : 'red' }}>
                    {formatCurrency(item.profit)}
                  </div>
                  <div style={{ fontSize: '12px', color: item.profit >= 0 ? 'green' : 'red' }}>
                    {formatPercentage(item.profitPercentage)}
                  </div>
                </TableDataCell>
                <TableDataCell>
                  <StockActionCell>
                    {selectedStock === item.id ? (
                      <>
                        <TextField
                          type="number"
                          value={sharesToSell}
                          onChange={(e) => setSharesToSell(parseInt(e.target.value) || 1)}
                          min={1}
                          max={item.shares}
                          style={{ width: '60px', marginRight: '8px' }}
                        />
                        <Button onClick={handleSell} style={{ marginRight: '4px' }}>
                          Sell
                        </Button>
                        <Button onClick={() => setSelectedStock(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setSelectedStock(item.id)}>
                        Sell
                      </Button>
                    )}
                  </StockActionCell>
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <SectionTitle>Sector Allocation</SectionTitle>
      
      {portfolioStocks.length === 0 ? (
        <NoStocksMessage>
          No sector allocation data available.
        </NoStocksMessage>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Sector</TableHeadCell>
              <TableHeadCell>Value</TableHeadCell>
              <TableHeadCell>Allocation</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectorAllocationPercentage.map((item) => (
              <TableRow key={item.sector}>
                <TableDataCell>{item.sector}</TableDataCell>
                <TableDataCell>{formatCurrency(item.value)}</TableDataCell>
                <TableDataCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '10px', backgroundColor: '#efefef', border: '1px solid #c0c0c0', marginRight: '8px' }}>
                      <div
                        style={{
                          width: `${Math.min(100, item.percentage)}%`,
                          height: '100%',
                          backgroundColor: '#000080',
                        }}
                      />
                    </div>
                    <div>{item.percentage.toFixed(1)}%</div>
                  </div>
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PortfolioContainer>
  );
};

export default PortfolioManager;
