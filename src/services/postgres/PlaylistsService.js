const { nanoid } = require('nanoid');
const { Pool } = require('pg');

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
}

module.exports = PlaylistsService;
