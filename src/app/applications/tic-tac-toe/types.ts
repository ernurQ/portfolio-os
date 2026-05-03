export type Player = 'X' | 'O';

export type RoomCode = string;

export type Board = Array<string | null>;

export interface Room {
  id: string;
  room_code: RoomCode;
  board: Board;
  current_player: Player;
  winner: Player | 'draw' | null;
  created_at: string;
}

export interface Game {
  roomCode: string;
  isProcessingMove: boolean;
  isMyTurn: boolean;
  isGameOver: boolean;
  winner: Player | 'draw' | null;
}
