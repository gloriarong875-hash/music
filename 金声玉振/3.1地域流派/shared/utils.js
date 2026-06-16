export function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function signedRingArea(ring) {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return area + point[0] * next[1] - next[0] * point[1];
  }, 0) / 2;
}

export function normalizePolygonRings(rings) {
  return rings.map((ring, index) => {
    const shouldBeClockwise = index === 0;
    const isClockwise = signedRingArea(ring) < 0;
    return shouldBeClockwise === isClockwise ? ring : [...ring].reverse();
  });
}

export function normalizeFeature(feature) {
  const geometry = feature.geometry;
  if (!geometry) return feature;
  if (geometry.type === 'Polygon') {
    return { ...feature, geometry: { ...geometry, coordinates: normalizePolygonRings(geometry.coordinates) } };
  }
  if (geometry.type === 'MultiPolygon') {
    return { ...feature, geometry: { ...geometry, coordinates: geometry.coordinates.map(normalizePolygonRings) } };
  }
  return feature;
}

