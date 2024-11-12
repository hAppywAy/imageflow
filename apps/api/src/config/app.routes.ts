const authRoot = '/auth';
const galleryRoot = '/gallery';

const v1 = 'v1';

export const routesV1 = {
  version: v1,
  auth: {
    root: authRoot,
    register: `${authRoot}/register`,
    login: `${authRoot}/login`,
    logout: `${authRoot}/logout`,
    me: `${authRoot}/me`,
  },
  gallery: {
    root: galleryRoot,
    uploadImage: `${galleryRoot}/upload`,
    deleteImage: `${galleryRoot}/:imageId`,
    toggleLike: `${galleryRoot}/:imageId/like`,
    getComments: `${galleryRoot}/:imageId/comments`,
    comment: `${galleryRoot}/:imageId/comments`,
    deleteComment: `${galleryRoot}/comments/:commentId`,
  },
};
