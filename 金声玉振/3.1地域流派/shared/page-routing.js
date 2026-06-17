const INSTRUMENT_ALIASES = {
  sheng: "sheng",
  gu: "gu",
  qin: "qin",
  di: "di",
  xun: "xun",
  drum: "gu",
  dizi: "di",
  "\u7b19": "sheng",
  "\u9f13": "gu",
  "\u7434": "qin",
  "\u53e4\u7434": "qin",
  "\u7b1b": "di",
  "\u57d9": "xun",
}

const INSTRUMENT_CONFIG = {
  sheng: {
    folder: "\u7b19",
    regionInstrument: "sheng",
  },
  gu: {
    folder: "\u9f13",
    regionInstrument: "drum",
  },
  qin: {
    folder: "\u7434",
    regionInstrument: "qin",
  },
  di: {
    folder: "\u7b1b",
    regionInstrument: "dizi",
  },
  xun: {
    folder: "\u57d9",
    regionInstrument: "xun",
  },
}

function normalizeInstrumentKey(value) {
  const rawValue = value == null ? "" : String(value).trim()
  const decodedValue = rawValue ? decodeURIComponent(rawValue) : ""
  return INSTRUMENT_ALIASES[decodedValue] || INSTRUMENT_ALIASES[rawValue] || "sheng"
}

function getCurrentInstrument() {
  const params = new URLSearchParams(window.location.search)
  const instrument = params.get("instrument")
  return normalizeInstrumentKey(instrument)
}

function isLocalPreview() {
  const protocol = window.location.protocol || ""
  const hostname = window.location.hostname || ""
  return protocol === "file:" || hostname === "127.0.0.1" || hostname === "localhost"
}

export function resolveChronicleRoute(page, instrument = getCurrentInstrument()) {
  const instrumentKey = normalizeInstrumentKey(instrument)
  const config = INSTRUMENT_CONFIG[instrumentKey]

  if (!config) {
    return null
  }

  if (page === "painting") {
    if (isLocalPreview()) {
      return `http://127.0.0.1:8765/3.2\u753b\u4f5c\u6570\u636e/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
    }

    return `../../3.2\u753b\u4f5c\u6570\u636e/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
  }

  if (page === "chronicle") {
    if (isLocalPreview()) {
      return `http://127.0.0.1:8765/3.3\u5927\u4e8b\u7eaa\u5e74/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
    }

    return `../../3.3\u5927\u4e8b\u7eaa\u5e74/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
  }

  return null
}
