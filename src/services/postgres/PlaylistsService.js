const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT id, name, owner as username FROM playlists WHERE owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlist-songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    const idActvy = `playlist-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const queryActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idActvy, playlistId, songId, userId, 'add', time],
    };

    await this._pool.query(queryActivity);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan ke Playlist');
    }

    return result.rows[0].id;
  }

  async getSongsPlaylist(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);

    result.rows[0].songs = songsResult.rows;

    return result.rows[0];
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        'Song gagal dihapus. song tidak ditemukan di playlist'
      );
    }

    const idActvy = `playlist-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const queryActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idActvy, playlistId, songId, userId, 'delete', time],
    };

    await this._pool.query(queryActivity);
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    // const result =
    await this._pool.query(query);

    const queryDeleteActivities = {
      text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    await this._pool.query(queryDeleteActivities);

    // playlist sudah pasti ada, karena sudah di cek saat verifyPlaylistOwner
    // if (!result.rows.length) {
    //   throw new NotFoundError(
    //     'Playlist gagal dihapus. Playlist tidak ditemukan di playlist'
    //   );
    // }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT playlist_song_activities.id, users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities 
      JOIN users ON users.id = playlist_song_activities.user_id
      JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const results = await this._pool.query(query);

    return results.rows;
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async searchSongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
