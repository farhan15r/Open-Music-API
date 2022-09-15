class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { title, year, performer, genre, duration, albumId } =
        request.payload;

      const songId = await this._service.addSong({
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
      });

      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan",
        data: {
          songId,
        },
      });
      response.code(201);

      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
  }
}

module.exports = SongsHandler;
