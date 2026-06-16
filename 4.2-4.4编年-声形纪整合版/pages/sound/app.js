import { geoMercator, geoPath } from 'd3-geo'
import { gsap } from 'gsap'
import chinaMap from '../../public/map/china.geojson'

const chronicle = [
  {
    era: '清代以来', period: '约二百年村社传承', title: '冀中笙管乐', location: '河北中部平原',
    story: '冀中笙管乐流传于河北中部平原，以管子领奏、笙等乐器合奏，民间俗称“音乐会”。它常用于祭祀、礼仪、丧葬等村社活动，具有浓厚的民间礼俗色彩，是以村落为单位世代传承的区域性笙管乐系统。',
    track: '《放驴》', audio: '../../public/audio/sheng/fang-lv.mp3', mapLabel: '河北省 · 冀中平原', provinceAdcode: 130000, center: [115.3, 38.3], zoom: 1.82,
  },
  {
    era: '唐宋源流', period: '明清保存完整', title: '西安鼓乐系统', location: '陕西西安及周边',
    story: '西安鼓乐流传于古长安及周边地区，依托寺庙、道观和民间乐社传承。它以笙、管、笛和打击乐组成大型合奏，保留了古代燕乐、教坊大曲等音乐遗响，风格庄重宏大，历史纵深感强。',
    track: '代表曲目待补充', mapLabel: '陕西省 · 西安市', provinceAdcode: 610000, center: [108.94, 34.34], zoom: 1.9,
  },
  {
    era: '1950年代', period: '独奏艺术形成', title: '晋派 / 山西胡派笙', location: '山西忻州、太原一带',
    story: '晋派笙以胡天泉等山西笙家为代表，吸收山西梆子、晋剧和北方鼓吹乐风格。1950年代后，笙逐渐从合奏、伴奏中走向独奏舞台，《凤凰展翅》成为现代笙独奏艺术的重要标志。',
    track: '《凤凰展翅》', audio: '../../public/audio/sheng/feng-huang-zhan-chi.mp3', mapLabel: '山西省 · 太原 / 忻州', provinceAdcode: 140000, center: [112.55, 38.4], zoom: 1.94,
  },
  {
    era: '1980年代', period: '现代教学体系', title: '山东牟派笙', location: '山东，后与上海教学体系联系密切',
    story: '山东牟派以牟善平为代表，融合山东民间音乐气质与现代笙演奏技巧。它强调气息控制、手指灵活和复调表现，并与37簧加键笙的发展密切相关，是现代笙教学和演奏体系中的重要流派。',
    track: '《微山湖船歌》', audio: '../../public/audio/sheng/wei-shan-hu-chuan-ge.mp3', mapLabel: '山东省', provinceAdcode: 370000, center: [118.0, 36.4], zoom: 1.84,
  },
  {
    era: '当代', period: '37簧加键体系', title: '现代加键笙 / 上音37簧体系', location: '上海，辐射全国及海外华乐圈',
    story: '现代加键笙体系以37簧加键笙为核心，扩展了传统笙的音域、半音和转调能力。它使笙从传统合奏乐器发展为可独奏、重奏、协奏和跨界创作的现代乐器，代表笙艺术的当代转型方向。',
    track: '代表曲目待补充', mapLabel: '上海市', provinceAdcode: 310000, center: [121.47, 31.23], zoom: 2.02,
  },
]

