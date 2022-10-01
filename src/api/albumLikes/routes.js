const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{albumsId}/likes',
    handler: handler.postAlbumsLikesHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{albumsId}/likes',
    handler: handler.getAlbumsLikesHandler,
  },
];

module.exports = routes;
