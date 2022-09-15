const Joi = require("joi");

const AlbumPayloadSchema = Joi.object({
  nama: Joi.string().required(),
  year: Joi.number().required(),
});

module.exports = AlbumPayloadSchema;
