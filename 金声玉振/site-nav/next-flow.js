(function () {
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
    "\u57d9": "xun"
  };

  const INSTRUMENT_CONFIG = {
    sheng: {
      folder: "\u7b19",
      evolutionFolder: "\u7b19",
      evolutionFile: "shengyanbian.html",
      regionInstrument: "sheng"
    },
    gu: {
      folder: "\u9f13",
      evolutionFolder: "\u9f13",
      evolutionFile: "guyanbian.html",
      regionInstrument: "drum"
    },
    qin: {
      folder: "\u7434",
      evolutionFolder: "\u53e4\u7434",
      evolutionFile: "qinyanbian.html",
      regionInstrument: "qin"
    },
    di: {
      folder: "\u7b1b",
      evolutionFolder: "\u7b1b",
      evolutionFile: "diyanbian.html",
      regionInstrument: "dizi"
    },
    xun: {
      folder: "\u57d9",
      evolutionFolder: "\u57d9",
      evolutionFile: "xunyanbian.html",
      regionInstrument: "xun"
    }
  };

  function normalizeInstrumentKey(value) {
    const rawValue = value == null ? "" : String(value).trim();
    const decodedValue = rawValue ? decodeURIComponent(rawValue) : "";
    return INSTRUMENT_ALIASES[decodedValue] || INSTRUMENT_ALIASES[rawValue] || "sheng";
  }

  function getInstrumentFromPath() {
    const segments = window.location.pathname
      .split("/")
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch (error) {
          return segment;
        }
      })
      .reverse();

    for (const segment of segments) {
      if (INSTRUMENT_ALIASES[segment]) {
        return INSTRUMENT_ALIASES[segment];
      }
    }

    return "sheng";
  }

  function getCurrentInstrument() {
    const params = new URLSearchParams(window.location.search);
    const instrument = params.get("instrument");
    if (instrument) {
      return normalizeInstrumentKey(instrument);
    }
    return getInstrumentFromPath();
  }

  function addInstrumentParam(path, instrument) {
    const instrumentKey = normalizeInstrumentKey(instrument || getCurrentInstrument());
    const [basePath, existingQuery = ""] = path.split("?");
    const params = new URLSearchParams(existingQuery);
    params.set("instrument", instrumentKey);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function isLocalRegionPreview() {
    const protocol = window.location.protocol || "";
    const hostname = window.location.hostname || "";
    return (
      protocol === "file:" ||
      hostname === "127.0.0.1" ||
      hostname === "localhost"
    );
  }

  function getRegionEntryPath(config) {
    if (isLocalRegionPreview()) {
      return `http://127.0.0.1:4173/?instrument=${encodeURIComponent(config.regionInstrument)}`;
    }

    return `../../3.1\u5730\u57df\u6d41\u6d3e/dist/index.html?instrument=${encodeURIComponent(
      config.regionInstrument
    )}`;
  }

  function resolveNextPage(currentPageKey, instrument) {
    const instrumentKey = normalizeInstrumentKey(instrument || getCurrentInstrument());
    const config = INSTRUMENT_CONFIG[instrumentKey];

    const nextPageMap = {
      make: `../../1.2\u58f0\u7eb9-all/${config.folder}/index.html`,
      sound: `../../1.3\u97f3\u753b\u6545\u4e8b/${config.folder}/index.html`,
      story: `../../2.1\u90e8\u4ef6\u6851\u57fa\u56fe/${config.folder}/index.html`,
      parts: `../../2.2\u5f62\u5236\u6f14\u53d8/${config.evolutionFolder}/${config.evolutionFile}`,
      evolution: getRegionEntryPath(config)
    };

    return nextPageMap[currentPageKey] || null;
  }

  function goNextPage(currentPageKey) {
    const instrumentKey = getCurrentInstrument();
    const nextPath = resolveNextPage(currentPageKey, instrumentKey);

    if (!nextPath) {
      return null;
    }

    const target =
      currentPageKey === "evolution"
        ? nextPath
        : addInstrumentParam(nextPath, instrumentKey);

    window.location.href = target;
    return target;
  }

  function exposePublicApi() {
    window.getCurrentInstrument = getCurrentInstrument;
    window.addInstrumentParam = addInstrumentParam;
    window.goNextPage = goNextPage;
    window.resolveNextPage = resolveNextPage;
  }

  exposePublicApi();

  if (typeof window.setTimeout === "function") {
    window.setTimeout(exposePublicApi, 0);
  }
})();
