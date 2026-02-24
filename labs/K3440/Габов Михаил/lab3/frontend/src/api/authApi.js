import { http } from './http'

export const authApi = {
  register: (username, email, password) => http.post('/users', { username, email, password }),
  login: (email, password) => http.post('/users/login', { email, password }),
  getUserById: (userId) => http.get(`/users/search/by?id=${userId}`),
  updateUser: (userId, data) => http.put(`/users/${userId}`, data),
}
