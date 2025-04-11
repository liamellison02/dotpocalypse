import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Window } from 'react95';

interface StockChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
  stockName: string;
  width?: string;
  height?: string;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 16px;
`;

const StockChart: React.FC<StockChartProps> = ({ data, stockName, width = '100%', height = '300px' }) => {
  return (
    <ChartContainer style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#c0c0c0', 
              border: '2px solid #000000',
              fontFamily: 'MS Sans Serif'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            name={stockName} 
            stroke="#0000ff" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

interface PortfolioChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  width?: string;
  height?: string;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, width = '100%', height = '300px' }) => {
  return (
    <ChartContainer style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#c0c0c0', 
              border: '2px solid #000000',
              fontFamily: 'MS Sans Serif'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Portfolio Value" 
            stroke="#008000" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export { StockChart, PortfolioChart };
