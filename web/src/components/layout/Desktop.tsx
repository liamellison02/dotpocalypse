import React from 'react';
import styled from 'styled-components';
import { Toolbar, Button, AppBar, List, ListItem, Separator } from 'react95';

interface DesktopProps {
  children: React.ReactNode;
}

const DesktopContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DesktopContent = styled.div`
  flex: 1;
  position: relative;
  padding: 20px;
  overflow: auto;
`;

const StyledAppBar = styled(AppBar)`
  position: relative;
  bottom: 0;
  top: auto;
`;

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DesktopContainer>
      <DesktopContent>
        {children}
      </DesktopContent>
      
      <StyledAppBar>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button
              onClick={() => setOpen(!open)}
              active={open}
              style={{ fontWeight: 'bold' }}
            >
              <img
                src="/images/windows-logo.png"
                alt="windows logo"
                style={{ height: '20px', marginRight: '5px' }}
              />
              Start
            </Button>
            {open && (
              <List
                style={{
                  position: 'absolute',
                  left: '0',
                  bottom: '100%',
                  width: '200px',
                }}
                onClick={() => setOpen(false)}
              >
                <ListItem>
                  <img 
                    src="/images/chart.png" 
                    alt="portfolio" 
                    style={{ height: '16px', marginRight: '8px' }} 
                  />
                  Portfolio
                </ListItem>
                <ListItem>
                  <img 
                    src="/images/money.png" 
                    alt="stock market" 
                    style={{ height: '16px', marginRight: '8px' }} 
                  />
                  Stock Market
                </ListItem>
                <Separator />
                <ListItem>
                  <img 
                    src="/images/advisor.png" 
                    alt="investment advisor" 
                    style={{ height: '16px', marginRight: '8px' }} 
                  />
                  Investment Advisor
                </ListItem>
                <Separator />
                <ListItem>
                  <img 
                    src="/images/settings.png" 
                    alt="settings" 
                    style={{ height: '16px', marginRight: '8px' }} 
                  />
                  Settings
                </ListItem>
                <Separator />
                <ListItem>
                  <img 
                    src="/images/logout.png" 
                    alt="logout" 
                    style={{ height: '16px', marginRight: '8px' }} 
                  />
                  Log Out
                </ListItem>
              </List>
            )}
          </div>
          <span style={{ fontFamily: 'MS Sans Serif', fontSize: '12px' }}>
            Dotpocalypse | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </Toolbar>
      </StyledAppBar>
    </DesktopContainer>
  );
};

export default Desktop;
