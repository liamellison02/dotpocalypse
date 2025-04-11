import React from 'react';
import styled from 'styled-components';
import { Window as Win95Window, WindowHeader, WindowContent, Button } from 'react95';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClose?: () => void;
  width?: string;
  height?: string;
}

const StyledWindow = styled(Win95Window)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledWindowHeader = styled(WindowHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledWindowContent = styled(WindowContent)`
  flex: 1;
  padding: 10px;
  overflow: auto;
`;

export const Window: React.FC<WindowProps> = ({ title, children, style, onClose }) => {
  return (
    <StyledWindow style={style}>
      <StyledWindowHeader>
        <span>{title}</span>
        {onClose && (
          <Button onClick={onClose} size="sm">
            <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>×</span>
          </Button>
        )}
      </StyledWindowHeader>
      <StyledWindowContent>{children}</StyledWindowContent>
    </StyledWindow>
  );
};

export default Window;
