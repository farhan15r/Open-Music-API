const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload; // destructuring
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi

    // query database
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async postSongToPlaylistIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const { songId } = request.payload;
    const id = await this._service.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke Playlist',
      data: {
        id,
      },
    });
    response.code(201);

    return response;
  }
}

module.exports = PlaylistsHandler;
