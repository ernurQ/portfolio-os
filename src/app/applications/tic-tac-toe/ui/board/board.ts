import { Component, inject } from '@angular/core';
import { GameService } from '~/applications/tic-tac-toe/services/game-service';
import { PlayerSessionService } from '~/applications/tic-tac-toe/services/player-session-service';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
})
export class Board {
  private readonly gameService = inject(GameService);
  private readonly sessionService = inject(PlayerSessionService);

  public readonly game = this.gameService.game;
  public readonly board = this.gameService.board;
  public readonly me = this.sessionService.localPlayer;

  isCellDisabled(cell: string | null): boolean {
    return (
      !!cell ||
      !!this.game()?.winner ||
      !this.game()?.isMyTurn ||
      !!this.game()?.isGameOver
    );
  }

  async onCellClick(index: number) {
    try {
      await this.gameService.makeMove(index);
    } catch (e) {
      console.error('Ошибка при ходе', e);
    }
  }

  onLeaveGame() {
    this.gameService.leaveGame();
  }
}
