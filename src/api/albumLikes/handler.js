const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumsLikesHandler({ auth, params }, h) {
    const { id: userId } = auth.credentials;
    const { albumsId } = params;

    try {
      // coba hapus, kalo udh ada lakukan unlike
      await this._service.deleteAlbumLike(userId, albumsId);
      const response = h.response({
        status: 'success',
        message: 'Berhasil unlike album',
      });
      response.code(201);

      return response;
    } catch (error) {
      //kalo hapus gagal error notfound lakukan insert
      if (error instanceof NotFoundError) {
        await this._service.addAlbumLike(userId, albumsId);

        const response = h.response({
          status: 'success',
          message: 'Berhasil like album',
        });
        response.code(201);

        return response;
      }
    }
  }

  async getAlbumsLikesHandler({ params }, h) {
    const { albumsId } = params;

    const { count } = await this._service.getAlbumsLikes(albumsId);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(count),
      },
    });

    return response;
  }
}

module.exports = AlbumLikesHandler;
