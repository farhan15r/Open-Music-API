const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumsId) {
    const id = 'like-' + nanoid(10);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumsId],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
        throw new InvariantError('Like album gagal ditambahkan');
      }

      await this._cacheService.delete(`albumLikes:${albumsId}`);
    } catch (error) {
      throw new NotFoundError('albumId tidak ditemukan');
    }
  }

  async deleteAlbumLike(userId, albumsId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumsId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`albumLikes:${albumsId}`);
  }

  async getAlbumsLikes(albumsId) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`albumLikes:${albumsId}`);

      return {
        isCache: true,
        result: JSON.parse(result),
      };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(album_id)
        FROM user_album_likes
        WHERE album_id = $1`,
        values: [albumsId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(
        `albumLikes:${albumsId}`,
        JSON.stringify(result.rows[0])
      );

      return { isCache: false, result: result.rows[0] };
    }
  }
}

module.exports = UserAlbumLikesService;
