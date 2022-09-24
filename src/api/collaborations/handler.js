const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler({ payload, auth }, h) {
    this._validator.validateCollaborationPayload(payload);

    const { id: credentialId } = auth.credentials; // mendapatkan id dr auth
    const { playlistId, userId } = payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId); // memferifikasi id owner dengan playlist

    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId
    );

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);

    return response;
  }

  async deleteCollaborationHandler({ payload, auth }) {
    this._validator.validateCollaborationPayload(payload);
    const { id: credentialId } = auth.credentials;
    const { playlistId, userId } = payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