const eraPositions = [[47, 10], [31, 29], [51, 48], [34, 68], [49, 88]]
const mapSize = { width: 1000, height: 620 }
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const elements = {
  workspace: document.querySelector('.workspace'), eraList: document.querySelector('#eraList'),
  progress: document.querySelector('.rail-progress'), mapViewport: document.querySelector('#mapViewport'),
  baseLayer: document.querySelector('#baseMapLayer'), highlightLayer: document.querySelector('#highlightLayer'),
  routeGuide: document.querySelector('#routeGuide'), route: document.querySelector('#routePath'), routeArrow: document.querySelector('#routeArrow'),
  point: document.querySelector('#mapPoint'), halo: document.querySelector('#mapHalo'),
  label: document.querySelector('#placeLabel'), loading: document.querySelector('#mapLoading'), card: document.querySelector('#archiveCard'),
  cardTitle: document.querySelector('#cardTitle'), cardLocation: document.querySelector('#cardLocation'),
  cardStory: document.querySelector('#cardStory'), trackTitle: document.querySelector('#trackTitle'),
  trackButton: document.querySelector('#trackButton'), stageKicker: document.querySelector('#stageKicker'),
  audioProgress: document.querySelector('#audioProgress'), audioSeek: document.querySelector('#audioSeek'),
  audioCurrent: document.querySelector('#audioCurrent'), audioDuration: document.querySelector('#audioDuration'),
  stageTitle: document.querySelector('#stageTitle'), stageNumber: document.querySelector('#stageNumber'),
  stagePeriod: document.querySelector('#stagePeriod'),
}

let activeIndex = 0
let currentView = 'chronicle'
let features = []
let projection
let pathGenerator
let cameraTimeline
let cameraPoint = [500, 310]
let cameraZoom = 1
const trackAudio = new Audio()
trackAudio.preload = 'metadata'
let isSeeking = false
let loadedAudioPath = ''

function resolveAudioUrl(path) {
  return new URL(path, window.location.href).href
}

const pageOrder = ['sound', 'painting', 'chronicle']

function updateRailPageSwitcher(page = 'sound', emit = false) {
  document.querySelectorAll('.rail-switch-item').forEach(button => {
    const itemIndex = pageOrder.indexOf(button.dataset.page)
    const isActive = button.dataset.page === page
    button.style.setProperty('--switch-x', `${(itemIndex - 1) * 47}px`)
    button.classList.toggle('is-active', isActive)
    button.setAttribute('aria-current', isActive ? 'page' : 'false')
    button.tabIndex = isActive ? 0 : -1
  })
  if (emit) {
    document.querySelector('#railPageSwitcher')?.dispatchEvent(new CustomEvent('pagechange', {
      bubbles: true,
      detail: { page },
    }))
  }
}

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function updateSeekAppearance(value) {
  elements.audioSeek.style.setProperty('--seek-progress', `${value}%`)
}

function resetAudioProgress(hide = true) {
  elements.audioSeek.value = 0
  elements.audioCurrent.textContent = '00:00'
  elements.audioDuration.textContent = '00:00'
  updateSeekAppearance(0)
  if (hide) {
    elements.audioProgress.classList.remove('is-visible')
    elements.audioProgress.setAttribute('aria-hidden', 'true')
  }
}

function showAudioProgress() {
  elements.audioProgress.classList.add('is-visible')
  elements.audioProgress.setAttribute('aria-hidden', 'false')
}

function signedRingArea(ring) {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length]
    return area + point[0] * next[1] - next[0] * point[1]
  }, 0) / 2
}

function normalizePolygonRings(rings) {
  return rings.map((ring, index) => {
    const shouldBeClockwise = index === 0
    const isClockwise = signedRingArea(ring) < 0
    return shouldBeClockwise === isClockwise ? ring : [...ring].reverse()
  })
}

function normalizeFeature(feature) {
  const geometry = feature.geometry
  if (!geometry) return feature
  if (geometry.type === 'Polygon') {
    return { ...feature, geometry: { ...geometry, coordinates: normalizePolygonRings(geometry.coordinates) } }
  }
  if (geometry.type === 'MultiPolygon') {
    return { ...feature, geometry: { ...geometry, coordinates: geometry.coordinates.map(normalizePolygonRings) } }
  }
  return feature
}

function featureParent(feature) {
  return Number(feature.properties?.parent?.adcode)
}

function getBaseFeatures(allFeatures) {
  return allFeatures.filter(feature => feature.properties?.level === 'province')
}

function getSelectedFeatures(item) {
  return features.filter(feature => Number(feature.properties?.adcode) === item.provinceAdcode)
}

function createSvgPath(className, feature) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  node.setAttribute('class', className)
  node.setAttribute('d', pathGenerator(feature) || '')
  node.dataset.name = feature.properties?.name || ''
  return node
}

