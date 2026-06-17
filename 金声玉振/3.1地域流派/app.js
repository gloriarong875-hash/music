import { geoMercator, geoPath } from 'd3-geo'
import { gsap } from 'gsap'
import { getSiteConfig } from './data/instruments.js'
import { resolveChronicleRoute } from './shared/page-routing.js'
import { formatAudioTime, normalizeFeature } from './shared/utils.js'

const siteConfig = getSiteConfig()
const chronicle = siteConfig.chronicle
const eraPositions = siteConfig.eraPositions
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

function applySiteConfig() {
  document.documentElement.dataset.site = siteConfig.key
  document.title = siteConfig.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', siteConfig.description)
  document.documentElement.style.setProperty('--app-bg-image', `url("${siteConfig.background}")`)
  document.documentElement.style.setProperty('--card-art-image', `url("${siteConfig.cardArt}")`)
  document.documentElement.style.setProperty('--card-art-size', siteConfig.cardArtSize)
  document.documentElement.style.setProperty('--card-overlay', siteConfig.cardOverlay)

  document.querySelector('.brand-seal').textContent = siteConfig.seal
  document.querySelector('.brand strong').textContent = siteConfig.brand
  document.querySelector('.brand small').textContent = siteConfig.archive
  document.querySelector('.brand').setAttribute('aria-label', `${siteConfig.brand}首页`)
  document.querySelector('.chronicle-rail').setAttribute('aria-label', `${siteConfig.subject}的历史时间轴`)
  document.querySelector('.map-stage').setAttribute('aria-label', `${siteConfig.subject}的历史传播省级地图`)
  document.querySelector('#chinaMapSvg').setAttribute('aria-label', `中国省级行政区互动地图：${siteConfig.subject}传统`)
  document.querySelector('.mobile-message span').textContent = siteConfig.seal
  document.querySelector('.mobile-message p').textContent = `请横置设备或使用更宽的屏幕观看${siteConfig.subject}编年地图。`

  elements.stageKicker.textContent = siteConfig.views.chronicle.kicker
  elements.stageTitle.textContent = siteConfig.chronicleTitle

  const performer = document.querySelector('.sheng-performer')
  if (siteConfig.performer) {
    performer.src = siteConfig.performer
    performer.alt = siteConfig.performerAlt
    performer.hidden = false
  } else {
    performer.hidden = true
  }
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

function featureParent(feature) {
  return Number(feature.properties?.parent?.adcode)
}

function getBaseFeatures(allFeatures) {
  return allFeatures.filter(feature => feature.properties?.level === 'province')
}

function getSelectedFeatures(item) {
  const selectedAdcodes = item.provinceAdcodes || [item.provinceAdcode]
  return features.filter(feature => selectedAdcodes.includes(Number(feature.properties?.adcode)))
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
      const routeStart = activeIndex === 0 ? projection(siteConfig.startCenter) : projectedPoint(chronicle[activeIndex - 1])
      const guideLength = prepareRoute(routeStart, projectedPoint(item))
      updateScreenRoute(guideLength, projectedPoint(item), Math.min(1.04, (item.zoom || 1.5) * .68), 1)
      gsap.set([elements.route, elements.routeArrow], { opacity: 0 })
      gsap.set(elements.card, { autoAlpha: 1, x: 0, scale: 1 })
    }
  } else {
    fillChronicleCard(item)
  }
  elements.stageNumber.textContent = String(activeIndex + 1).padStart(2, '0')
  elements.stagePeriod.textContent = siteConfig.key === 'drum' ? item.period : item.era
}

function setView(view) {
  currentView = view
  elements.workspace.dataset.currentView = view
  document.querySelectorAll('.main-nav [data-view]').forEach(button => {
    const isActive = button.dataset.view === view
    button.classList.toggle('is-active', isActive)
    button.classList.toggle('active', isActive)
    button.setAttribute('aria-current', isActive ? 'page' : 'false')
  })
  if (view === 'object') {
    const viewConfig = siteConfig.views.object
    elements.stageKicker.textContent = viewConfig.kicker
    elements.stageTitle.textContent = viewConfig.title
    elements.cardTitle.textContent = viewConfig.cardTitle
    elements.cardLocation.textContent = viewConfig.location
    elements.cardStory.textContent = viewConfig.story
    elements.trackTitle.textContent = viewConfig.track
  } else if (view === 'phenomenon') {
    const viewConfig = siteConfig.views.phenomenon
    elements.stageKicker.textContent = viewConfig.kicker
    elements.stageTitle.textContent = viewConfig.title
    elements.cardTitle.textContent = viewConfig.cardTitle
    elements.cardLocation.textContent = viewConfig.location
    elements.cardStory.textContent = viewConfig.story
    elements.trackTitle.textContent = viewConfig.track
  } else {
    elements.stageKicker.textContent = siteConfig.views.chronicle.kicker
    elements.stageTitle.textContent = siteConfig.chronicleTitle
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
  const target = resolveChronicleRoute(button.dataset.page)
  if (target) {
    window.location.href = target
    return
  }
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
    const target = resolveChronicleRoute(nextPage)
    if (target) {
      window.location.href = target
      return
    }
    const nextButton = railPageSwitcher.querySelector(`[data-page="${nextPage}"]`)
    updateRailPageSwitcher(nextPage, true)
    nextButton?.focus()
  })
})
document.querySelector('.sound-orb').addEventListener('click', event => event.currentTarget.classList.toggle('is-active'))
elements.trackButton.addEventListener('click', async () => {
  const item = chronicle[activeIndex]
  if (!item.audio) return
  if (!trackAudio.paused && trackAudio.src.endsWith(item.audio)) {
    trackAudio.pause()
    elements.trackButton.classList.remove('is-previewing')
    return
  }
  if (!trackAudio.src.endsWith(item.audio)) {
    trackAudio.src = item.audio
    trackAudio.currentTime = 0
  }
  try {
    await trackAudio.play()
    elements.trackButton.classList.add('is-previewing')
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
trackAudio.addEventListener('pause', () => elements.trackButton.classList.remove('is-previewing'))
trackAudio.addEventListener('ended', () => {
  elements.trackButton.classList.remove('is-previewing')
  elements.audioSeek.value = 100
  updateSeekAppearance(100)
})
window.addEventListener('keydown', event => {
  if (currentView !== 'chronicle') return
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') selectEra(activeIndex + 1)
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') selectEra(activeIndex - 1)
})

applySiteConfig()
renderEraButtons()
updateRailPageSwitcher('sound')
const requestedEra = Number(new URLSearchParams(window.location.search).get('era'))
activeIndex = Number.isInteger(requestedEra) ? Math.max(0, Math.min(chronicle.length - 1, requestedEra)) : 0
selectEra(activeIndex, false)
fetch('./map/china.geojson').then(response => {
  if (!response.ok) throw new Error(`地图数据载入失败：${response.status}`)
  return response.json()
}).then(renderMap).catch(error => {
  elements.loading.textContent = '地图数据暂时无法载入'
  console.error(error)
})
