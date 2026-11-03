/* Copyright (c) 2026 mansoor0x | 1_X @ZeroMan. */
/* Wait for the offline cache to finish before starting the exploit modules. */
(function () {
  var target = "exploit.html?log=1&afterglow=run&mode=goldhen";
  var status = document.getElementById("status");
  var appCache = window.applicationCache;
  var started = false;
  var timer = null;

  function say(message) {
    if (status) status.textContent = message;
  }
  function launch() {
    if (started) return;
    started = true;
    if (timer) window.clearTimeout(timer);
    say("Cache ready — launching GoldHEN...");
    window.setTimeout(function () { window.location.replace(target); }, 700);
  }
  function cacheState() {
    if (!appCache) { launch(); return; }
    try {
      /* IDLE means the manifest cache is ready; UPDATEREADY means swap it in. */
      if (appCache.status === appCache.IDLE || appCache.status === appCache.UPDATEREADY || appCache.status === appCache.OBSOLETE) {
        if (appCache.status === appCache.UPDATEREADY) {
          try { appCache.swapCache(); } catch (e) {}
        }
        launch();
      } else if (appCache.status === appCache.CHECKING || appCache.status === appCache.DOWNLOADING) {
        say("Downloading offline cache — please wait...");
      }
    } catch (e) {
      say("Checking cache — please wait...");
    }
  }

  if (!appCache) { launch(); return; }
  say("Preparing offline cache — please wait...");
  ["cached", "noupdate", "updateready", "obsolete"].forEach(function (eventName) {
    appCache.addEventListener(eventName, function () {
      if (eventName === "updateready") {
        try { appCache.swapCache(); } catch (e) {}
      }
      launch();
    }, false);
  });
  appCache.addEventListener("error", function () {
    /* A cache error should not leave the user on a permanent loading screen;
       the browser can still fetch the files from the network. */
    say("Cache unavailable — trying online mode...");
    window.setTimeout(launch, 2500);
  }, false);
  appCache.addEventListener("progress", function (event) {
    if (event && event.total) say("Caching files: " + event.loaded + "/" + event.total);
    else say("Downloading offline cache — please wait...");
  }, false);

  cacheState();
  /* Fallback for browsers that never deliver an AppCache completion event. */
  timer = window.setTimeout(function () {
    say("Cache wait timed out — trying to launch...");
    launch();
  }, 60000);
})();