function renderMap(data) {
  features = data.features.map(normalizeFeature)
  const baseFeatures = getBaseFeatures(features)
  const collection = { type: 'FeatureCollection', features: baseFeatures }
  projection = geoMercator().fitExtent([[62, 48], [938, 572]], collection)
  pathGenerator = geoPath(projection)

  const fragment = document.createDocumentFragment()
  baseFeatures.forEach(feature => fragment.append(createSvgPath('map-area', feature)))
  elements.baseLayer.replaceChildren(fragment)
  elements.loading.classList.add('is-hidden')
  selectEra(activeIndex, false)
  if (!reduceMotion) gsap.from('#baseMapLayer .map-area', { opacity: 0, duration: 1.1, stagger: 0.002, ease: 'power3.out' })
}

function renderHighlights(item) {
  const selected = getSelectedFeatures(item)
  const fragment = document.createDocumentFragment()
  selected.forEach(feature => fragment.append(createSvgPath('selected-area', feature)))
  elements.highlightLayer.replaceChildren(fragment)
  if (!reduceMotion) gsap.fromTo('#highlightLayer .selected-area', { opacity: 0, scale: 0.985, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: .75, stagger: .035, ease: 'power3.out' })
}

function projectedPoint(item) {
  return projection ? projection(item.center) : [500, 310]
}

function makeRoute(from, to) {
  const midX = (from[0] + to[0]) / 2
  const lift = Math.max(34, Math.abs(to[0] - from[0]) * .2)
  return `M ${from[0]} ${from[1]} Q ${midX} ${Math.min(from[1], to[1]) - lift} ${to[0]} ${to[1]}`
}

function cameraTransform(point, zoom) {
  return `translate(${mapSize.width / 2} ${mapSize.height / 2}) scale(${zoom}) translate(${-point[0]} ${-point[1]})`
}

function toScreenPoint(point, cameraCenter, zoom) {
  return [
    mapSize.width / 2 + (point[0] - cameraCenter[0]) * zoom,
    mapSize.height / 2 + (point[1] - cameraCenter[1]) * zoom,
  ]
}

function positionLabel(point, zoom, cameraCenter = point) {
  const [x, y] = toScreenPoint(point, cameraCenter, zoom)
  elements.label.style.left = `${x / mapSize.width * 100}%`
  elements.label.style.top = `${y / mapSize.height * 100}%`
}

function prepareRoute(from, to) {
  elements.routeGuide.setAttribute('d', makeRoute(from, to))
  return Math.max(1, elements.routeGuide.getTotalLength())
}

function updateScreenRoute(guideLength, cameraCenter, zoom, progress = 1) {
  const sampleCount = 72
  const points = []
  for (let index = 0; index <= sampleCount; index += 1) {
    const guidePoint = elements.routeGuide.getPointAtLength(guideLength * index / sampleCount)
    points.push(toScreenPoint([guidePoint.x, guidePoint.y], cameraCenter, zoom))
  }
  elements.route.setAttribute('d', points.map((point, index) => `${index ? 'L' : 'M'} ${point[0]} ${point[1]}`).join(' '))
  const screenLength = Math.max(1, elements.route.getTotalLength())
  const visibleLength = screenLength * progress
  elements.route.style.strokeDasharray = `${screenLength}`
  elements.route.style.strokeDashoffset = `${screenLength - visibleLength}`

  const arrowPoint = elements.route.getPointAtLength(visibleLength)
  const tangentPoint = elements.route.getPointAtLength(Math.max(0, visibleLength - 2))
  const angle = Math.atan2(arrowPoint.y - tangentPoint.y, arrowPoint.x - tangentPoint.x) * 180 / Math.PI
  elements.routeArrow.setAttribute('transform', `translate(${arrowPoint.x} ${arrowPoint.y}) rotate(${angle})`)
  elements.routeArrow.style.opacity = progress > .015 ? '1' : '0'
}

function setCamera(point, zoom) {
  cameraPoint = [point[0], point[1]]
  cameraZoom = zoom
  elements.mapViewport.setAttribute('transform', cameraTransform(point, zoom))
}

