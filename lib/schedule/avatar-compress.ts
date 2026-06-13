/**
 * Клиентское сжатие фото перед загрузкой: вписываем в 512px по большей
 * стороне и перекодируем в JPEG. 512px с запасом хватает на самый крупный
 * рендер (оверлей 44px на retina), а файл укладывается в ~100–200 КБ —
 * заведомо меньше лимита тела server action.
 *
 * Только браузер (canvas/createImageBitmap) — не импортировать на сервере.
 */

const AVATAR_MAX_DIMENSION = 512
const AVATAR_JPEG_QUALITY = 0.85

/** Бросает, если файл не декодируется как изображение или canvas недоступен. */
export async function compressAvatarImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas_unavailable')

    // JPEG не умеет альфу — прозрачные PNG/WebP кладём на белый фон
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', AVATAR_JPEG_QUALITY),
    )
    if (!blob) throw new Error('jpeg_encode_failed')
    return blob
  } finally {
    bitmap.close()
  }
}
