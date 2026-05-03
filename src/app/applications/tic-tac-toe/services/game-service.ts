import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';

import { PlayerSessionService } from './player-session-service';
import { RoomService } from '~/applications/tic-tac-toe/services/room-service';
import { Game, Room, RoomCode } from '~/applications/tic-tac-toe/types';

@Injectable()
export class GameService implements OnDestroy {
  private readonly roomService = inject(RoomService);
  private readonly playerSessionService = inject(PlayerSessionService);

  private readonly _room = signal<Room | null>(null);
  private readonly _isProcessingMove = signal<boolean>(false);

  public readonly board = computed(() => this._room()?.board);
  public readonly game = computed<Game | null>(() => {
    const room = this._room();
    const localPlayer = this.playerSessionService.localPlayer();

    if (!room || !localPlayer) {
      return null;
    }

    return {
      roomCode: room.room_code,
      isProcessingMove: this._isProcessingMove(),
      isMyTurn: room.current_player === localPlayer,
      isGameOver: room.winner !== null,
      winner: room.winner,
    };
  });

  async createGame(): Promise<void> {
    const room = await this.roomService.createRoom();
    this._room.set(room);

    const roomCode = room.room_code;
    this.playerSessionService.saveSession(roomCode, 'X');

    this.listenToRoom(roomCode);
  }

  async joinGame(roomCode: string): Promise<void> {
    const room = await this.roomService.getRoomByCode(roomCode);
    this._room.set(room);

    const localPlayer = this.playerSessionService.getSession(room.room_code);
    if (!localPlayer) {
      this.playerSessionService.saveSession(roomCode, 'O');
    }

    this.listenToRoom(roomCode);
  }

  async makeMove(cellIndex: number): Promise<void> {
    const roomCode = this._room()?.room_code;
    if (!roomCode) {
      console.error('Данные комнаты еще не загружены!');
      return;
    }

    const localPlayer = this.playerSessionService.localPlayer();
    if (!localPlayer) {
      console.error('Локальный игрок не определен!');
      return;
    }

    this._isProcessingMove.set(true);

    await this.roomService.updateRoomBoard(roomCode, {
      cellIndex,
      value: localPlayer,
    });
  }

  private listenToRoom(roomCode: RoomCode) {
    const localPlayer = this.playerSessionService.localPlayer();
    if (!localPlayer) {
      console.error('Локальный игрок не определен!');
      return;
    }

    this.roomService.listenToRoomUpdate(roomCode, (payload) => {
      if (payload.new) {
        this._room.set(payload.new);
        this._isProcessingMove.set(false);
        if (payload.new.winner !== null) {
          this.playerSessionService.finishSession(payload.new.room_code);
        }
      }
    });
  }

  leaveGame(): void {
    const roomCode = this._room()?.room_code;
    if (roomCode) {
      this.playerSessionService.removeSession(roomCode);
      this.roomService.stopListeningToRoom();
    }
    this._room.set(null);
    this._isProcessingMove.set(false);
  }

  ngOnDestroy(): void {
    this.leaveGame();
  }
}
