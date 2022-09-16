const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  requestQuery(request) {
    const query = {};

    if (Object.keys(request.query).length !== 0) {
      const { title, performer } = request.query;
      if (title && performer) {
        query.text =
          'SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE UPPER($1) AND UPPER(performer) LIKE UPPER($2)';
        query.values = ['%' + title + '%', '%' + performer + '%'];
      } else if (title) {
        query.text =
          'SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE UPPER($1)';
        query.values = ['%' + title + '%'];
      } else if (performer) {
        query.text =
          'SELECT id, title, performer FROM songs WHERE UPPER(performer) LIKE UPPER($1)';
        query.values = ['%' + performer + '%'];
      }
    } else {
      query.text = 'SELECT id, title, performer FROM songs';
    }

    return query;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = 'song-' + nanoid(10);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(request) {
    const query = this.requestQuery(request);

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id as "albumId" FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