function setMapAtTarget(item) {
  const point = projectedPoint(item)
  const zoom = item.zoom || 1.5
  setCamera(point, zoom)
  gsap.set([elements.point, elements.halo], { attr: { cx: point[0], cy: point[1] } })
  elements.label.textContent = item.mapLabel
  positionLabel(point, zoom, point)
  gsap.set(elements.label, { autoAlpha: 1 })
}

function animateCameraTracking(from, item) {
  const to = projectedPoint(item)
  const targetZoom = item.zoom || 1.5
  const travelZoom = Math.min(1.04, cameraZoom * .72, targetZoom * .68)
  const guideLength = prepareRoute(from, to)
  const tracker = { progress: 0 }

  cameraTimeline?.kill()
  gsap.killTweensOf([elements.mapViewport, elements.route, elements.routeArrow, elements.point, elements.halo, elements.label, elements.card])
  updateScreenRoute(guideLength, from, travelZoom, 0)
  gsap.set([elements.route, elements.routeArrow], { opacity: 0 })
  gsap.set(elements.label, { autoAlpha: 0 })

  cameraTimeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      cameraPoint = to
      cameraZoom = targetZoom
    },
  })
  cameraTimeline
    .to(elements.card, { autoAlpha: 0, x: 44, scale: .96, duration: .28 }, 0)
    .to(elements.highlightLayer, { opacity: .12, duration: .32 }, 0)
    .call(() => fillChronicleCard(item), [], .3)
    .to(elements.mapViewport, { attr: { transform: cameraTransform(from, travelZoom) }, duration: .58 }, 0)
    .set(elements.route, { opacity: .94 }, .42)
    .to(tracker, {
      progress: 1,
      duration: 1.75,
      ease: 'power1.inOut',
      onUpdate: () => {
        const routePoint = elements.routeGuide.getPointAtLength(guideLength * tracker.progress)
        const trackedPoint = [routePoint.x, routePoint.y]
        cameraPoint = trackedPoint
        cameraZoom = travelZoom
        elements.mapViewport.setAttribute('transform', cameraTransform(trackedPoint, travelZoom))
        updateScreenRoute(guideLength, trackedPoint, travelZoom, tracker.progress)
        elements.point.setAttribute('cx', routePoint.x)
        elements.point.setAttribute('cy', routePoint.y)
        elements.halo.setAttribute('cx', routePoint.x)
        elements.halo.setAttribute('cy', routePoint.y)
      },
    }, .58)
    .to([elements.route, elements.routeArrow], { opacity: 0, duration: .32, ease: 'power2.out' }, 2.26)
    .to(elements.mapViewport, { attr: { transform: cameraTransform(to, targetZoom) }, duration: .78, ease: 'expo.out' }, 2.35)
    .to([elements.point, elements.halo], { attr: { cx: to[0], cy: to[1] }, duration: .55, ease: 'expo.out' }, 2.35)
    .call(() => {
      renderHighlights(item)
      gsap.set(elements.highlightLayer, { opacity: 1 })
      elements.label.textContent = item.mapLabel
      positionLabel(to, targetZoom, to)
    }, [], 2.6)
    .to(elements.label, { autoAlpha: 1, duration: .32 }, 2.72)
    .to(elements.card, { autoAlpha: 1, x: 0, scale: 1, duration: .62, ease: 'expo.out' }, 2.84)
}

function renderEraButtons() {
  elements.eraList.innerHTML = chronicle.map((item, index) => {
    const [x, y] = eraPositions[index]
    return `<button class="era-button" type="button" data-index="${index}" style="--era-x:${x}%;--era-y:${y}%"><span>${item.era}</span></button>`
  }).join('')
  elements.eraList.addEventListener('click', event => {
    const button = event.target.closest('.era-button')
    if (button) selectEra(Number(button.dataset.index))
  })
}

function fillChronicleCard(item) {
  elements.cardTitle.textContent = item.title
  elements.cardLocation.textContent = item.location
  elements.cardStory.textContent = item.story
  elements.trackTitle.textContent = item.track
  elements.trackButton.disabled = !item.audio
  elements.trackButton.classList.remove('is-previewing')
  elements.trackButton.setAttribute('aria-label', item.audio ? `播放${item.track}` : '该体系的代表曲目音频待补充')
}

