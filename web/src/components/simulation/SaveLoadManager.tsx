import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Window } from '../ui/Window';
import { PrimaryButton } from '../ui/UIComponents';
import { TextField, Button, Fieldset, ScrollView, Select, Separator } from 'react95';
import { Stock } from '../../lib/stockMarketSimulation';
import { saveGameProgress, loadSavedGames, loadSavedGame, deleteSavedGame, SavedGame } from '../../lib/saveGameService';
import { useAuth } from '../../context/AuthContext';

interface SaveLoadProps {
  currentGameState: {
    marketState: any;
    stocks: Stock[];
    portfolio: {[key: string]: number};
    cash: number;
    settings: any;
  };
  onLoadGame: (gameState: SavedGame) => void;
}

const SaveLoadContainer = styled.div`
  padding: 16px;
`;

const SaveGameForm = styled.div`
  margin-bottom: 16px;
`;

const SavedGamesList = styled.div`
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const SavedGameItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #c0c0c0;
  background-color: #efefef;
`;

const GameInfo = styled.div`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveLoadManager: React.FC<SaveLoadProps> = ({ currentGameState, onLoadGame }) => {
  const { user } = useAuth();
  const [gameName, setGameName] = useState('');
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load saved games when component mounts
  useEffect(() => {
    if (user) {
      loadSavedGamesForUser();
    }
  }, [user]);

  const loadSavedGamesForUser = async () => {
    if (!user) return;
    
    setLoading(true);
    const games = await loadSavedGames(user.id);
    setSavedGames(games);
    setLoading(false);
  };

  const handleSaveGame = async () => {
    if (!user || !gameName.trim()) return;
    
    setLoading(true);
    setMessage('');
    
    const saveId = await saveGameProgress(
      user.id,
      gameName,
      currentGameState.marketState,
      currentGameState.stocks,
      currentGameState.portfolio,
      currentGameState.cash,
      currentGameState.settings
    );
    
    if (saveId) {
      setMessage(`Game saved successfully as "${gameName}"`);
      loadSavedGamesForUser();
    } else {
      setMessage('Error saving game. Please try again.');
    }
    
    setLoading(false);
  };

  const handleLoadGame = async (gameId: string) => {
    setLoading(true);
    setMessage('');
    
    const game = await loadSavedGame(gameId);
    
    if (game) {
      onLoadGame(game);
      setMessage(`Game "${game.game_name}" loaded successfully`);
    } else {
      setMessage('Error loading game. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDeleteGame = async (gameId: string, gameName: string) => {
    if (window.confirm(`Are you sure you want to delete the saved game "${gameName}"?`)) {
      setLoading(true);
      setMessage('');
      
      const success = await deleteSavedGame(gameId);
      
      if (success) {
        setMessage(`Game "${gameName}" deleted successfully`);
        loadSavedGamesForUser();
      } else {
        setMessage('Error deleting game. Please try again.');
      }
      
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SaveLoadContainer>
      <Fieldset label="Save Current Game">
        <SaveGameForm>
          <div style={{ marginBottom: '8px' }}>
            <TextField
              placeholder="Enter a name for your save"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              fullWidth
            />
          </div>
          <PrimaryButton onClick={handleSaveGame} disabled={loading || !gameName.trim()}>
            Save Game
          </PrimaryButton>
        </SaveGameForm>
      </Fieldset>
      
      <Fieldset label="Saved Games">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>Loading...</div>
        ) : savedGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>No saved games found</div>
        ) : (
          <SavedGamesList>
            {savedGames.map((game) => (
              <SavedGameItem key={game.id}>
                <GameInfo>
                  <div style={{ fontWeight: 'bold' }}>{game.game_name}</div>
                  <div style={{ fontSize: '12px' }}>
                    Last saved: {formatDate(game.updated_at || '')}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Market date: {game.market_state.currentDate}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Cash: ${game.cash.toFixed(2)}
                  </div>
                </GameInfo>
                <ButtonGroup>
                  <Button onClick={() => handleLoadGame(game.id || '')}>Load</Button>
                  <Button onClick={() => handleDeleteGame(game.id || '', game.game_name)}>Delete</Button>
                </ButtonGroup>
              </SavedGameItem>
            ))}
          </SavedGamesList>
        )}
      </Fieldset>
      
      {message && (
        <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#efefef', border: '1px solid #c0c0c0' }}>
          {message}
        </div>
      )}
    </SaveLoadContainer>
  );
};

export default SaveLoadManager;
