/**
 * Service Worker for BodyParts3D
 * 缓存策略：Cache First, then Network
 */

const CACHE_NAME = 'bodyparts3d-v1';
const STATIC_CACHE = 'bodyparts3d-static-v1';
const MODEL_CACHE = 'bodyparts3d-models-v1';

// 需要预缓存的核心静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/js/OrbitControls.js',
    '/js/OBJLoader.js',
    '/js/model-loader.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Install failed:', err))
    );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![STATIC_CACHE, MODEL_CACHE].includes(cacheName)) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 获取请求的策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 1. 静态资源：Cache First
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }
    
    // 2. OBJ模型文件：Cache First with background update
    if (isModelFile(url)) {
        event.respondWith(modelCacheStrategy(request));
        return;
    }
    
    // 3. 其他请求：Network First
    event.respondWith(networkFirst(request));
});

function isStaticAsset(url) {
    const staticExts = ['.js', '.css', '.html', '.svg', '.png', '.jpg', '.woff', '.woff2'];
    return staticExts.some(ext => url.pathname.endsWith(ext)) ||
           url.hostname === 'cdn.tailwindcss.com' ||
           url.hostname === 'cdnjs.cloudflare.com';
}

function isModelFile(url) {
    return url.pathname.endsWith('.obj') || url.pathname.includes('partof_BP3D');
}

// Cache First 策略
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        // 后台更新缓存
        fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
        }).catch(() => {});
        return cached;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First 策略
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        throw error;
    }
}

// 模型文件专用缓存策略（Cache First，带后台更新）
async function modelCacheStrategy(request) {
    const cache = await caches.open(MODEL_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        // 后台检查更新
        fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                // 比较内容是否变化（通过ETag或Last-Modified）
                const cachedETag = cached.headers.get('ETag');
                const networkETag = networkResponse.headers.get('ETag');
                
                if (!cachedETag || cachedETag !== networkETag) {
                    console.log('[SW] Updating model:', request.url);
                    cache.put(request, networkResponse.clone());
                }
            }
        }).catch(() => {});
        
        return cached;
    }
    
    // 未缓存，从网络获取
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Model fetch failed:', error);
        return new Response('Model unavailable offline', { status: 503 });
    }
}

// 处理消息（来自主线程）
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    // 预缓存指定模型文件
    if (event.data.type === 'precache-models') {
        const modelUrls = event.data.urls;
        event.waitUntil(
            caches.open(MODEL_CACHE).then(cache => {
                return Promise.all(
                    modelUrls.map(url => 
                        fetch(url).then(res => {
                            if (res.ok) return cache.put(url, res);
                        }).catch(err => console.warn('[SW] Precache failed:', url))
                    )
                );
            })
        );
    }
    
    // 清理模型缓存
    if (event.data.type === 'clear-model-cache') {
        event.waitUntil(
            caches.delete(MODEL_CACHE).then(() => {
                console.log('[SW] Model cache cleared');
            })
        );
    }
});
