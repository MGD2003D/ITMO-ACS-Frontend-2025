import { interactionsApi } from '../api/interactionsApi'

export function useInteractions() {
  async function toggleFavorite(recipeId, currentlyFavorited) {
    if (currentlyFavorited) {
      await interactionsApi.removeFromFavorites(Number(recipeId))
      return false
    } else {
      await interactionsApi.addToFavorites(Number(recipeId))
      return true
    }
  }

  async function checkFavorited(recipeId, userId) {
    try {
      const favorites = await interactionsApi.getFavoritesByRecipe(recipeId)
      return favorites.some(f => f.userId == userId)
    } catch {
      return false
    }
  }

  async function getFavoritesByUser() {
    return await interactionsApi.getFavoritesByUser()
  }

  async function addComment(recipeId, text) {
    return await interactionsApi.addComment(recipeId, text)
  }

  async function deleteComment(commentId) {
    await interactionsApi.deleteComment(commentId)
  }

  async function getComments(recipeId) {
    return await interactionsApi.getCommentsByRecipe(recipeId)
  }

  return { toggleFavorite, checkFavorited, getFavoritesByUser, addComment, deleteComment, getComments }
}
