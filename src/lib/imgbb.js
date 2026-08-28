const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload'

/**
 * Завантажує один файл зображення на ImgBB і повертає пряме посилання (URL).
 * @param {File} file
 * @returns {Promise<string>} URL завантаженого зображення
 */
export async function uploadImageToImgBB(file) {
  if (!IMGBB_API_KEY) {
    throw new Error(
      'Відсутній VITE_IMGBB_API_KEY. Додайте ключ у файл .env, щоб завантажувати зображення.'
    )
  }

  const base64 = await fileToBase64(file)

  const formData = new FormData()
  formData.append('key', IMGBB_API_KEY)
  formData.append('image', base64)

  const response = await fetch(IMGBB_ENDPOINT, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Помилка завантаження на ImgBB: ${response.status}`)
  }

  const json = await response.json()
  if (!json.success) {
    throw new Error('ImgBB повернув помилку при завантаженні зображення.')
  }

  return json.data.display_url || json.data.url
}

/**
 * Завантажує декілька файлів послідовно, повертає масив URL.
 * @param {File[]} files
 * @returns {Promise<string[]>}
 */
export async function uploadImagesToImgBB(files) {
  const urls = []
  for (const file of files) {
    const url = await uploadImageToImgBB(file)
    urls.push(url)
  }
  return urls
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Видаляємо префікс data:image/...;base64,
      const result = reader.result
      const base64 = typeof result === 'string' ? result.split(',')[1] : ''
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Не вдалося прочитати файл зображення'))
    reader.readAsDataURL(file)
  })
}