function stopTrackAudio() {
  trackAudio.pause()
  trackAudio.currentTime = 0
  loadedAudioPath = ''
  trackAudio.removeAttribute('src')
  trackAudio.load()
  elements.trackButton.classList.remove('is-previewing')
  resetAudioProgress()
}

function selectEra(index, animate = true) {
  const nextIndex = Math.max(0, Math.min(chronicle.length - 1, index))
  const from = projection ? cameraPoint : [500, 310]
  activeIndex = nextIndex
  const item = chronicle[activeIndex]
  stopTrackAudio()
  document.querySelectorAll('.era-button').forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === activeIndex)
    button.classList.toggle('is-near', Math.abs(buttonIndex - activeIndex) === 1)
  })
  elements.progress.style.strokeDasharray = `${(activeIndex + 1) / chronicle.length} 1`
  if (projection) {
    if (animate && !reduceMotion) {
      animateCameraTracking(from, item)
    } else {
      cameraTimeline?.kill()
      fillChronicleCard(item)
      renderHighlights(item)
      setMapAtTarget(item)
      const routeStart = activeIndex === 0 ? projection([111.5, 35.2]) : projectedPoint(chronicle[activeIndex - 1])
      const guideLength = prepareRoute(routeStart, projectedPoint(item))
      updateScreenRoute(guideLength, projectedPoint(item), Math.min(1.04, (item.zoom || 1.5) * .68), 1)
      gsap.set([elements.route, elements.routeArrow], { opacity: 0 })
      gsap.set(elements.card, { autoAlpha: 1, x: 0, scale: 1 })
    }
  } else {
    fillChronicleCard(item)
  }
  elements.stageNumber.textContent = String(activeIndex + 1).padStart(2, '0')
  elements.stagePeriod.textContent = item.era
}

function setView(view) {
  currentView = view
  elements.workspace.dataset.currentView = view
  document.querySelectorAll('.main-nav button').forEach(button => button.classList.toggle('is-active', button.dataset.view === view))
  if (view === 'object') {
    elements.stageKicker.textContent = 'SHENG · MATERIAL STUDY'
    elements.stageTitle.textContent = '匏斗、簧片与音管'
    elements.cardTitle.textContent = '笙的构造'
    elements.cardLocation.textContent = '簧片 · 音管 · 笙斗 · 吹口'
    elements.cardStory.textContent = '笙由多根音管插入笙斗构成。气流使金属簧片振动，吹气和吸气都能发声；多个音管可同时奏响，形成笙独特的和声能力。'
    elements.trackTitle.textContent = '查看器物结构'
  } else if (view === 'phenomenon') {
    elements.stageKicker.textContent = 'SHENG · SOUND PHENOMENON'
    elements.stageTitle.textContent = '吹吸皆响的自由簧'
    elements.cardTitle.textContent = '自由簧如何发声'
    elements.cardLocation.textContent = '气流与簧片耦合'
    elements.cardStory.textContent = '簧舌在气流中往复振动。音高主要由簧片与管内空气柱共同决定，多簧同时振动时形成清晰而富有穿透力的复合音色。'
    elements.trackTitle.textContent = '触发和声音型'
  } else {
    elements.stageKicker.textContent = 'SHENG · CHRONICLE'
    elements.stageTitle.textContent = '五种笙乐传统的地域与时代脉络'
    fillChronicleCard(chronicle[activeIndex])
  }
}

