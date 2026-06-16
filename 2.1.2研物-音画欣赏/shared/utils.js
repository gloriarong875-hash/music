export function loadImage(url, label = '图片') {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`${label}加载失败`));
    image.src = url;
  });
}

export function averageRange(data, startRatio, endRatio) {
  if (!data?.length) return 0;
  const start = Math.max(0, Math.floor(data.length * startRatio));
  const end = Math.min(data.length, Math.ceil(data.length * endRatio));
  let total = 0;
  for (let index = start; index < end; index += 1) total += data[index];
  return total / Math.max(1, end - start) / 255;
}

export function smoothstep(min, max, value) {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return normalized * normalized * (3 - 2 * normalized);
}

