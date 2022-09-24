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

  async postPlaylistHandler({ payload, auth }, h) {
    this._validator.validatePlaylistPayload(payload);
    const { name } = payload; // destructuring
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi

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

  async getPlaylistsHandler({ auth }) {
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async postSongToPlaylistIdHandler({ payload, params, auth }, h) {
    this._validator.validateSongPlaylistPayload(payload);

    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const { songId } = payload;

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

  async getSongsPlaylistIdHandler({ params, auth }) {
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = params;

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

  async deleteSongFromPlaylistIdHandler({ payload, params, auth }) {
    this._validator.validateSongPlaylistPayload(payload);

    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const { songId } = payload;

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

  async getPlaylistActivitiesHandler({ params, auth }) {
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = params;

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

  async deletePlaylistIdHandler({ params, auth }) {
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { playlistId } = params;

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