document.querySelector('.main-nav').addEventListener('click', event => {
  const button = event.target.closest('button[data-view]')
  if (button) setView(button.dataset.view)
})
const railPageSwitcher = document.querySelector('#railPageSwitcher')
railPageSwitcher?.addEventListener('click', event => {
  const button = event.target.closest('.rail-switch-item')
  if (!button) return
  updateRailPageSwitcher(button.dataset.page, true)
})
railPageSwitcher?.querySelectorAll('.rail-switch-item').forEach(button => {
  button.addEventListener('pointerdown', () => button.classList.add('is-pressed'))
  button.addEventListener('pointerup', () => button.classList.remove('is-pressed'))
  button.addEventListener('pointercancel', () => button.classList.remove('is-pressed'))
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = pageOrder.indexOf(button.dataset.page)
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextPage = pageOrder[(currentIndex + direction + pageOrder.length) % pageOrder.length]
    const nextButton = railPageSwitcher.querySelector(`[data-page="${nextPage}"]`)
    updateRailPageSwitcher(nextPage, true)
    nextButton?.focus()
  })
})
document.querySelector('.sound-orb').addEventListener('click', event => event.currentTarget.classList.toggle('is-active'))
elements.trackButton.addEventListener('click', async () => {
  const item = chronicle[activeIndex]
  if (!item.audio) return
  if (loadedAudioPath === item.audio && !trackAudio.paused) {
    trackAudio.pause()
    elements.trackButton.setAttribute('aria-label', `播放${item.track}`)
    return
  }
  if (loadedAudioPath !== item.audio) {
    trackAudio.src = resolveAudioUrl(item.audio)
    loadedAudioPath = item.audio
    trackAudio.currentTime = 0
  }
  try {
    await trackAudio.play()
    elements.trackButton.classList.add('is-previewing')
    elements.trackButton.setAttribute('aria-label', `暂停${item.track}`)
    showAudioProgress()
    elements.point.animate([{ transform: 'scale(1)' }, { transform: 'scale(2)' }, { transform: 'scale(1)' }], { duration: 900, easing: 'cubic-bezier(.22,.8,.24,1)' })
  } catch (error) {
    console.error('音频播放失败', error)
  }
})
elements.audioSeek.addEventListener('pointerdown', () => { isSeeking = true })
elements.audioSeek.addEventListener('input', event => {
  const progress = Number(event.currentTarget.value)
  updateSeekAppearance(progress)
  if (Number.isFinite(trackAudio.duration)) {
    const seekTime = trackAudio.duration * progress / 100
    elements.audioCurrent.textContent = formatAudioTime(seekTime)
    trackAudio.currentTime = seekTime
  }
})
elements.audioSeek.addEventListener('change', () => { isSeeking = false })
elements.audioSeek.addEventListener('pointerup', () => { isSeeking = false })
trackAudio.addEventListener('loadedmetadata', () => {
  elements.audioDuration.textContent = formatAudioTime(trackAudio.duration)
})
trackAudio.addEventListener('timeupdate', () => {
  if (isSeeking || !Number.isFinite(trackAudio.duration)) return
  const progress = trackAudio.duration ? trackAudio.currentTime / trackAudio.duration * 100 : 0
  elements.audioSeek.value = progress
  elements.audioCurrent.textContent = formatAudioTime(trackAudio.currentTime)
  elements.audioDuration.textContent = formatAudioTime(trackAudio.duration)
  updateSeekAppearance(progress)
})
trackAudio.addEventListener('play', showAudioProgress)
trackAudio.addEventListener('pause', () => {
  elements.trackButton.classList.remove('is-previewing')
  elements.trackButton.setAttribute('aria-label', `播放${chronicle[activeIndex].track}`)
})
trackAudio.addEventListener('ended', () => {
  elements.trackButton.classList.remove('is-previewing')
  elements.trackButton.setAttribute('aria-label', `播放${chronicle[activeIndex].track}`)
  elements.audioSeek.value = 100
  updateSeekAppearance(100)
})
window.addEventListener('keydown', event => {
  if (currentView !== 'chronicle') return
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') selectEra(activeIndex + 1)
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') selectEra(activeIndex - 1)
})

renderEraButtons()
updateRailPageSwitcher('sound')
const requestedEra = Number(new URLSearchParams(window.location.search).get('era'))
activeIndex = Number.isInteger(requestedEra) ? Math.max(0, Math.min(4, requestedEra)) : 0
selectEra(activeIndex, false)
try {
  renderMap(chinaMap)
} catch (error) {
  elements.loading.textContent = '地图数据暂时无法载入'
  console.error(error)
}
