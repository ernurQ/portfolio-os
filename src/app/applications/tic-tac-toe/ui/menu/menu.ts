import { Component, inject, signal } from '@angular/core';

import { GameService } from '~/applications/tic-tac-toe/services/game-service';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
})
export class Menu {
  private readonly gameService = inject(GameService);

  public readonly isConnecting = signal(false);

  async onCreateRoom() {
    this.isConnecting.set(true);
    try {
      await this.gameService.createGame();
    } catch (e) {
      console.error('Не удалось создать комнату', e);
    } finally {
      this.isConnecting.set(false);
    }
  }

  async onJoinRoom(roomCode: string) {
    if (!roomCode.trim()) return;

    this.isConnecting.set(true);
    try {
      await this.gameService.joinGame(roomCode.trim());
    } catch (e) {
      console.error('Не удалось войти в комнату', e);
    } finally {
      this.isConnecting.set(false);
    }
  }
}
