export const uploadImage = async (file) => {
  if (!file) return
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', 'voninja_images')
  data.append('cloud_name', 'dkyi55zkr')
  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dkyi55zkr/image/upload',
    {
      method: 'POST',
      body: data,
    }
  )
  const resBody = await res.json()
  return resBody.url
}
