const AD_HOST_PATTERNS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googletagmanager.com',
  'google-analytics.com',
  'imasdk.googleapis.com',
  'gamedistribution.com',
  'crazygames.com',
  'yandex.ru',
  'yandex.net',
  'yandex.com',
  'poki.com',
  'poki.io',
  'game-cdn.poki.com',
  'serve.app.playsaurus.com',
  'glance-cdn.com',
  'highperformanceformat.com'
];

const AD_PATH_PATTERNS = [
  'adsbygoogle',
  'adservice',
  'ad-campaigns',
  'ima3.js',
  'sdkloader/ima',
  'yandex-sdk',
  'poki-sdk',
  'gamedistribution',
  'crazygames-sdk',
  'gamesad.js',
  'adsdk.js',
  'invoke.js'
];

const STUB_SCRIPT = `
(() => {
  const noop = () => {};
  const resolved = value => Promise.resolve(value);
  self.adsbygoogle = self.adsbygoogle || { push: noop };
  self.adBreak = self.adBreak || noop;
  self.adConfig = self.adConfig || noop;
  self.PokiSDK = self.PokiSDK || {
    init: () => resolved(),
    gameLoadingStart: noop,
    gameLoadingFinished: noop,
    gameplayStart: noop,
    gameplayStop: noop,
    commercialBreak: () => resolved(),
    rewardedBreak: () => resolved(false),
    setDebug: noop,
    shareableURL: () => resolved(location.href)
  };
  const adv = {
    showFullscreenAdv: options => { options?.callbacks?.onClose?.(true); },
    showRewardedVideo: options => { options?.callbacks?.onOpen?.(); options?.callbacks?.onRewarded?.(); options?.callbacks?.onClose?.(); },
    showBannerAdv: () => resolved(),
    hideBannerAdv: () => resolved(),
    getBannerAdvStatus: () => resolved({ stickyAdvIsShowing: false, reason: 'blocked' })
  };
  self.YaGames = self.YaGames || {
    init: () => resolved({
      adv,
      getLeaderboards: () => resolved({}),
      getPlayer: () => resolved({ getData: () => resolved({}), setData: () => resolved(), getMode: () => 'lite' }),
      getPayments: () => resolved({ getCatalog: () => resolved([]), getPurchases: () => resolved([]) }),
      feedback: { canReview: () => resolved({ value: false }), requestReview: () => resolved({ feedbackSent: false }) },
      shortcut: { canShowPrompt: () => resolved({ canShow: false }), showPrompt: () => resolved({ outcome: 'dismissed' }) },
      getFlags: () => resolved({}),
      environment: { i18n: { lang: 'en', tld: 'com' }, browser: { lang: 'en' }, app: { id: '' }, payload: '' },
      deviceInfo: { type: 'desktop', isMobile: () => false, isDesktop: () => true, isTablet: () => false, isTV: () => false }
    })
  };
  self.CrazyGames = self.CrazyGames || { SDK: { init: () => resolved(), ad: { requestAd: () => resolved() }, gameplay: { start: noop, stop: noop } } };
})();
`;

function isAdRequest(request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const path = (url.pathname + url.search).toLowerCase();
  return AD_HOST_PATTERNS.some(pattern => host === pattern || host.endsWith('.' + pattern)) ||
    AD_PATH_PATTERNS.some(pattern => path.includes(pattern));
}

function emptyResponseFor(request) {
  const destination = request.destination;
  if (destination === 'script' || /\.m?js($|[?#])/i.test(new URL(request.url).pathname)) {
    return new Response(STUB_SCRIPT, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }
  if (destination === 'image') {
    return new Response('', { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  return new Response('', {
    status: 204,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (isAdRequest(event.request)) {
    event.respondWith(emptyResponseFor(event.request));
  }
});
