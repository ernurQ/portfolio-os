import { Injectable, OnDestroy } from '@angular/core';
import {
  createClient,
  RealtimeChannel,
  RealtimePostgresUpdatePayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import { Player, Room, RoomCode } from '~/applications/tic-tac-toe/types';
import { environment } from '~/environments/environment';

@Injectable()
export class RoomService implements OnDestroy {
  private supabase: SupabaseClient;
  private activeChannel: RealtimeChannel | null = null;

  constructor() {
    const instanceId = crypto.randomUUID();
    this.supabase = createClient(
      environment.ticTacToe.supabaseUrl,
      environment.ticTacToe.supabaseKey,
      {
        auth: {
          storageKey: `sb-tic-tac-toe-auth-${instanceId}`,
          persistSession: false,
        },
      },
    );
  }

  public async createRoom(): Promise<Room> {
    await this.ensureAnonymousSession();
    const { data, error } = await this.supabase
      .from('rooms')
      .insert([{}])
      .select()
      .single<Room>();
    if (error || !data) {
      throw error;
    }
    await this.login(data.room_code);

    return data;
  }

  public async getRoomByCode(roomCode: RoomCode): Promise<Room> {
    await this.ensureAnonymousSession();
    await this.login(roomCode);
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single<Room>();

    if (error || !data) {
      throw error;
    }

    return data;
  }

  public async updateRoomBoard(
    roomCode: RoomCode,
    data: { cellIndex: number; value: Player },
  ): Promise<void> {
    const { error } = await this.supabase.rpc('make_move', {
      p_room_code: roomCode,
      p_cell_index: data.cellIndex,
      p_player: data.value,
    });
    if (error) {
      throw error;
    }
  }

  public listenToRoomUpdate(
    roomCode: RoomCode,
    cb: (v: RealtimePostgresUpdatePayload<Room>) => void,
  ): void {
    this.stopListeningToRoom();
    this.activeChannel = this.supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${roomCode}`,
        },
        cb,
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.stopListeningToRoom();
  }

  public stopListeningToRoom() {
    if (this.activeChannel) {
      void this.supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
    }
  }

  private async login(roomCode: RoomCode) {
    await this.supabase.auth.updateUser({
      data: { room_code: roomCode },
    });
    await this.supabase.auth.refreshSession();
  }

  private async ensureAnonymousSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      const { error } = await this.supabase.auth.signInAnonymously();
      if (error) {
        console.error('Ошибка анонимного входа:', error.message);
        throw error;
      }
    }
  }
}
