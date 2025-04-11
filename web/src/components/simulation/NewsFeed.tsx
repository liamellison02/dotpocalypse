import React from 'react';
import { NewsItem as NewsItemType } from '../../lib/stockMarketSimulation';
import styled from 'styled-components';
import { ScrollView } from 'react95';

// News Feed Component
interface NewsFeedProps {
  news: NewsItemType[];
}

const NewsContainer = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NewsHeader = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #c0c0c0;
`;

const NewsArticle = styled.div<{ impact: string }>`
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #c0c0c0;
  color: ${props => 
    props.impact === 'positive' 
      ? '#008000' 
      : props.impact === 'negative' 
        ? '#ff0000' 
        : 'inherit'
  };
`;

const NewsHeadline = styled.div`
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
`;

const NewsDate = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const NewsContent = styled.div`
  font-size: 13px;
`;

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <NewsContainer>
      <NewsHeader>DotCom Era News Headlines</NewsHeader>
      <ScrollView style={{ height: '100%' }}>
        {news.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            No news available yet.
          </div>
        ) : (
          news.map((item) => (
            <NewsArticle key={item.id} impact={item.impact}>
              <NewsHeadline>{item.headline}</NewsHeadline>
              <NewsDate>{item.date}</NewsDate>
              <NewsContent>{item.content}</NewsContent>
            </NewsArticle>
          ))
        )}
      </ScrollView>
    </NewsContainer>
  );
};

export default NewsFeed;
