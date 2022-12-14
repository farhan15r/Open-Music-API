const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class PlaylistSongActivities {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivies(playlistId, songId, userId, action) {
    const id = `playlist-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Activity gagal ditambahkan');
    }
  }

  async deletePlaylistActivities(playlistId) {
    const query = {
      text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    await this._pool.query(query);
  }
}

module.exports = PlaylistSongActivities;
