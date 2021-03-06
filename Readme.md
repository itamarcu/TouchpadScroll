# [Zoom/Pan Options](https://foundryvtt.com/packages/zoom-pan-options/)

FoundryVTT module to change mouse scroll behavior. It has four settings, which can be toggled individually, and stored locally (per client).

To install, browse for it in the module browser, or [directly copy the manifest link (module.json)](https://raw.githubusercontent.com/itamarcu/ZoomPanOptions/master/module.json).

# Features

## Zoom around cursor
- When zooming in and out, the camera will zoom "around" the cursor, like in many other applications.
- This does not affect PageUp, PageDown, or Numpad +/-. Those will still zoom into or out of the center of the screen.

## Disable zoom rounding
- Disables default Foundry behavior, which rounds zoom to the nearest 1%. Will make zooming smoother, especially for touchpad users.
 
## Touchpad Scrolling (also useful for Magic Mouse)
- Vertical mouse scroll will now pan up and down (instead of zooming)
- Horizontal mouse scroll will now pan left and right
- Panning with two fingers on a touchpad should use these two and should be nicer
- Ctrl+scroll will now zoom in and out (like previous vertical scroll) (instead of precisely rotating a token)
- Pinching with two fingers on a touchpad should use this and should be nice
- Shift+Ctrl+scroll will now precisely rotate a token (like previous ctrl+scroll)

## Zoom speed multiplier
- Useful if your zoom is too sensitive, or not sensitive enough. A value of 0.1, 10, or 20 might work for you.

# Credits

Thanks, mrkwnzl#7407, for the touchpad support!

# [Canvas Scroll](https://github.com/ElfFriend-DnD/foundryvtt-canvasScroll)
Apparently this module was developed at the same time this one was, and can do something very similar. Oops!

# [Cursor Zoom](https://github.com/itamarcu/CursorZoom)
My old foundry module, that only had the "Zoom around cursor" feature, and did not allow configuring it in the settings for each player.
If you were a user of Cursor Zoom, please uninstall it and install this module. Your players will be able to each set their own preference.
