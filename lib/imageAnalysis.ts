import { createCanvas, loadImage } from "canvas"

export async function getImageColors(imageUrl: string): Promise<string[]> {
  try {
    const image = await loadImage(imageUrl)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(image, 0, 0, image.width, image.height)

    const imageData = ctx.getImageData(0, 0, image.width, image.height)
    const data = imageData.data

    const colorCounts: { [key: string]: number } = {}

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const hex = rgbToHex(r, g, b)

      if (colorCounts[hex]) {
        colorCounts[hex]++
      } else {
        colorCounts[hex] = 1
      }
    }

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color)

    return sortedColors
  } catch (error) {
    console.error("Error analyzing image:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image: ${error.message}`)
    } else {
      throw new Error("An unexpected error occurred while analyzing the image")
    }
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

