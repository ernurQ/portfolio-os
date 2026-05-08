import { Injectable, signal } from '@angular/core';
import { Player, RoomCode } from '~/applications/tic-tac-toe/types';

interface PlayerSessionStore {
  rooms: Record<RoomCode, { player: Player; isGameFinished: boolean }>;
  version: number;
}

@Injectable()
export class PlayerSessionService {
  private readonly _storageKey = 'tic-tac-toe-player-session';
  private readonly _storageVersion = 1;
  private readonly _localPlayer = signal<Player | null>(null);
  public readonly localPlayer = this._localPlayer.asReadonly();

  constructor() {
    const store = this.parseStorage();
    const newRooms: PlayerSessionStore['rooms'] = Object.entries(
      store.rooms,
    ).reduce(
      (acc, [roomCode, room]) => {
        if (!room.isGameFinished) {
          acc[roomCode] = room;
        }
        return acc;
      },
      {} as PlayerSessionStore['rooms'],
    );

    const newStore: PlayerSessionStore = {
      ...store,
      rooms: newRooms,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(newStore));
  }

  getSession(roomCode: RoomCode): Player | null {
    const store = this.parseStorage();
    const playerSession = store.rooms[roomCode];
    if (!playerSession) return null;
    this._localPlayer.set(playerSession.player);
    return playerSession.player;
  }

  saveSession(roomCode: RoomCode, player: Player): void {
    this._localPlayer.set(player);
    const store = this.parseStorage();
    const newStore: PlayerSessionStore = {
      ...store,
      rooms: {
        ...store.rooms,
        [roomCode]: { player, isGameFinished: false },
      },
    };
    localStorage.setItem(this._storageKey, JSON.stringify(newStore));
  }

  removeSession(roomCode: RoomCode): void {
    const store = this.parseStorage();
    const { [roomCode]: _, ...rooms } = store.rooms;
    const newStore: PlayerSessionStore = {
      ...store,
      rooms,
    };
    localStorage.setItem(this._storageKey, JSON.stringify(newStore));
  }

  finishSession(roomCode: RoomCode) {
    const store = this.parseStorage();
    if (!store.rooms[roomCode]) return;
    const newStore: PlayerSessionStore = {
      ...store,
      rooms: {
        ...store.rooms,
        [roomCode]: {
          ...store.rooms[roomCode],
          isGameFinished: true,
        },
      },
    };
    localStorage.setItem(this._storageKey, JSON.stringify(newStore));
  }

  private parseStorage(): PlayerSessionStore {
    const defaultStorage = {
      rooms: {},
      version: this._storageVersion,
    };

    const item = localStorage.getItem(this._storageKey);
    if (!item) return defaultStorage;

    try {
      return JSON.parse(item) as PlayerSessionStore;
    } catch (e) {
      localStorage.removeItem(this._storageKey);
      return defaultStorage;
    }
  }
}
