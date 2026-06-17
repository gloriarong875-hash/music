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
      regionInstrument: "sheng"
    },
    gu: {
      folder: "\u9f13",
      regionInstrument: "drum"
    },
    qin: {
      folder: "\u7434",
      regionInstrument: "qin"
    },
    di: {
      folder: "\u7b1b",
      regionInstrument: "dizi"
    },
    xun: {
      folder: "\u57d9",
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
      .map(function (segment) {
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
    return instrument ? normalizeInstrumentKey(instrument) : getInstrumentFromPath();
  }

  function isLocalPreview() {
    const protocol = window.location.protocol || "";
    const hostname = window.location.hostname || "";
    return protocol === "file:" || hostname === "127.0.0.1" || hostname === "localhost";
  }

  function getChronicleContext() {
    const pathname = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");

    if (pathname.indexOf("/3.2\u753b\u4f5c\u6570\u636e/") >= 0) {
      return "painting";
    }

    if (pathname.indexOf("/3.3\u5927\u4e8b\u7eaa\u5e74/") >= 0) {
      return "chronicle";
    }

    return "";
  }

  function getStaticTarget(path) {
    return isLocalPreview() ? `http://127.0.0.1:8765/${path}` : `../../${path}`;
  }

  function getRegionTarget(regionInstrument) {
    if (isLocalPreview()) {
      return `http://127.0.0.1:4173/?instrument=${encodeURIComponent(regionInstrument)}`;
    }

    return `../../3.1\u5730\u57df\u6d41\u6d3e/dist/index.html?instrument=${encodeURIComponent(regionInstrument)}`;
  }

  function resolveChronicleSwitchTarget(page, instrument) {
    const context = getChronicleContext();
    const instrumentKey = normalizeInstrumentKey(instrument || getCurrentInstrument());
    const config = INSTRUMENT_CONFIG[instrumentKey];

    if (!context || !config) {
      return null;
    }

    if (context === "painting") {
      if (page === "sound") {
        return getRegionTarget(config.regionInstrument);
      }

      if (page === "chronicle") {
        return getStaticTarget(
          `3.3\u5927\u4e8b\u7eaa\u5e74/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
        );
      }

      return null;
    }

    if (page === "sound") {
      return getRegionTarget(config.regionInstrument);
    }

    if (page === "form" || page === "painting") {
      return getStaticTarget(
        `3.2\u753b\u4f5c\u6570\u636e/${config.folder}/index.html?instrument=${encodeURIComponent(instrumentKey)}`
      );
    }

    return null;
  }

  function initChroniclePageSwitch() {
    const switcher = document.getElementById("pageSwitcher");

    if (!switcher || switcher.dataset.chronicleRoutingReady === "true") {
      return;
    }

    switcher.dataset.chronicleRoutingReady = "true";

    switcher.addEventListener(
      "click",
      function (event) {
        const button = event.target.closest(".switch-item");
        if (!button) {
          return;
        }

        const target = resolveChronicleSwitchTarget(button.dataset.page);
        if (!target) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = target;
      },
      true
    );

    switcher.addEventListener("pagechange", function (event) {
      const page = event.detail && event.detail.page;
      const target = resolveChronicleSwitchTarget(page);

      if (!target) {
        return;
      }

      window.location.href = target;
    });
  }

  window.resolveChronicleSwitchTarget = resolveChronicleSwitchTarget;
  window.initChroniclePageSwitch = initChroniclePageSwitch;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChroniclePageSwitch, { once: true });
  } else {
    initChroniclePageSwitch();
  }
})();
