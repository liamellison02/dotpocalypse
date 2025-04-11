import supabase from '../lib/supabase';
import { Stock, MarketState, SimulationSettings } from './stockMarketSimulation';

// Interface for saved game data
export interface SavedGame {
  id?: string;
  user_id: string;
  game_name: string;
  created_at?: string;
  updated_at?: string;
  market_state: MarketState;
  stocks: Stock[];
  portfolio: {[key: string]: number};
  cash: number;
  settings: SimulationSettings;
}

// Function to save game progress
export const saveGameProgress = async (
  userId: string,
  gameName: string,
  marketState: MarketState,
  stocks: Stock[],
  portfolio: {[key: string]: number},
  cash: number,
  settings: SimulationSettings
): Promise<string | null> => {
  try {
    const gameData: SavedGame = {
      user_id: userId,
      game_name: gameName,
      market_state: marketState,
      stocks: stocks,
      portfolio: portfolio,
      cash: cash,
      settings: settings,
      updated_at: new Date().toISOString()
    };

    // Check if a save with this name already exists for the user
    const { data: existingSaves } = await supabase
      .from('saved_games')
      .select('id')
      .eq('user_id', userId)
      .eq('game_name', gameName);

    let result;
    
    if (existingSaves && existingSaves.length > 0) {
      // Update existing save
      result = await supabase
        .from('saved_games')
        .update(gameData)
        .eq('id', existingSaves[0].id);
        
      return existingSaves[0].id;
    } else {
      // Create new save
      result = await supabase
        .from('saved_games')
        .insert([gameData]);
        
      return result.data?.[0]?.id || null;
    }
  } catch (error) {
    console.error('Error saving game progress:', error);
    return null;
  }
};

// Function to load saved games for a user
export const loadSavedGames = async (userId: string): Promise<SavedGame[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_games')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error loading saved games:', error);
    return [];
  }
};

// Function to load a specific saved game
export const loadSavedGame = async (gameId: string): Promise<SavedGame | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error loading saved game:', error);
    return null;
  }
};

// Function to delete a saved game
export const deleteSavedGame = async (gameId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_games')
      .delete()
      .eq('id', gameId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting saved game:', error);
    return false;
  }
};
