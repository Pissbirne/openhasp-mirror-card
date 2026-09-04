// openhasp-mirror-card.js  v1.0.1
// v1.0.1: TTS-Erkennung fuer Music-Assistant-Soundbar (kein Titel/Interpret -> "Sprachansage")
// v1.0.0: TTS-Ansagetext auf Media-Seite (show_tts_text, UI-Schalter im Editor)
// v9.9: Companion-App Fix - Container/Viewport-Messung beim Render (Fallback wenn ResizeObserver nicht feuert)
// v9.5: Responsive canvas_size via ResizeObserver (passt sich an Handy/PC an)
// v9.4: lock.lock action aus p4b2 entfernt (automatisches Tuerabschließen gefixt)
//   - Shadow DOM mit komplettem State-Management
//   - pages.jsonl + entity_map eingebettet
//   - HA-Entities live ausgewertet (Zeit, Sensoren, Lock, Media)
//   - Page-Sync via number.plate_page_number
//   - Klickbare Buttons (Radio-Player, Lock, etc.)
//   - MDI-Icons via Webfont
//   - Status-Cache (damit Page 3/4 nicht OFFLINE zeigen)

(function () {
  "use strict";

  // ============ PLATE PAGES (eingebettet) ============
  const PLATE_PAGES_JSONL = [
    {"page":0,"comment":"Page 0","bg_color":"#000000"},
    {"id":1,"obj":"btn","x":0,"y":420,"w":110,"h":60,"radius":0,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"\u0052","text_font":40,"text_color":"#a9a9a9","action":{"down":"page prev"}},
    {"id":2,"obj":"btn","x":120,"y":420,"w":110,"h":60,"radius":0,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"\u004F","text_font":40,"text_color":"#a9a9a9","action":{"down":"page 1"}},
    {"id":3,"obj":"btn","x":370,"y":420,"w":110,"h":60,"radius":0,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"\u0053","text_font":40,"text_color":"#a9a9a9","action":{"down":"page next"}},
    {"id":4,"obj":"btn","x":250,"y":420,"w":110,"h":60,"radius":0,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"\u0053","text_font":40,"text_color":"#a9a9a9","action":{"down":"page 3"}},
    {"page":1,"comment":"Page 1","bg_color":"#000000"},
    {"id":2,"obj":"label","comment":"Textfeld","x":0,"y":220,"w":480,"h":180,"align":"center","border_width":3,"text":"Zeit","text_font":170,"text_color":"#3a0aa8"},
    {"id":12,"obj":"label","x":0,"y":0,"w":480,"h":80,"align":"center","text":"Wochentag","text_font":60,"text_color":"#a9a9a9"},
    {"id":13,"obj":"label","x":0,"y":80,"w":480,"h":60,"align":"center","text":"Datum","text_font":60,"text_color":"#a9a9a9"},
    {"id":15,"obj":"label","x":20,"y":160,"w":100,"h":60,"text":"%","text_font":50,"text_color":"#a9a9a9"},
    {"id":16,"obj":"label","x":320,"y":160,"w":120,"h":60,"align":"right","text":"°","text_font":50,"text_color":"#a9a9a9"},
    {"id":19,"obj":"btn","x":160,"y":160,"w":160,"h":80,"radius":20,"bg_color":"#000000","border_color":"#000000","text":"L","text_font":64,"text_color":"#ffeb3c"},
    {"page":2,"comment":"Page 2","bg_color":"#000000"},
    {"id":1,"obj":"label","x":0,"y":260,"w":480,"h":60,"align":"center","text":"Es hat geklingelt","text_font":51,"text_color":"#a9a9a9"},
    {"id":4,"obj":"btn","x":100,"y":60,"w":300,"h":120,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"BELL","text_font":100,"text_color":"#a9a9a9"},
    {"page":3,"comment":"Page 3","bg_color":"#000000"},
    {"id":1,"obj":"label","x":0,"y":0,"w":480,"h":60,"align":"center","text":"Radio","text_font":45,"text_color":"#a9a9a9"},
    {"id":2,"obj":"btn","x":20,"y":60,"w":200,"h":80,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"RPR 1","text_color":"#a9a9a9"},
    {"id":3,"obj":"btn","x":260,"y":60,"w":200,"h":80,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"1 LIVE","text_color":"#a9a9a9"},
    {"id":4,"obj":"btn","x":20,"y":160,"w":200,"h":80,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"Rock Antenne","text_color":"#a9a9a9"},
    {"id":5,"obj":"btn","x":260,"y":160,"w":200,"h":80,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"SWR 3","text_color":"#a9a9a9"},
    {"id":6,"obj":"btn","x":160,"y":280,"w":160,"h":100,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"stop","text_font":100,"text_color":"#a9a9a9"},
    {"id":7,"obj":"btn","x":20,"y":280,"w":120,"h":100,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"vol-","text_font":100,"text_color":"#a9a9a9"},
    {"id":8,"obj":"btn","x":340,"y":280,"w":120,"h":100,"radius":30,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"vol+","text_font":100,"text_color":"#a9a9a9"},
    {"page":4,"comment":"Page 4","bg_color":"#000000"},
    {"id":2,"obj":"btn","x":60,"y":40,"w":380,"h":240,"radius":25,"bg_color":"#4b4b4b","bg_opa":179,"border_color":"#3a0aa8","border_width":3,"text":"LOCK","text_font":96,"text_color":"#a9a9a9"},
    {"id":3,"obj":"label","x":0,"y":320,"w":480,"h":60,"align":"center","text":"Haustüre","text_font":52,"text_color":"#a9a9a9"},
    {"page":5,"comment":"Page 5 - Media Info","bg_color":"#000000"},
    {"id":10,"obj":"img","x":120,"y":0,"w":240,"h":240,"src":""},
    {"id":11,"obj":"label","x":20,"y":280,"w":440,"h":60,"align":"center","text":"-","text_font":40,"text_color":"#FFDDEE"},
    {"id":12,"obj":"label","x":20,"y":340,"w":440,"h":50,"align":"center","text":"-","text_font":34,"text_color":"#CCDDFF"},
  ];

  // ============ ENTITY MAP ============
  // Templates (time, weekday, date), Entities mit round/precision/unit,
  // color_by_state, text_by_state, action (klickbare Buttons)
  const DEFAULT_ENTITY_MAP = {
    "p1b2":  { template: "time" },
    "p1b12": { template: "weekday" },
    "p1b13": { template: "date" },
    "p1b15": { entity: "sensor.temperatur_aussen_luftfeuchtigkeit", round: 0, unit: "%" },
    "p1b16": { entity: "sensor.temperatur_aussen_temperatur", round: 2, suffix: "°" },
    "p1b17": { text: "°" },
    "p1b19": {
      entity: "light.deckenlicht_bad",
      icon_by_state: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
      action: { service: "light.toggle", target: { entity_id: "light.deckenlicht_bad" } },
      _plate_entity: "light.controller_rgb_ir_ae8feb",
    },
    "p4b2":  { entity: "binary_sensor.sensor_hausture_offnung", icon_by_state: { on: "mdi:lock-open-variant", off: "mdi:lock" }, color_by_state: { on: "#FF0000", off: "#00FF00" } },
    "p4b3":  { entity: "binary_sensor.sensor_hausture_offnung", text_by_state: { on: "Haustüre geöffnet", off: "Haustüre geschlossen" } },
    "p3b2":  { text: "RPR 1", action: { service: "media_player.play_media", target: { entity_id: "media_player.wohnzimmer" }, data: { media_content_id: "https://stream.rpr1.de/rpr1-mp3-128", media_content_type: "music" } } },
    "p3b3":  { text: "1 LIVE", action: { service: "media_player.play_media", target: { entity_id: "media_player.wohnzimmer" }, data: { media_content_id: "https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3", media_content_type: "music" } } },
    "p3b4":  { text: "Rock Antenne", action: { service: "media_player.play_media", target: { entity_id: "media_player.wohnzimmer" }, data: { media_content_id: "https://stream.rockantenne.de/rockantenne/stream/mp3", media_content_type: "music" } } },
    "p3b5":  { text: "SWR 3", action: { service: "media_player.play_media", target: { entity_id: "media_player.wohnzimmer" }, data: { media_content_id: "https://liveradio.swr.de/sw282p3/swr3/play.mp3", media_content_type: "music" } } },
    "p3b6":  { icon: "mdi:stop", action: { service: "media_player.media_stop", target: { entity_id: "media_player.wohnzimmer" } } },
    "p3b7":  { icon: "mdi:volume-low", action: { service: "media_player.volume_down", target: { entity_id: "media_player.wohnzimmer" } } },
    "p3b8":  { icon: "mdi:volume-high", action: { service: "media_player.volume_up", target: { entity_id: "media_player.wohnzimmer" } } },
    "p5b11": { entity: "media_player.grundig_soundbar_85b1ecde_sendspin_bt_bridge", attr: "media_title" },
    "p5b12": { entity: "media_player.grundig_soundbar_85b1ecde_sendspin_bt_bridge", attr: "media_artist" },
  };

  // LVGL-Sonderzeichen -> Unicode-Emoji (rendert IMMER, sieht aus wie LVGL)
  // LVGL nutzt eigene Font-Glyphen (z.B. Doorbell-Symbol auf Code 0x44)
  // Wir mappen auf Unicode-Emojis die visuell aehnlich sind
  // PLUS: Manche Designer-Dateien haben "BELL" als Klartext statt LVGL-Code
  const LVGL_TEXT_ICONS = {
    "\u0052": "\u{1F519}",   // 0x52 = LVGL "prev"   -> 🔙
    "\u004F": "\u{1F3E0}",   // 0x4F = LVGL "home"   -> 🏠
    "\u0053": "\u25A0",      // 0x53 = LVGL "stop"   -> ■
    "\u0044": "\u{1F514}",   // 0x44 = LVGL "doorbell"-> 🔔
    "\u0043": "\u23EE",      // 0x43 = LVGL "prev"   -> ⏮
    "\u004C": "\u{1F512}",   // 0x4C = LVGL "lock"   -> 🔒
    "\u00F0": "\u{1F4A1}",   // 0xF0 = LVGL "light"  -> 💡
    "BELL": "\u{1F514}",     // "BELL" als Klartext (von openHASP-Designer)
    "LOCK": "\u{1F512}",     // "LOCK" als Klartext
    "STOP": "\u25A0",        // "STOP" als Klartext
    "PREV": "\u23EE",        // "PREV" als Klartext
    "HOME": "\u{1F3E0}",     // "HOME" als Klartext
    "PLAY": "\u25B6",        // "PLAY" als Klartext
    "PAUSE": "\u23F8",       // "PAUSE" als Klartext
    "NEXT": "\u23ED",        // "NEXT" als Klartext
  };

  // MDI-Icons - vereinfacht: immer Unicode-Emoji nutzen (rendert IMMER)
  // Wenn MDI-Font geladen ist, wuerde die MDI-Glyphe besser aussehen,
  // aber der Font-Load im Shadow DOM ist unzuverlaessig.
  // Wir nutzen Emojis die in jedem Browser verfuegbar sind.
  const MDI_NAMES = {
    "mdi:lightbulb": { mdi: "\uF0335", fallback: "\u{1F4A1}" },
    "mdi:lightbulb-outline": { mdi: "\uF0336", fallback: "\u{1F4A1}" },
    "mdi:lightbulb-on": { mdi: "\uF06E8", fallback: "\u{1F4A1}" },
    "mdi:lightbulb-on-outline": { mdi: "\uF06E9", fallback: "\u{1F4A1}" },
    "mdi:lightbulb-off": { mdi: "\uF0E4F", fallback: "\u26AB" },
    "mdi:lock": { mdi: "\uF033E", fallback: "\u{1F512}" },
    "mdi:lock-open-variant": { mdi: "\uF0FC6", fallback: "\u{1F513}" },
    "mdi:lock-open-outline": { mdi: "\uF0340", fallback: "\u{1F513}" },
    "mdi:home": { mdi: "\uF02DC", fallback: "\u{1F3E0}" },
    "mdi:music": { mdi: "\uF075A", fallback: "\u{1F3B5}" },
    "mdi:bell": { mdi: "\uF009A", fallback: "\u{1F514}" },
    "mdi:doorbell": { mdi: "\uF12E6", fallback: "\u{1F514}" },
    "mdi:arrow-left": { mdi: "\uF004D", fallback: "\u25C0" },
    "mdi:arrow-right": { mdi: "\uF0054", fallback: "\u25B6" },
    "mdi:volume-high": { mdi: "\uF057E", fallback: "\u{1F50A}" },
    "mdi:volume-low": { mdi: "\uF057F", fallback: "\u{1F509}" },
    "mdi:stop": { mdi: "\uF04DB", fallback: "\u25A0" },
  };

  function hexToRgba(hex, opa) {
    if (!hex) return "transparent";
    let r, g, b;
    if (hex.startsWith("#")) {
      const h = hex.slice(1);
      if (h.length === 3) { r = parseInt(h[0]+h[0],16); g = parseInt(h[1]+h[1],16); b = parseInt(h[2]+h[2],16); }
      else { r = parseInt(h.slice(0,2),16); g = parseInt(h.slice(2,4),16); b = parseInt(h.slice(4,6),16); }
    } else return hex;
    if (opa === undefined || opa === null) opa = 255;
    return "rgba(" + r + "," + g + "," + b + "," + (opa / 255) + ")";
  }

  function resolveTemplate(tpl, hass) {
    const now = new Date();
    const fmtTime = () => now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (tpl === "time") return { text: fmtTime(), color: null };
    if (tpl === "weekday") {
      const tage = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
      return { text: tage[now.getDay()], color: null };
    }
    if (tpl === "date") return { text: now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }), color: null };
    if (tpl === "occupied_time") {
      // "Besetzt" wenn Bewegung ODER Licht an, sonst Uhrzeit
      if (!hass || !hass.states) return { text: fmtTime(), color: null };
      // Pruefe zuerst den Template-Helper (sensor.bad_belegt)
      const belegt = hass.states["sensor.bad_belegt"];
      if (belegt) {
        if (belegt.state === "True" || belegt.state === "true" || belegt.state === "on") {
          return { text: "Besetzt", color: "#ff0000" };
        }
        return { text: fmtTime(), color: null };
      }
      // Fallback: direkt pruefen
      const motion = hass.states["binary_sensor.bewegungsmelder_bad"];
      const light = hass.states["light.deckenlicht_bad"];
      const occupied = (motion && motion.state === "on") || (light && light.state === "on");
      if (occupied) return { text: "Besetzt", color: "#ff0000" };
      return { text: fmtTime(), color: null };
    }
    if (tpl === "occupied") {
      // "Besetzt" wenn belegt, sonst leer
      if (!hass || !hass.states) return { text: "", color: null };
      const belegt = hass.states["sensor.bad_belegt"];
      if (belegt) {
        if (belegt.state === "True" || belegt.state === "true" || belegt.state === "on") {
          return { text: "Besetzt", color: "#ff0000" };
        }
        return { text: "", color: null };
      }
      const motion = hass.states["binary_sensor.bewegungsmelder_bad"];
      const light = hass.states["light.deckenlicht_bad"];
      const occupied = (motion && motion.state === "on") || (light && light.state === "on");
      if (occupied) return { text: "Besetzt", color: "#ff0000" };
      return { text: "", color: null };
    }
    return { text: "—", color: null };
  }

  function resolveValue(mapping, hass) {
    if (!mapping) return { text: null, isMdi: false, color: null };
    if (mapping.text !== undefined) return { text: mapping.text, isMdi: false, color: null };
    if (mapping.template) {
      const t = resolveTemplate(mapping.template, hass);
      return { text: t.text, isMdi: false, color: t.color || mapping.color || null };
    }
    if (mapping.icon) {
      if (mapping.icon.startsWith && mapping.icon.startsWith("mdi:")) {
        const mdi = MDI_NAMES[mapping.icon];
        if (mdi) {
          // Nutze Unicode-Emoji (rendert IMMER, auch ohne MDI-Font)
          return { text: mdi.fallback, isMdi: true, color: mapping.color || null };
        }
        return { text: mapping.icon, isMdi: true, color: mapping.color || null };
      }
    }
    if (mapping.entity && hass && hass.states) {
      const s = hass.states[mapping.entity];
      if (!s) return { text: "—", isMdi: false, color: null };
      let val;
      let isMdi = false;
      // Icon via icon_by_state (hat hoechste Prio)
      if (mapping.icon_by_state && s.state in mapping.icon_by_state) {
        const iconKey = mapping.icon_by_state[s.state];
        if (iconKey.startsWith && iconKey.startsWith("mdi:")) {
          const mdi = MDI_NAMES[iconKey];
          if (mdi) {
            val = mdi.fallback; // Unicode-Emoji
            isMdi = true;
          } else {
            val = iconKey;
          }
        } else {
          val = iconKey;
        }
      } else if (mapping.attr) {
        val = s.attributes && s.attributes[mapping.attr];
        if (val == null || val === "") val = "—";
      } else if (mapping.text_by_state && s.state in mapping.text_by_state) {
        val = mapping.text_by_state[s.state];
      } else {
        val = s.state;
      }
      if (!isMdi && !mapping.attr) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (mapping.round !== undefined) val = num.toFixed(mapping.round);
          else if (mapping.precision !== undefined) val = parseFloat(num.toPrecision(mapping.precision)).toString();
        }
      }
      if (mapping.unit) val = String(val) + mapping.unit;
      if (mapping.suffix) val = String(val) + mapping.suffix;
      let color = null;
      if (mapping.color_by_state && s.state in mapping.color_by_state) {
        color = mapping.color_by_state[s.state];
      }
      return { text: String(val), isMdi: isMdi, color: color, state: s.state };
    }
    return { text: "—", isMdi: false, color: null };
  }

  class OpenhaspMirrorCard extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._currentPage = 1;
      this._maxPage = 5;
      this._actionLog = [];
      this._dispCache = null;
    }

    static getConfigElement() {
      // Visuelles Config-Formular fuer den Card-Editor
      if (!customElements.get("openhasp-mirror-card-editor")) {
        class OpenhaspMirrorCardEditor extends HTMLElement {
          setConfig(config) {
            this._config = config;
            this.render();
          }
          render() {
            this.innerHTML = "";
            const style = document.createElement("style");
            style.textContent = `
              .ome-wrap { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
              .ome-row { display: flex; flex-direction: column; gap: 4px; }
              .ome-label { font-size: 0.9em; font-weight: 500; color: var(--primary-text-color); }
              .ome-input { padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.9em; }
              .ome-select { padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.9em; }
              .ome-hint { font-size: 0.75em; color: var(--secondary-text-color); }
            `;
            this.appendChild(style);

            const wrap = document.createElement("div");
            wrap.className = "ome-wrap";

            // Display (Dropdown)
            const rowDisplay = document.createElement("div");
            rowDisplay.className = "ome-row";
            const lblDisplay = document.createElement("div");
            lblDisplay.className = "ome-label";
            lblDisplay.textContent = "Display";
            const selDisplay = document.createElement("select");
            selDisplay.className = "ome-select";
            ["plate", "bad"].forEach(d => {
              const opt = document.createElement("option");
              opt.value = d;
              opt.textContent = d;
              if (this._config.display === d) opt.selected = true;
              selDisplay.appendChild(opt);
            });
            selDisplay.addEventListener("change", () => this._update("display", selDisplay.value));
            const hintDisplay = document.createElement("div");
            hintDisplay.className = "ome-hint";
            hintDisplay.textContent = "Welches openHASP-Display soll gespiegelt werden?";
            rowDisplay.appendChild(lblDisplay);
            rowDisplay.appendChild(selDisplay);
            rowDisplay.appendChild(hintDisplay);
            wrap.appendChild(rowDisplay);

            // Titel
            const rowTitle = document.createElement("div");
            rowTitle.className = "ome-row";
            const lblTitle = document.createElement("div");
            lblTitle.className = "ome-label";
            lblTitle.textContent = "Titel";
            const inpTitle = document.createElement("input");
            inpTitle.className = "ome-input";
            inpTitle.type = "text";
            inpTitle.value = this._config.title || "";
            inpTitle.placeholder = "z.B. WOHNZIMMER";
            inpTitle.addEventListener("change", () => this._update("title", inpTitle.value));
            rowTitle.appendChild(lblTitle);
            rowTitle.appendChild(inpTitle);
            wrap.appendChild(rowTitle);

            // Canvas-Size
            const rowSize = document.createElement("div");
            rowSize.className = "ome-row";
            const lblSize = document.createElement("div");
            lblSize.className = "ome-label";
            lblSize.textContent = "Maximale Display-Größe (px)";
            const inpSize = document.createElement("input");
            inpSize.className = "ome-input";
            inpSize.type = "number";
            inpSize.value = this._config.canvas_size || 380;
            inpSize.min = 100;
            inpSize.max = 600;
            inpSize.addEventListener("change", () => this._update("canvas_size", parseInt(inpSize.value) || 380));
            const hintSize = document.createElement("div");
            hintSize.className = "ome-hint";
            hintSize.textContent = "Auf dem Handy wird automatisch kleiner skaliert (Responsive).";
            rowSize.appendChild(lblSize);
            rowSize.appendChild(inpSize);
            rowSize.appendChild(hintSize);
            wrap.appendChild(rowSize);

            // Media-Entity
            const rowMedia = document.createElement("div");
            rowMedia.className = "ome-row";
            const lblMedia = document.createElement("div");
            lblMedia.className = "ome-label";
            lblMedia.textContent = "Media-Player Entity (für Album-Cover auf Page 5)";
            const inpMedia = document.createElement("input");
            inpMedia.className = "ome-input";
            inpMedia.type = "text";
            inpMedia.value = this._config.media_entity || "";
            inpMedia.placeholder = "media_player.wohnzimmer";
            inpMedia.addEventListener("change", () => this._update("media_entity", inpMedia.value));
            rowMedia.appendChild(lblMedia);
            rowMedia.appendChild(inpMedia);
            wrap.appendChild(rowMedia);

            // TTS-Text anzeigen (Checkbox)
            const rowTts = document.createElement("div");
            rowTts.className = "ome-row";
            const lblTts = document.createElement("div");
            lblTts.className = "ome-label";
            lblTts.textContent = "TTS-Ansagetext auf Media-Seite anzeigen";
            const chkTts = document.createElement("input");
            chkTts.type = "checkbox";
            chkTts.checked = this._config.show_tts_text !== false;
            chkTts.style.width = "18px";
            chkTts.style.height = "18px";
            chkTts.addEventListener("change", () => this._update("show_tts_text", chkTts.checked));
            const hintTts = document.createElement("div");
            hintTts.className = "ome-hint";
            hintTts.textContent = "Zeigt den gesprochenen Text statt '-' wenn die Soundbar eine TTS-Ansage abspielt.";
            rowTts.appendChild(lblTts);
            rowTts.appendChild(chkTts);
            rowTts.appendChild(hintTts);
            wrap.appendChild(rowTts);

            this.appendChild(wrap);
          }
          _update(key, value) {
            this._config = { ...this._config, [key]: value };
            this.dispatchEvent(new CustomEvent("config-changed", {
              detail: { config: this._config },
              bubbles: true,
            }));
          }
        }
        customElements.define("openhasp-mirror-card-editor", OpenhaspMirrorCardEditor);
      }
      return document.createElement("openhasp-mirror-card-editor");
    }
    static getStubConfig() { return { display: "plate", title: "PLATE", canvas_size: 380 }; }

    setConfig(config) {
      if (!config.display) throw new Error('"display" ist erforderlich');
      const display = String(config.display).toLowerCase();
      const entityMap = Object.assign({}, DEFAULT_ENTITY_MAP, config.entity_map || {});
      // Display-spezifische Anpassung der Birne (p1b19):
      // plate -> light.controller_rgb_ir_ae8feb (Wohnzimmer Schrank)
      // bad   -> light.deckenlicht_bad (Bad Deckenlicht)
      if (display === "plate" && entityMap["p1b19"] && entityMap["p1b19"]._plate_entity) {
        entityMap["p1b19"] = {
          entity: entityMap["p1b19"]._plate_entity,
          icon_by_state: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
          action: { service: "light.toggle", target: { entity_id: entityMap["p1b19"]._plate_entity } },
        };
      }
      // bad ist bereits Default (light.deckenlicht_bad)
      this._config = {
        display: display,
        title: config.title || String(config.display).toUpperCase(),
        pages_jsonl: config.pages_jsonl || PLATE_PAGES_JSONL,
        entity_map: entityMap,
        canvas_size: parseInt(config.canvas_size) || 380,
        media_entity: config.media_entity || "media_player.grundig_soundbar_85b1ecde_sendspin_bt_bridge",
        show_tts_text: config.show_tts_text !== false,
      };
      this._currentPage = 1;
      let maxP = 0;
      for (const item of this._config.pages_jsonl) {
        if (item.page !== undefined) maxP = Math.max(maxP, item.page);
      }
      this._maxPage = maxP;
      // ResizeObserver: passt canvas_size an verfuegbare Container-Breite an
      if (!this._resizeObserver) {
        this._resizeObserver = new ResizeObserver((entries) => {
          if (!entries || !entries[0]) return;
          const w = entries[0].contentRect.width;
          if (w > 0) {
            // Maximal canvas_size (380), aber nie groesser als Container minus Padding
            const newSize = Math.min(this._config.canvas_size, Math.floor(w - 24));
            if (newSize !== this._currentSize && newSize > 100) {
              this._currentSize = newSize;
              this._render();
            }
          }
        });
        this._resizeObserver.observe(this);
      }
    }

    set hass(hass) {
      this._hass = hass;
      // Page-Sync via number.<display>_page_number
      const pn = hass.states && hass.states["number." + this._config.display + "_page_number"];
      if (pn) {
        const p = parseInt(pn.state);
        if (!isNaN(p) && p >= 0 && p <= this._maxPage && p !== this._currentPage) {
          this._currentPage = p;
        }
      }
      // Cache: openhasp.<display> Status
      // WICHTIG: Wir ueberschreiben den Cache nur wenn die entity im aktuellen hass-update
      // vorhanden ist. Falls sie fehlt (Page 3/4 brauchen sie nicht), behalten wir den letzten
      // bekannten Status.
      const disp = hass.states && hass.states["openhasp." + this._config.display];
      if (disp) {
        this._dispCache = { state: disp.state, attrs: disp.attributes || {} };
      }
      this._render();
    }

    _invokeAction(action) {
      if (!action || !this._hass || !this._hass.callService) return;
      const service = action.service;
      if (!service || !service.includes(".")) return;
      const [domain, name] = service.split(".");
      this._hass.callService(domain, name, action.data || {}, action.target || {});
      this._actionLog.unshift({
        time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        text: service
      });
      this._actionLog = this._actionLog.slice(0, 3);
      this._render();
    }

    _parsePages() {
      const pages = {};
      let cur = null;
      for (const item of this._config.pages_jsonl) {
        if (item.page !== undefined) {
          cur = item.page;
          if (!pages[cur]) pages[cur] = { bg_color: "#000000", objects: [] };
          if (item.bg_color) pages[cur].bg_color = item.bg_color;
        } else if (cur !== null) {
          pages[cur].objects.push(item);
        }
      }
      return pages;
    }

    _renderObj(obj, scale, pageNum) {
      const key = "p" + pageNum + "b" + obj.id;
      const mapping = this._config.entity_map[key];
      const r = resolveValue(mapping, this._hass);

      // Text-Prioritaet:
      // 1) mapping-resultat (entity-wert, template, icon)
      // 2) obj.text (z.B. label "Es hat geklingelt" oder statischer Text)
      let text = r.text;
      if (text == null || text === "") text = obj.text || null;

      // TTS-Ansage auf der Media-Seite (p5b11/p5b12):
      // Der Soundbar ist ein Music-Assistant-Player: TTS-Ansagen haben
      // media_content_type "music" und KEINEN media_title/media_artist.
      // Erkennung: Player spielt, aber es gibt keinen Titel -> Ansage.
      if (this._config.show_tts_text && (key === "p5b11" || key === "p5b12")) {
        const mp = this._hass && this._hass.states && this._hass.states[this._config.media_entity];
        if (mp && mp.state === "playing" && mp.attributes) {
          const title = mp.attributes.media_title;
          const artist = mp.attributes.media_artist;
          const hasTitle = title && String(title).trim() !== "" && title !== "—";
          const hasArtist = artist && String(artist).trim() !== "" && artist !== "—";
          // Kein Titel UND kein Interpret -> es ist eine Ansage (TTS), kein Song
          if (!hasTitle && !hasArtist) {
            text = (key === "p5b11") ? "Sprachansage" : "";
          }
        }
      }

      // LVGL-Sonderzeichen mappen (z.B. "BELL" -> "🔔")
      if (obj.obj === "btn" && text && LVGL_TEXT_ICONS[text]) {
        text = LVGL_TEXT_ICONS[text];
      }

      const textColor = r.color || (obj.text_color || "#a9a9a9");
      const bgColor = obj.bg_color || "transparent";
      const bgOpa = obj.bg_opa !== undefined ? obj.bg_opa : 255;
      const borderColor = obj.border_color || "transparent";
      const borderWidth = obj.border_width || 0;
      const radius = obj.radius || 0;
      const fontSize = obj.text_font || 24;
      const align = obj.align || "center";

      const x = (obj.x || 0) * scale;
      const y = (obj.y || 0) * scale;
      const w = (obj.w || 50) * scale;
      const h = (obj.h || 30) * scale;

      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = w + "px";
      el.style.height = h + "px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = align === "right" ? "flex-end" : (align === "left" ? "flex-start" : "center");
      el.style.color = textColor;
      el.style.overflow = "hidden";
      el.style.whiteSpace = "nowrap";
      el.style.textOverflow = "ellipsis";
      el.style.boxSizing = "border-box";
      el.style.padding = "0 4px";
      el.style.lineHeight = "1.1";

      // FontSize: MDI gross, Text auto-shrink, Emoji auto-font
      const scaledFont = fontSize * scale;
      let actualFont = scaledFont;
      // Emoji-Detection: Wenn text ein Unicode-Emoji enthaelt (z.B. 💡, 🔔, 🔒)
      const isEmoji = r.isMdi || (text && /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/u.test(text));
      if (isEmoji) {
        actualFont = Math.min(scaledFont * 2, Math.min(w, h) * 0.95);
        if (actualFont < 14) actualFont = 14;
        el.style.fontFamily = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', emoji, sans-serif";
        el.style.fontWeight = "normal";
        el.style.lineHeight = "1";
      } else {
        const charWidth = scaledFont * 0.6;
        const maxChars = Math.floor((w - 8) / charWidth);
        if (text && text.length > maxChars && maxChars > 0) {
          actualFont = Math.floor((w - 8) / (text.length * 0.6));
          if (actualFont < 8) actualFont = 8;
        }
        el.style.fontFamily = "'Courier New', Consolas, monospace";
        el.style.fontWeight = "500";
      }
      el.style.fontSize = actualFont + "px";

      if (obj.obj === "btn" || obj.obj === "obj") {
        el.style.background = hexToRgba(bgColor, bgOpa);
        if (borderWidth > 0) {
          el.style.border = (borderWidth * scale) + "px solid " + borderColor;
        }
        if (radius > 0) el.style.borderRadius = (radius * scale) + "px";
      }

      // Lightbulb im off-State etwas blasser
      if (mapping && mapping.entity === "light.controller_rgb_ir_ae8feb" && r.state === "off") {
        el.style.opacity = "0.4";
      }

      // Klickbare Buttons
      if (obj.obj === "btn" && mapping && mapping.action) {
        el.style.cursor = "pointer";
        el.style.transition = "all 0.1s";
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._invokeAction(mapping.action);
        });
      }

      // Cover-Image (p5b10)
      if (obj.obj === "img") {
        const mp = this._hass.states && this._hass.states[this._config.media_entity];
        if (mp && mp.attributes && mp.attributes.entity_picture) {
          el.style.backgroundImage = "url(" + mp.attributes.entity_picture + ")";
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.style.borderRadius = "8px";
        } else {
          el.style.background = "#1a1a1a";
          el.style.color = "#444";
          text = "—";
        }
        el.textContent = text || "";
        return el;
      }

      el.textContent = text || "";
      return el;
    }

    _render() {
      if (!this._shadow || !this._hass) return;

      const pages = this._parsePages();
      const dispState = (this._dispCache && this._dispCache.state) || "0";
      const dispAttrs = (this._dispCache && this._dispCache.attrs) || {};
      const dispOnline = dispState === "1" || (dispAttrs && dispAttrs.ip);

      // Responsive Groesse: _currentSize vom ResizeObserver, sonst direkt messen
      let size = this._currentSize || this._config.canvas_size;
      // Sicherheits-Fallback: nie breiter als Container oder Viewport
      const containerW = this.clientWidth || 0;
      const viewportW = (typeof window !== "undefined" && window.innerWidth) || 9999;
      const maxW = Math.min(containerW, viewportW) - 24;
      if (maxW > 100 && size > maxW) size = maxW;
      const scale = size / 480;
      const navH = 60 * scale;

      // CSS mit MDI-Font vom CDN
      const css = "@font-face{font-family:'MDI-Local';src:url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/fonts/materialdesignicons-webfont.woff2') format('woff2');font-weight:normal;font-style:normal;}"
        + ":host{display:block;}"
        + ".wrap{background:rgba(20,20,24,0.7);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:none;border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:none;}"
        + ".title{color:#aaa;font-size:0.8em;letter-spacing:0.2em;text-transform:uppercase;text-align:center;font-family:sans-serif;}"
        + ".dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;}"
        + ".disp{position:relative;width:" + size + "px;height:" + size + "px;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.5);}"
        + ".nav{position:absolute;bottom:0;left:0;width:100%;height:" + navH + "px;display:flex;background:#0a0a0a;border-top:1px solid #1a1a1a;}"
        + ".nb{flex:1;background:rgba(75,75,75,0.7);border:" + (3 * scale) + "px solid #3a0aa8;color:#a9a9a9;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:'MDI-Local','Apple Symbols','Segoe UI Symbol',sans-serif;font-size:" + (40 * scale) + "px;line-height:1;}"
        + ".nb:hover{color:#ffd700;border-color:#ffd700;}"
        + ".nb.on{background:#3a0aa8;color:#fff;}"
        + ".log{color:#8f8;font-size:0.7em;font-family:monospace;padding:4px;min-height:1.2em;text-align:center;}"
        + ".foot{color:#444;font-size:0.65em;text-align:center;letter-spacing:0.1em;font-family:sans-serif;padding:2px;}";

      // DOM aufbauen
      this._shadow.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = css;
      this._shadow.appendChild(style);

      const wrap = document.createElement("ha-card");
      wrap.className = "wrap";

      // Titel mit Status-Dot
      const title = document.createElement("div");
      title.className = "title";
      const dotColor = dispOnline ? "#43a047" : "#f44336";
      title.innerHTML = '<span class="dot" style="background:' + dotColor + '"></span>' + this._escape(this._config.title);
      wrap.appendChild(title);

      // Display-Container
      const disp = document.createElement("div");
      disp.className = "disp";

      // Page-Hintergrund
      const page = pages[this._currentPage] || { bg_color: "#000000", objects: [] };
      disp.style.background = page.bg_color;

      // Page 0 hat keine Page-Nummer im JSONL-Array - parsePages vergibt sie als page 0
      // Page 0 enthaelt die Navigations-Buttons (Prev, Home, Next) im openHASP-Layout
      // Wir behandeln Page 0 als spezielle Navigationsleiste und blenden sie ein/aus
      const isPageZero = (this._currentPage === 0);

      // Objekte rendern
      for (const obj of page.objects) {
        if (obj.obj === "obj" && (obj.bg_opa || 0) <= 5) continue; // skip transparent bg
        const el = this._renderObj(obj, scale, this._currentPage);
        disp.appendChild(el);
      }

      // Nav-Bar: 4 Buttons im openHASP-Layout
      // Im Original: ◀ | Haus | ♫ | ▶  mit Action page prev/next/home
      const nav = document.createElement("div");
      nav.className = "nav";
      const navBtns = [
        { ic: "\u25C0", page: 0, action: "prev", t: "Prev Page" },  // ◀
        { ic: "\u{1F3E0}", page: 1, action: "home", t: "Info (P1)" },  // 🏠
        { ic: "\u{1F3B5}", page: 3, action: "home", t: "Radio (P3)" }, // 🎵
        { ic: "\u25B6", page: 5, action: "next", t: "Next Page" },     // ▶
      ];
      for (const b of navBtns) {
        const btn = document.createElement("button");
        btn.className = "nb" + (b.page === this._currentPage ? " on" : "");
        btn.textContent = b.ic;
        btn.title = b.t;
        btn.type = "button";
        btn.addEventListener("click", () => {
          let targetPage = b.page;
          // Prev/Next: aktuelle Page +/- 1, wraparound
          if (b.action === "prev") {
            targetPage = this._currentPage - 1;
            if (targetPage < 0) targetPage = this._maxPage;
          } else if (b.action === "next") {
            targetPage = this._currentPage + 1;
            if (targetPage > this._maxPage) targetPage = 0;
          }
          this._currentPage = targetPage;
          this._render();
          if (this._hass && this._hass.callService) {
            const pn = "number." + this._config.display + "_page_number";
            if (this._hass.states && this._hass.states[pn]) {
              this._hass.callService("number", "set_value", { value: targetPage }, { entity_id: pn });
            } else {
              this._hass.callService("openhasp", "change_page", { page: targetPage }, { entity_id: "openhasp." + this._config.display });
            }
          }
        });
        nav.appendChild(btn);
      }
      disp.appendChild(nav);

      wrap.appendChild(disp);

      // Action-Log
      const log = document.createElement("div");
      log.className = "log";
      if (this._actionLog && this._actionLog.length > 0) {
        log.textContent = "\u25B6 " + this._actionLog[0].time + " " + this._actionLog[0].text;
      } else {
        log.innerHTML = "&nbsp;";
      }
      wrap.appendChild(log);

      // Footer
      const foot = document.createElement("div");
      foot.className = "foot";
      if (dispOnline) {
        foot.textContent = "b" + this._config.display + " | " + (dispAttrs.ip || "?") + " | rssi " + (dispAttrs.rssi || "?") + " | v" + (dispAttrs.version || "?");
      } else {
        foot.textContent = "openhasp." + this._config.display + " OFFLINE";
      }
      wrap.appendChild(foot);

      this._shadow.appendChild(wrap);
    }

    _escape(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    getCardSize() { return 5; }
  }

  if (!customElements.get("openhasp-mirror-card")) {
    customElements.define("openhasp-mirror-card", OpenhaspMirrorCard);
  }

  if (window.customCards) {
    window.customCards.push({
      type: "openhasp-mirror-card",
      name: "openHASP Mirror Card",
      description: "openHASP Display Emulator (v8.0)",
      preview: false,
    });
  }

  console.info("[openhasp-mirror-card] v1.0.1 geladen (TTS-Erkennung Music-Assistant)");
})();