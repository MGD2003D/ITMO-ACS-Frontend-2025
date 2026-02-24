import { http } from './http'

export const interactionsApi = {
  likeRecipe: (recipeId) => http.post('/likes', { recipeId }),
  unlikeRecipe: (likeId) => http.delete(`/likes/${likeId}`),
  getLikesByRecipe: (recipeId) => http.get(`/likes?recipeId=${recipeId}`),

  addToFavorites: (recipeId) => http.post('/favorites', { recipeId }),
  removeFromFavorites: (recipeId) => http.delete(`/favorites?recipeId=${recipeId}`),
  getFavoritesByUser: () => http.get('/favorites/my'),
  getFavoritesByRecipe: (recipeId) => http.get(`/favorites?recipeId=${recipeId}`),

  getCommentsByRecipe: (recipeId) => http.get(`/comments?recipeId=${recipeId}`),
  addComment: (recipeId, text) => http.post('/comments', { recipeId, content: text }),
  deleteComment: (commentId) => http.delete(`/comments/${commentId}`),
}
