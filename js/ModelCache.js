/**
 * ModelCache - IndexedDB 缓存管理器
 * 用于缓存解析后的3D模型数据，避免重复解析OBJ文件
 */

class ModelCache {
    constructor() {
        this.dbName = 'BodyParts3D_DB';
        this.dbVersion = 1;
        this.db = null;
        this.isOpen = false;
        this.initFailed = false; // 标记初始化是否失败
        this.initPromise = null; // 避免重复初始化
        this.memoryCache = new Map(); // 内存缓存，提升二次访问速度
    }

    /**
     * 初始化数据库
     */
    async init() {
        if (this.isOpen) return;
        if (this.initFailed) throw new Error('IndexedDB init previously failed');
        if (this.initPromise) return this.initPromise; // 避免重复初始化
        
        // 检查浏览器是否支持 IndexedDB
        if (!window.indexedDB) {
            this.initFailed = true;
            throw new Error('IndexedDB not supported');
        }
        
        this.initPromise = new Promise((resolve, reject) => {
            let request;
            try {
                request = indexedDB.open(this.dbName, this.dbVersion);
            } catch (e) {
                this.initFailed = true;
                reject(new Error('Failed to open IndexedDB: ' + e.message));
                return;
            }
            
            request.onerror = (event) => {
                console.warn('[ModelCache] IndexedDB error:', request.error);
                this.initFailed = true;
                reject(request.error || new Error('IndexedDB error'));
            };
            
            request.onblocked = () => {
                console.warn('[ModelCache] IndexedDB blocked');
                this.initFailed = true;
                reject(new Error('IndexedDB blocked'));
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                this.isOpen = true;
                console.log('[ModelCache] Database opened');
                
                // 处理数据库连接错误
                this.db.onerror = (event) => {
                    console.warn('[ModelCache] Database error:', event.target.error);
                };
                
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 存储解析后的几何体数据
                if (!db.objectStoreNames.contains('geometries')) {
                    const geometryStore = db.createObjectStore('geometries', { keyPath: 'fileName' });
                    geometryStore.createIndex('timestamp', 'timestamp', { unique: false });
                    geometryStore.createIndex('version', 'version', { unique: false });
                }
                
                // 存储模型元数据
                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'key' });
                }
                
                // 存储缓存统计信息
                if (!db.objectStoreNames.contains('stats')) {
                    db.createObjectStore('stats', { keyPath: 'key' });
                }
            };
        });
        
        return this.initPromise;
    }

    /**
     * 缓存几何体数据
     * @param {string} fileName - 模型文件名
     * @param {Object} geometryData - 几何体数据对象
     */
    async cacheGeometry(fileName, geometryData) {
        // 如果初始化失败，跳过缓存
        if (this.initFailed) return;
        
        try {
            await this.init();
        } catch (e) {
            return;
        }
        
        const data = {
            fileName,
            timestamp: Date.now(),
            version: this.getCacheVersion(),
            // 存储顶点数据
            vertices: Array.from(geometryData.vertices || []),
            normals: Array.from(geometryData.normals || []),
            uvs: Array.from(geometryData.uvs || []),
            indices: Array.from(geometryData.indices || []),
            // 边界框信息
            boundingBox: geometryData.boundingBox || null,
            // 文件大小信息
            fileSize: geometryData.fileSize || 0
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readwrite');
            const store = transaction.objectStore('geometries');
            const request = store.put(data);
            
            request.onsuccess = () => {
                // 同时更新内存缓存
                this.memoryCache.set(fileName, geometryData);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 从缓存获取几何体数据
     * @param {string} fileName - 模型文件名
     * @returns {Object|null} 几何体数据或null
     */
    async getGeometry(fileName) {
        // 先检查内存缓存
        if (this.memoryCache.has(fileName)) {
            return this.memoryCache.get(fileName);
        }
        
        // 如果初始化失败，直接返回 null
        if (this.initFailed) return null;
        
        try {
            await this.init();
        } catch (e) {
            return null;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readonly');
            const store = transaction.objectStore('geometries');
            const request = store.get(fileName);
            
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    // 恢复为Float32Array等类型
                    const geometryData = {
                        fileName: data.fileName,
                        vertices: new Float32Array(data.vertices),
                        normals: new Float32Array(data.normals),
                        uvs: data.uvs.length > 0 ? new Float32Array(data.uvs) : null,
                        indices: data.indices.length > 0 ? new Uint32Array(data.indices) : null,
                        boundingBox: data.boundingBox,
                        fileSize: data.fileSize
                    };
                    // 存入内存缓存
                    this.memoryCache.set(fileName, geometryData);
                    resolve(geometryData);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 检查是否有缓存
     * @param {string} fileName - 模型文件名
     */
    async hasGeometry(fileName) {
        // 检查内存缓存
        if (this.memoryCache.has(fileName)) return true;
        
        // 如果初始化失败，直接返回 false
        if (this.initFailed) return false;
        
        try {
            await this.init();
        } catch (e) {
            return false;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readonly');
            const store = transaction.objectStore('geometries');
            const request = store.count(fileName);
            
            request.onsuccess = () => resolve(request.result > 0);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 批量预加载几何体到内存缓存
     * @param {string[]} fileNames - 文件名列表
     */
    async preloadToMemory(fileNames) {
        if (this.initFailed) return 0;
        
        try {
            await this.init();
        } catch (e) {
            return 0;
        }
        
        const promises = fileNames.map(async (fileName) => {
            if (!this.memoryCache.has(fileName)) {
                const data = await this.getGeometry(fileName);
                return data !== null;
            }
            return true;
        });
        
        const results = await Promise.all(promises);
        return results.filter(r => r).length;
    }

    /**
     * 获取缓存统计信息
     */
    async getStats() {
        // 如果初始化失败，返回空统计
        if (this.initFailed) {
            return {
                count: 0,
                totalSize: '0 B',
                totalSizeBytes: 0,
                oldestCache: null,
                newestCache: null,
                memoryCacheCount: this.memoryCache.size
            };
        }
        
        try {
            await this.init();
        } catch (e) {
            return {
                count: 0,
                totalSize: '0 B',
                totalSizeBytes: 0,
                oldestCache: null,
                newestCache: null,
                memoryCacheCount: this.memoryCache.size
            };
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readonly');
            const store = transaction.objectStore('geometries');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const items = request.result;
                let totalSize = 0;
                let oldestTimestamp = Date.now();
                let newestTimestamp = 0;
                
                items.forEach(item => {
                    const size = (item.vertices?.length || 0) * 4 +
                                 (item.normals?.length || 0) * 4 +
                                 (item.uvs?.length || 0) * 4 +
                                 (item.indices?.length || 0) * 4;
                    totalSize += size;
                    oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
                    newestTimestamp = Math.max(newestTimestamp, item.timestamp);
                });
                
                resolve({
                    count: items.length,
                    totalSize: this.formatBytes(totalSize),
                    totalSizeBytes: totalSize,
                    oldestCache: oldestTimestamp < Date.now() ? new Date(oldestTimestamp) : null,
                    newestCache: newestTimestamp > 0 ? new Date(newestTimestamp) : null,
                    memoryCacheCount: this.memoryCache.size
                });
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 清理过期缓存（超过30天）
     */
    async cleanExpiredCache(maxAgeDays = 30) {
        if (this.initFailed) return 0;
        
        try {
            await this.init();
        } catch (e) {
            return 0;
        }
        
        const maxAge = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readwrite');
            const store = transaction.objectStore('geometries');
            const index = store.index('timestamp');
            const range = IDBKeyRange.upperBound(maxAge);
            const request = index.openCursor(range);
            
            let deletedCount = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    this.memoryCache.delete(cursor.primaryKey);
                    deletedCount++;
                    cursor.continue();
                } else {
                    console.log(`[ModelCache] Cleaned ${deletedCount} expired items`);
                    resolve(deletedCount);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 清空所有缓存
     */
    async clearAll() {
        this.memoryCache.clear();
        
        // 如果初始化失败，只清除内存缓存
        if (this.initFailed) {
            console.log('[ModelCache] Memory cache cleared (IndexedDB not available)');
            return;
        }
        
        try {
            await this.init();
        } catch (e) {
            console.log('[ModelCache] Memory cache cleared (IndexedDB not available)');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['geometries'], 'readwrite');
            const store = transaction.objectStore('geometries');
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log('[ModelCache] All cache cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 获取缓存版本（用于缓存失效）
     */
    getCacheVersion() {
        return '1.0'; // 更新此版本号可使旧缓存失效
    }

    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelCache };
}
