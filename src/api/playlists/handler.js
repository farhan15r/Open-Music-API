const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    playlistSongActivitiesService,
    validator
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistSongActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload; // destructuring
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi

    // query database
    const playlistId = await this._playlistsService.addPlaylist({
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
    const playlists = await this._playlistsService.getPlaylists(credentialId);

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

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const { songId } = request.payload;

    const id = await this._playlistSongsService.addSongToPlaylist(
      playlistId,
      songId
    );

    await this._playlistActivitiesService.addPlaylistActivies(
      playlistId,
      songId,
      credentialId,
      'add'
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

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistSongsService.getSongsPlaylist(
      playlistId
    );

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

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const { songId } = request.payload;

    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);

    await this._playlistActivitiesService.addPlaylistActivies(
      playlistId,
      songId,
      credentialId,
      'delete'
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const activities = await this._playlistsService.getPlaylistActivities(
      playlistId
    );

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

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistActivitiesService.deletePlaylistActivities(playlistId);
    await this._playlistsService.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
