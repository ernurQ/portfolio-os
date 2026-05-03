import { Component, inject } from '@angular/core';

import { GameService } from '~/applications/tic-tac-toe/services/game-service';
import { PlayerSessionService } from '~/applications/tic-tac-toe/services/player-session-service';
import { Menu } from '~/applications/tic-tac-toe/ui/menu/menu';
import { Board } from '~/applications/tic-tac-toe/ui/board/board';
import { RoomService } from '~/applications/tic-tac-toe/services/room-service';

@Component({
  selector: 'app-tic-tac-toe',
  imports: [Menu, Board],
  providers: [RoomService, PlayerSessionService, GameService],
  template: `<div
    class="flex flex-col items-center justify-center h-full p-4 text-gray-800"
  >
    @if (game()) {
      <app-board />
    } @else {
      <app-menu />
    }
  </div>`,
})
export class TicTacToe {
  private readonly gameService = inject(GameService);

  public readonly game = this.gameService.game;
}
