export const uploadImage = async (file) => {
  if (!file) return
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET)
  data.append('cloud_name', import.meta.env.VITE_CLOUD_NAME)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: data,
    }
  )
  const resBody = await res.json()
  return resBody.url
}
