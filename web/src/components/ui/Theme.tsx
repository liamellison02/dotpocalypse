import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body {
    font-family: 'MS Sans Serif', sans-serif;
    background-color: teal;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  * {
    box-sizing: border-box;
  }
  
  #root {
    height: 100%;
    overflow: hidden;
  }
`;

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        {children}
      </ThemeProvider>
    </>
  );
};

export default ThemeWrapper;
