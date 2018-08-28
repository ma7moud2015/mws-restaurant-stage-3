    var CACHE_VERSION = 'restaurants-001';
    var IMAGES_CASHES = 'restaurantImgs';
    var ALLCACHES = [CACHE_VERSION, IMAGES_CASHES];
    var CACHE_FILES = [
    './',
    './index.html',
	'./register.js',
	'./sw.js',
	'./manifest.json',
    './restaurant.html',
    './css/',
    './css/styles.css',
	'./css/star.png',
    './js/',
    './js/restaurant_info.js',
    './js/dbhelper.js',
	'./js/idb.js',
	'./js/bundle.js',
	'./js/bundle2.js',
	'./idb.js',
    './img/',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
	"http://localhost:1337/restaurants",
	"http://localhost:1337/reviews",
	'./Icons/travel management.ico',
	'./Icons/Crpetas Coffe PAris By Canelita309 (4).png'];
    self.addEventListener('install', function (event) {
      event.waitUntil(caches.open(CACHE_VERSION).then(function (cache) {
        return cache.addAll(CACHE_FILES);
      }));
    });

    self.addEventListener('activate', function (event) {
      event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('restaurant-') && !ALLCACHES.includes(cacheName);
        }).map(function (cacheName) {
          return caches['delete'](cacheName);
        }));
      }));
    });

    self.addEventListener('fetch', function (event) {
      var requestUrl = new URL(event.request.url);

      if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
          event.respondWith(caches.match('/'));
          return;
        }
      }

      event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      }));
    });


