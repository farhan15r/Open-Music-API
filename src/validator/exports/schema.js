const Joi = require('joi');

const validateExportPlaylistPayload = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = validateExportPlaylistPayload;
