import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45_000,
})

// ── Response interceptor: unwrap errors nicely ──
api.interceptors.response.use(
  res  => res,
  err  => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Unknown error'
    return Promise.reject(new Error(msg))
  }
)

export const fetchPlaylist = async (url) => {
  const { data } = await api.post('/playlist/fetch', { url })
  return data            // { success, playlist }
}

export const getVideoInfo = async (videoId) => {
  const { data } = await api.get('/download/info', { params: { videoId } })
  return data            // { success, title, formats, engine }
}

/**
 * Build a direct download URL for a YouTube video.
 */
export const buildDownloadUrl = (videoId, quality, title = '') => {
  const base = import.meta.env.VITE_API_URL || '/api'
  const params = new URLSearchParams({ videoId, quality, title })
  return `${base}/download/video?${params}`
}

/* ── Social Media ── */
export const getSocialInfo = async (url) => {
  const { data } = await api.get('/social/info', { params: { url } })
  return data
}

export const buildSocialDownloadUrl = (url, quality, title = '', platform = '') => {
  const base = import.meta.env.VITE_API_URL || '/api'
  const params = new URLSearchParams({ url, quality, title, platform })
  return `${base}/social/download?${params}`
}

/* ── Audio / MP3 ── */
export const getAudioInfo = async (videoId) => {
  const { data } = await api.get('/audio/info', { params: { videoId } })
  return data
}

export const getPlaylistAudioInfo = async (url) => {
  const { data } = await api.get('/audio/playlist-info', { params: { url } })
  return data
}

export const buildAudioDownloadUrl = (videoId, title = '', quality = '320') => {
  const base = import.meta.env.VITE_API_URL || '/api'
  const params = new URLSearchParams({ videoId, title, quality })
  return `${base}/audio/download?${params}`
}

export default api
