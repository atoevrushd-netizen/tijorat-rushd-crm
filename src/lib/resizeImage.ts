/**
 * Уменьшить изображение до `max` по большей стороне и перекодировать в WebP.
 * Аватары показываются 36–72px, поэтому 256px WebP хватает с запасом, а вес
 * падает в десятки раз (быстрее грузятся списки на телефоне).
 */
export async function resizeImage(
  file: File,
  max = 256,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d недоступен')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob вернул null'))),
      'image/webp',
      quality,
    )
  })
}
