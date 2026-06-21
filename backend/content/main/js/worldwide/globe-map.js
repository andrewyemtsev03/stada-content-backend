import createGlobe from "https://esm.sh/cobe@2.0.1";
import { getCountryName } from "./countries-data.js?v=worldwide-22";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
const selectLabel = {
  en: "Select",
  ru: "Выбрать",
  kz: "Таңдау",
};

function resolveGlobeLanguage(lang) {
  if (selectLabel[lang]) return lang;
  return lang === "kg" ? "ru" : "en";
}

function getCountryLocation(country) {
  return [country.lat, country.lng];
}

function longitudeToPhi(longitude) {
  // COBE 2 converts longitude as `lngRad - PI` internally. This phi centers
  // the selected longitude without touching marker coordinates or label anchors.
  return -Math.PI / 2 - toRadians(longitude);
}

function latitudeToTheta(latitude) {
  return clamp(toRadians(latitude) * 0.35, -0.35, 0.35);
}

export class GlobeMap {
  constructor(root, countries, options = {}) {
    this.root = root;
    this.canvas = root?.querySelector("[data-globe-canvas]");
    this.labelsLayer = root?.querySelector("[data-globe-labels]");
    this.fallback = root?.querySelector("[data-globe-fallback]");
    this.countries = countries;
    this.selectedId = options.selectedId || countries[0]?.id;
    this.lang = resolveGlobeLanguage(options.lang || document.documentElement.lang || "en");
    this.onSelect = options.onSelect || (() => {});
    this.globe = null;
    this.resizeObserver = null;
    this.animationFrameId = 0;
    this.pointerStart = null;
    this.lastPointer = null;
    this.dragOffset = { phi: 0, theta: 0 };
    this.velocity = { phi: 0, theta: 0 };
    this.currentPhi = 0;
    this.currentTheta = 0.22;
    this.targetPhi = 0;
    this.targetTheta = 0.22;
    this.framePhi = 0;
    this.frameTheta = 0.22;
    this.labelElements = new Map();
    this.isPaused = false;
    this.isDragging = false;
    this.didMove = false;
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  init() {
    if (!this.root || !this.canvas) return;
    this.renderLabels();
    this.focusCountry(this.selectedId, { immediate: true, silent: true });
    this.bindEvents();
    this.initGlobe();
  }

  bindEvents() {
    this.canvas.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("pointerup", this.handlePointerUp, { passive: true });
    this.resizeObserver = new ResizeObserver(() => this.updateGlobe());
    this.resizeObserver.observe(this.root);
  }

  renderLabels() {
    if (!this.root) return;
    this.root.querySelectorAll(".globe-marker-label").forEach((label) => label.remove());
    if (this.labelsLayer) this.labelsLayer.replaceChildren();
    this.labelElements.clear();

    this.countries.forEach((country) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "globe-marker-label";
      button.dataset.countryId = country.id;
      const countryName = getCountryName(country, this.lang);
      button.setAttribute("aria-label", `${selectLabel[this.lang] || selectLabel.en} ${countryName}`);

      const flag = document.createElement("img");
      flag.src = country.flag;
      flag.alt = "";
      flag.loading = "lazy";
      flag.className = "globe-marker-label__flag";

      const pointer = document.createElement("span");
      pointer.className = "globe-marker-label__pointer";
      pointer.setAttribute("aria-hidden", "true");

      // COBE 2 exposes marker ids as CSS anchors (`--cobe-${id}`) and
      // visibility vars. Labels must bind to those anchors instead of guessing
      // canvas projection math in this layer.
      button.style.setProperty("position-anchor", `--cobe-${country.id}`);
      button.style.opacity = `var(--cobe-visible-${country.id}, 0)`;
      button.style.filter = `blur(calc((1 - var(--cobe-visible-${country.id}, 0)) * 8px))`;

      button.append(flag, pointer);

      button.addEventListener("pointerdown", (event) => event.stopPropagation());
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectCountry(country.id, { force: true });
      });
      this.root.appendChild(button);
      this.labelElements.set(country.id, button);
    });

    this.syncSelectedLabel();
  }

  setLanguage(lang) {
    this.lang = resolveGlobeLanguage(lang);
    this.labelElements.forEach((label, countryId) => {
      const country = this.countries.find((item) => item.id === countryId);
      if (!country) return;
      const countryName = getCountryName(country, this.lang);
      label.setAttribute("aria-label", `${selectLabel[this.lang] || selectLabel.en} ${countryName}`);
    });
  }

  initGlobe() {
    if (!this.canvas || !this.root.offsetWidth) return;

    try {
      const width = Math.round(this.root.offsetWidth);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.globe = createGlobe(this.canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: this.currentPhi,
        theta: this.currentTheta,
        dark: 0,
        diffuse: 1.45,
        mapSamples: 18000,
        mapBrightness: 8,
        baseColor: [1, 1, 1],
        markerColor: [0, 0.36, 0.72],
        glowColor: [0.9, 0.95, 1],
        markerElevation: 0.02,
        opacity: 0.88,
        scale: 1,
        markers: this.buildMarkers(),
        arcs: this.buildArcs(),
        arcColor: [0, 0.36, 0.72],
        arcWidth: 0.45,
        arcHeight: 0.18,
      });

      this.canvas.style.opacity = "1";
      this.root.classList.add("is-ready");
      this.startAnimationLoop();
    } catch (error) {
      this.root.classList.add("has-fallback");
      if (this.fallback) this.fallback.hidden = false;
      console.warn("Unable to initialize COBE globe", error);
    }
  }

  buildMarkers() {
    return this.countries.map((country) => ({
      id: country.id,
      location: getCountryLocation(country),
      size: country.id === this.selectedId ? 0.075 : 0.035,
    }));
  }

  buildArcs() {
    const origin = this.countries.find((country) => country.id === "kazakhstan") || this.countries[0];
    if (!origin) return [];

    return this.countries
      .filter((country) => country.id !== origin.id)
      .map((country) => ({
        id: `kazakhstan-${country.id}`,
        from: getCountryLocation(origin),
        to: getCountryLocation(country),
      }));
  }

  startAnimationLoop() {
    if (this.animationFrameId) return;

    const tick = () => {
      this.advanceFrame();
      this.updateGlobe();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    tick();
  }

  advanceFrame() {
    const phiDelta = normalizeAngle(this.targetPhi - this.currentPhi);
    const thetaDelta = this.targetTheta - this.currentTheta;
    this.currentPhi += phiDelta * 0.08;
    this.currentTheta += thetaDelta * 0.08;

    if (!this.isPaused) {
      this.currentPhi += this.velocity.phi;
      this.currentTheta = clamp(this.currentTheta + this.velocity.theta, -0.4, 0.4);
      this.velocity.phi *= 0.94;
      this.velocity.theta *= 0.9;
    }

    this.framePhi = this.currentPhi + this.dragOffset.phi;
    this.frameTheta = clamp(this.currentTheta + this.dragOffset.theta, -0.4, 0.4);
  }

  updateGlobe() {
    if (!this.globe || !this.root) return;

    const width = Math.round(this.root.offsetWidth);
    if (!width) return;
    this.globe.update({
      width,
      height: width,
      phi: this.framePhi,
      theta: this.frameTheta,
      markers: this.buildMarkers(),
      arcs: this.buildArcs(),
      dark: 0,
      mapBrightness: 8,
      markerColor: [0, 0.36, 0.72],
      baseColor: [1, 1, 1],
      arcColor: [0, 0.36, 0.72],
      markerElevation: 0.02,
    });
  }

  handlePointerDown(event) {
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.lastPointer = { x: event.clientX, y: event.clientY, t: Date.now() };
    this.dragOffset = { phi: 0, theta: 0 };
    this.velocity = { phi: 0, theta: 0 };
    this.isPaused = true;
    this.isDragging = true;
    this.didMove = false;
    this.canvas.style.cursor = "grabbing";
  }

  handlePointerMove(event) {
    if (!this.pointerStart) return;

    const deltaX = event.clientX - this.pointerStart.x;
    const deltaY = event.clientY - this.pointerStart.y;
    this.dragOffset = { phi: deltaX / 260, theta: deltaY / 850 };
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) this.didMove = true;

    const now = Date.now();
    if (this.lastPointer) {
      const dt = Math.max(now - this.lastPointer.t, 1);
      this.velocity = {
        phi: clamp(((event.clientX - this.lastPointer.x) / dt) * 0.22, -0.08, 0.08),
        theta: clamp(((event.clientY - this.lastPointer.y) / dt) * 0.04, -0.025, 0.025),
      };
    }
    this.lastPointer = { x: event.clientX, y: event.clientY, t: now };
  }

  handlePointerUp() {
    if (!this.pointerStart) return;

    this.currentPhi += this.dragOffset.phi;
    this.currentTheta = clamp(this.currentTheta + this.dragOffset.theta, -0.4, 0.4);
    this.targetPhi = this.currentPhi;
    this.targetTheta = this.currentTheta;
    this.dragOffset = { phi: 0, theta: 0 };
    this.pointerStart = null;
    this.lastPointer = null;
    this.isPaused = false;
    this.isDragging = false;
    this.canvas.style.cursor = "grab";
  }

  selectCountry(countryId, options = {}) {
    if (this.didMove && !options.force) {
      this.didMove = false;
      return;
    }

    this.focusCountry(countryId);
  }

  focusCountry(countryId, options = {}) {
    const country = this.countries.find((item) => item.id === countryId);
    if (!country) return;

    this.selectedId = country.id;
    this.targetPhi = longitudeToPhi(country.lng);
    this.targetTheta = latitudeToTheta(country.lat);
    if (options.immediate) {
      this.currentPhi = this.targetPhi;
      this.currentTheta = this.targetTheta;
      this.framePhi = this.targetPhi;
      this.frameTheta = this.targetTheta;
    }
    this.syncSelectedLabel();
    this.updateGlobe();
    if (!options.silent) this.onSelect(country);
  }

  syncSelectedLabel() {
    this.root?.querySelectorAll("[data-country-id]").forEach((label) => {
      const isSelected = label.dataset.countryId === this.selectedId;
      label.classList.toggle("is-selected", isSelected);
      label.setAttribute("aria-pressed", String(isSelected));
    });
  }

  destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.globe) this.globe.destroy();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
  }
}
