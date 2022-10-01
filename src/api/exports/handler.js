const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler({ payload, params, auth }, h) {
    this._validator.validateExportPlaylistPayload(payload);
    const { id: credentialId } = auth.credentials; // mendapatkan id yang sudah ter otentikasi
    const { id: playlistId } = params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId: playlistId,
      targetEmail: payload.targetEmail,
    };

    await this._producerService.sendMessage(
      'export:playlist',
      JSON.stringify(message)
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);

    return response;
  }
}
module.exports = ExportsHandler;
