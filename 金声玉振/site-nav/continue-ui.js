(function () {
  const FALLBACK_INSTRUMENT_ALIASES = {
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

  const FALLBACK_INSTRUMENT_CONFIG = {
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

  function getElement(target) {
    if (!target) return null;
    if (typeof target === "string") {
      return document.querySelector(target);
    }
    return target;
  }

  function fallbackNormalizeInstrumentKey(value) {
    const rawValue = value == null ? "" : String(value).trim();
    const decodedValue = rawValue ? decodeURIComponent(rawValue) : "";
    return (
      FALLBACK_INSTRUMENT_ALIASES[decodedValue] ||
      FALLBACK_INSTRUMENT_ALIASES[rawValue] ||
      "sheng"
    );
  }

  function fallbackGetInstrumentFromPath() {
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
      if (FALLBACK_INSTRUMENT_ALIASES[segment]) {
        return FALLBACK_INSTRUMENT_ALIASES[segment];
      }
    }

    return "sheng";
  }

  function fallbackGetCurrentInstrument() {
    const params = new URLSearchParams(window.location.search);
    const instrument = params.get("instrument");

    if (instrument) {
      return fallbackNormalizeInstrumentKey(instrument);
    }

    return fallbackGetInstrumentFromPath();
  }

  function fallbackAddInstrumentParam(path, instrument) {
    const instrumentKey = fallbackNormalizeInstrumentKey(
      instrument || fallbackGetCurrentInstrument()
    );
    const separator = path.indexOf("?") >= 0 ? "&" : "?";
    return `${path}${separator}instrument=${encodeURIComponent(instrumentKey)}`;
  }

  function fallbackIsLocalRegionPreview() {
    const protocol = window.location.protocol || "";
    const hostname = window.location.hostname || "";
    return (
      protocol === "file:" ||
      hostname === "127.0.0.1" ||
      hostname === "localhost"
    );
  }

  function fallbackGetRegionEntryPath(config) {
    if (fallbackIsLocalRegionPreview()) {
      return `http://127.0.0.1:4173/?instrument=${encodeURIComponent(config.regionInstrument)}`;
    }

    return `../../3.1\u5730\u57df\u6d41\u6d3e/dist/index.html?instrument=${encodeURIComponent(
      config.regionInstrument
    )}`;
  }

  function fallbackResolveNextPage(pageKey, instrument) {
    const instrumentKey = fallbackNormalizeInstrumentKey(
      instrument || fallbackGetCurrentInstrument()
    );
    const config = FALLBACK_INSTRUMENT_CONFIG[instrumentKey];

    if (!config) {
      return null;
    }

    const nextPageMap = {
      make: `../../1.2\u58f0\u7eb9-all/${config.folder}/index.html`,
      sound: `../../1.3\u97f3\u753b\u6545\u4e8b/${config.folder}/index.html`,
      story: `../../2.1\u90e8\u4ef6\u6851\u57fa\u56fe/${config.folder}/index.html`,
      parts: `../../2.2\u5f62\u5236\u6f14\u53d8/${config.evolutionFolder}/${config.evolutionFile}`,
      evolution: fallbackGetRegionEntryPath(config)
    };

    return nextPageMap[pageKey] || null;
  }

  function buildTarget(pageKey) {
    const instrument = typeof window.getCurrentInstrument === "function"
      ? window.getCurrentInstrument()
      : fallbackGetCurrentInstrument();
    const nextPath = typeof window.resolveNextPage === "function"
      ? window.resolveNextPage(pageKey, instrument)
      : fallbackResolveNextPage(pageKey, instrument);

    if (!nextPath) return null;

    if (pageKey === "evolution") {
      return nextPath;
    }

    if (typeof window.addInstrumentParam === "function") {
      return window.addInstrumentParam(nextPath, instrument);
    }

    return fallbackAddInstrumentParam(nextPath, instrument);
  }

  function bindNextLink(selector, pageKey, options) {
    const link = getElement(selector);
    if (!link) return null;

    const target = buildTarget(pageKey);
    if (!target) return null;

    link.setAttribute("href", target);

    if (options && options.text) {
      link.textContent = options.text;
    }

    return link;
  }

  function setupFloatingNext(options) {
    const config = Object.assign(
      {
        pageKey: "",
        text: "\u70b9\u51fb\u7ee7\u7eed",
        position: "right",
        finalSelector: "",
        activeClass: "is-visible",
        buttonId: "flowNextButton"
      },
      options || {}
    );

    if (!config.pageKey) return null;

    let button = document.getElementById(config.buttonId);

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = config.buttonId;
      button.className = "flow-next-link";
      document.body.appendChild(button);
    }

    button.classList.remove("flow-next-center", "flow-next-right");
    button.classList.add(config.position === "center" ? "flow-next-center" : "flow-next-right");
    button.textContent = config.text;
    button.dataset.flowTarget = buildTarget(config.pageKey) || "";

    if (!button.dataset.flowBound) {
      button.addEventListener("click", function () {
        if (typeof window.goNextPage === "function") {
          window.goNextPage(config.pageKey);
          return;
        }

        if (button.dataset.flowTarget) {
          window.location.href = button.dataset.flowTarget;
        }
      });
      button.dataset.flowBound = "true";
    }

    const targetNode = config.finalSelector === "body"
      ? document.body
      : getElement(config.finalSelector);

    function updateVisibility() {
      const currentTarget = config.finalSelector === "body"
        ? document.body
        : getElement(config.finalSelector);
      const visible = !!currentTarget && currentTarget.classList.contains(config.activeClass);
      button.classList.toggle("is-visible", visible);
    }

    if (targetNode) {
      const observer = new MutationObserver(updateVisibility);
      observer.observe(targetNode, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }

    updateVisibility();
    return button;
  }

  window.bindNextLink = bindNextLink;
  window.setupFloatingNext = setupFloatingNext;
})();
