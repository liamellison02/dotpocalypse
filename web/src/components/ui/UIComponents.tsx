import React from 'react';
import styled from 'styled-components';
import { Button, Hourglass, ProgressBar, Tooltip } from 'react95';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  width: 80px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 255, 0.1);
  }
  
  &:active {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

const IconImage = styled.div`
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconLabel = styled.div`
  font-size: 12px;
  text-align: center;
  color: white;
  text-shadow: 1px 1px 1px black;
`;

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <IconContainer onClick={onClick}>
      <IconImage>
        <span role="img" aria-label={label} style={{ fontSize: '24px' }}>
          {icon}
        </span>
      </IconImage>
      <IconLabel>{label}</IconLabel>
    </IconContainer>
  );
};

// Button variants
const PrimaryButton = styled(Button)`
  margin: 0.5rem;
  min-width: 100px;
`;

const LoadingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Hourglass size={32} style={{ marginRight: '8px' }} />
    <span>Loading...</span>
  </div>
);

const StockProgressBar = ({ value }: { value: number }) => (
  <div style={{ width: '100%', marginBottom: '8px' }}>
    <ProgressBar value={value} />
  </div>
);

export { DesktopIcon, PrimaryButton, LoadingIndicator, StockProgressBar };
