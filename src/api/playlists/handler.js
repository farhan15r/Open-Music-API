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
    this._validator.validateSongPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const { songId } = request.payload;
    await this._service.searchSongById(songId);

    const id = await this._service.addSongToPlaylist(
      playlistId,
      songId,
      credentialId
    );

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

  async getSongsPlaylistIdHandler(request) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const playlist = await this._service.getSongsPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistIdHandler(request) {
    this._validator.validateSongPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const { songId } = request.payload;

    await this._service.deleteSongFromPlaylist(
      playlistId,
      songId,
      credentialId
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId: playlistId,
        activities: activities,
      },
    };
  }

  async deletePlaylistIdHandler(request) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
