console.log("Zoom/Pan Options is setting up...");


function getSetting(settingName) {
  return game.settings.get("zoom-pan-options", settingName)
}

let cumulativeRotationDelta = 0

function _onWheel_Override(event) {
  const touchpad = getSetting("touchpad-scroll")
  if (event.deltaY === 0 && !touchpad)
    return

  // Prevent zooming the entire browser window
  if (event.ctrlKey) event.preventDefault();

  // Handle wheel events for the canvas if it is ready and if it is our hover target
  let hover = document.elementFromPoint(event.clientX, event.clientY);
  if (canvas && canvas.ready && hover && (hover.id === "board")) {
    event.preventDefault();
    let layer = canvas.activeLayer;
    let isCtrl = event.ctrlKey || event.metaKey, isShift = event.shiftKey;

    // Case 1 - rotate tokens or tiles
    if (layer instanceof PlaceablesLayer && (isShift || (isCtrl && !touchpad))) {
      if (touchpad && isShift) {
        cumulativeRotationDelta += event.deltaY
        const threshold = getSetting('touchpad-rotation-threshold')
        if (Math.abs(cumulativeRotationDelta) >= threshold) {
          cumulativeRotationDelta -= threshold * Math.sign(cumulativeRotationDelta)
          layer._onMouseWheel({
            deltaY: Math.sign(cumulativeRotationDelta), // only the sign matters
            isShift: false
          })
        }
      } else
        layer._onMouseWheel(event)
    }
    // Case 2 - zoom the canvas (touchpad pinch, or normal scroll)
    else if (isCtrl || !touchpad) zoom(event)
    // Case 3 - pan the canvas (touchpad scroll)
    else panWithTouchpad(event);
  }
}

function _constrainView_Override({x, y, scale}) {
  const d = canvas.dimensions;

  // Constrain the maximum zoom level
  if (Number.isNumeric(scale) && (scale !== this.stage.scale.x)) {
    const max = CONFIG.Canvas.maxZoom;
    const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
    if (getSetting("disable-zoom-rounding"))
      scale = Math.clamped(scale, 1 / ratio, max);
    else
      scale = Math.round(Math.clamped(scale, 1 / ratio, max) * 100) / 100;
  } else {
    scale = this.stage.scale.x;
  }

  // Constrain the pivot point using the new scale
  if (Number.isNumeric(x) && x !== this.stage.pivot.x) {
    const padw = 0.4 * (window.innerWidth / scale);
    x = Math.clamped(x, -padw, d.width + padw);
  } else x = this.stage.pivot.x;
  if (Number.isNumeric(y) && x !== this.stage.pivot.y) {
    const padh = 0.4 * (window.innerHeight / scale);
    y = Math.clamped(y, -padh, d.height + padh);
  } else y = this.stage.pivot.y;

  // Return the constrained view dimensions
  return {x, y, scale};
}

/**
 * Will zoom around cursor, and based on delta.
 */
function zoom(event) {
  const multiplier = getSetting("zoom-speed-multiplier")
  let dz = (-event.deltaY) * 0.0005 * multiplier + 1
  if (!getSetting("zoom-around-cursor")) {
    canvas.pan({scale: dz * canvas.stage.scale.x});
    return;
  }
  const scale = dz * canvas.stage.scale.x;
  const d = canvas.dimensions;
  const max = CONFIG.Canvas.maxZoom;
  const min = 1 / Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
  if (scale > max || scale < min) {
    canvas.pan({scale: scale > max ? max : min});
    console.log(`Zoom/Pan Options | scale limit reached (${scale}).`)
    return
  }
  // Acquire the cursor position transformed to Canvas coordinates
  const t = canvas.stage.worldTransform;
  const dx = ((-t.tx + event.clientX) / canvas.stage.scale.x - canvas.stage.pivot.x) * (dz - 1);
  const dy = ((-t.ty + event.clientY) / canvas.stage.scale.y - canvas.stage.pivot.y) * (dz - 1);
  const x = canvas.stage.pivot.x + dx;
  const y = canvas.stage.pivot.y + dy;
  canvas.pan({x, y, scale});
}

function panWithTouchpad(event) {
  cumulativeRotationDelta = 0  // (this doesn't really belong here but I just don't want it to carry over if user makes mistakes)
  const multiplier = 1 / canvas.stage.scale.x * getSetting('pan-speed-multiplier')
  const x = canvas.stage.pivot.x + event.deltaX * multiplier
  const y = canvas.stage.pivot.y + event.deltaY * multiplier
  canvas.pan({x, y})
}

Hooks.on("init", function () {
  game.settings.register("zoom-pan-options", "zoom-around-cursor", {
    name: "Zoom around cursor",
    hint: "Center zooming around cursor. Does not apply to zooming with pageup or pagedown.",
    scope: "client",
    config: true,
    default: true,
    type: Boolean
  })
  game.settings.register("zoom-pan-options", "touchpad-scroll", {
    name: "Zoom by pinching, pan by dragging (Touchpad mode)",
    hint: "Pan with two-finger drag (or vertical/horizontal scroll)." +
      " Zoom with two-finger pinch (or Ctrl+scroll)." +
      " Precisely rotate a token with Ctrl+Shift+scroll.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean
  })
  game.settings.register("zoom-pan-options", "disable-zoom-rounding", {
    name: "Disable zoom rounding",
    hint: "Disables default Foundry behavior, which rounds zoom to the nearest 1%. Will make zooming smoother, especially for touchpad users.",
    scope: "client",
    config: true,
    default: true,
    type: Boolean
  })
  game.settings.register("zoom-pan-options", "zoom-speed-multiplier", {
    name: "Zoom speed",
    hint: "Multiplies zoom speed, affecting scaling speed. Defaults to 1 (5% zoom per mouse tick). 0.1 or 10 might be better for some touchpads.",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    range: {
      min: 0.1,
      max: 10,
      step: 0.1,
    },
  })
  game.settings.register("zoom-pan-options", "pan-speed-multiplier", {
    name: "Pan speed",
    hint: "Multiplies pan speed, for touchpads. Defaults to 1, which should be close to the pan speed when right-click-dragging the canvas.",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    range: {
      min: 0.1,
      max: 10,
      step: 0.1,
    },
  })
  game.settings.register("zoom-pan-options", "touchpad-rotation-threshold", {
    name: "Touchpad rotation sensitivity threshold",
    hint: "Prevents over-sensitive token rotation. Defaults to 50. Applies to shift+panning (touchpad).",
    scope: "client",
    config: true,
    default: 50,
    type: Number,
    range: {
      min: 1,
      max: 200,
      step: 1,
    },
  })
  KeyboardManager.prototype._onWheel = _onWheel_Override;
  Canvas.prototype._constrainView = _constrainView_Override
  console.log("Zoom/Pan Options is done setting up!");
});