/**
 * 真实人体模型加载器
 * 支持 glTF、OBJ 格式的真实解剖学模型
 */

class RealAnatomyLoader {
    constructor(scene) {
        this.scene = scene;
        this.loadedModels = new Map();
        
        // 模型文件路径配置
        this.modelPaths = {
            // 可以在这里添加真实模型文件的路径
            // 例如：'skull': 'models/bodyparts3d/skull.obj',
        };
        
        // 颜色配置（用于给模型着色）
        this.materials = {
            bone: new THREE.MeshPhysicalMaterial({
                color: 0xF5F0E6,
                metalness: 0.1,
                roughness: 0.4,
                clearcoat: 0.3,
                transparent: true,
                opacity: 0.95
            }),
            muscle: new THREE.MeshPhysicalMaterial({
                color: 0xC44D4D,
                metalness: 0.05,
                roughness: 0.6,
                transparent: true,
                opacity: 0.85
            }),
            organ: new THREE.MeshPhysicalMaterial({
                color: 0x8B4513,
                metalness: 0.0,
                roughness: 0.7,
                transparent: true,
                opacity: 0.9
            })
        };
    }
    
    /**
     * 加载 glTF/glb 模型
     * @param {string} url - 模型文件路径
     * @param {string} name - 模型名称
     * @param {Object} options - 配置选项
     */
    loadGLTF(url, name, options = {}) {
        return new Promise((resolve, reject) => {
            if (typeof THREE.GLTFLoader === 'undefined') {
                reject(new Error('GLTFLoader 未加载，请添加 <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>'));
                return;
            }
            
            const loader = new THREE.GLTFLoader();
            
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // 应用配置
                    if (options.position) {
                        model.position.set(...options.position);
                    }
                    if (options.scale) {
                        model.scale.set(...options.scale);
                    }
                    if (options.rotation) {
                        model.rotation.set(...options.rotation);
                    }
                    
                    // 应用材质
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // 根据类型应用材质
                            if (options.type === 'bone') {
                                child.material = this.materials.bone.clone();
                            } else if (options.type === 'muscle') {
                                child.material = this.materials.muscle.clone();
                            } else if (options.type === 'organ') {
                                child.material = this.materials.organ.clone();
                            }
                            
                            // 保存原始信息
                            child.userData.modelName = name;
                            child.userData.modelType = options.type || 'unknown';
                        }
                    });
                    
                    model.name = name;
                    this.scene.add(model);
                    this.loadedModels.set(name, model);
                    
                    console.log(`模型加载成功: ${name}`);
                    resolve(model);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0);
                    console.log(`${name} 加载进度: ${percent}%`);
                },
                (error) => {
                    console.error(`模型加载失败: ${name}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * 加载 OBJ 模型
     * @param {string} url - 模型文件路径
     * @param {string} name - 模型名称
     * @param {Object} options - 配置选项
     */
    loadOBJ(url, name, options = {}) {
        return new Promise((resolve, reject) => {
            if (typeof THREE.OBJLoader === 'undefined') {
                reject(new Error('OBJLoader 未加载，请添加 <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>'));
                return;
            }
            
            const loader = new THREE.OBJLoader();
            
            loader.load(
                url,
                (object) => {
                    // 应用配置
                    if (options.position) {
                        object.position.set(...options.position);
                    }
                    if (options.scale) {
                        object.scale.set(...options.scale);
                    }
                    if (options.rotation) {
                        object.rotation.set(...options.rotation);
                    }
                    
                    // 应用材质
                    const material = options.type === 'bone' ? this.materials.bone :
                                   options.type === 'muscle' ? this.materials.muscle :
                                   this.materials.organ;
                    
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material.clone();
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.userData.modelName = name;
                            child.userData.modelType = options.type || 'unknown';
                        }
                    });
                    
                    object.name = name;
                    this.scene.add(object);
                    this.loadedModels.set(name, object);
                    
                    console.log(`OBJ模型加载成功: ${name}`);
                    resolve(object);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0);
                    console.log(`${name} 加载进度: ${percent}%`);
                },
                (error) => {
                    console.error(`OBJ模型加载失败: ${name}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * 批量加载 BodyParts3D 模型
     * @param {Array} modelList - 模型列表 [{name, url, type, position}]
     */
    async loadBodyParts3D(modelList) {
        const results = [];
        
        for (const modelInfo of modelList) {
            try {
                const model = await this.loadOBJ(
                    modelInfo.url,
                    modelInfo.name,
                    {
                        type: modelInfo.type,
                        position: modelInfo.position,
                        scale: modelInfo.scale || [1, 1, 1]
                    }
                );
                results.push({ success: true, name: modelInfo.name, model });
            } catch (error) {
                results.push({ success: false, name: modelInfo.name, error });
            }
        }
        
        return results;
    }
    
    /**
     * 显示/隐藏模型
     */
    setVisible(name, visible) {
        const model = this.loadedModels.get(name);
        if (model) {
            model.visible = visible;
        }
    }
    
    /**
     * 移除模型
     */
    remove(name) {
        const model = this.loadedModels.get(name);
        if (model) {
            this.scene.remove(model);
            this.loadedModels.delete(name);
        }
    }
    
    /**
     * 获取所有已加载的模型
     */
    getAllModels() {
        return Array.from(this.loadedModels.keys());
    }
    
    /**
     * 高亮模型
     */
    highlight(name, color = 0x60A5FA) {
        const model = this.loadedModels.get(name);
        if (model) {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(color);
                    child.material.emissiveIntensity = 0.3;
                }
            });
        }
    }
    
    /**
     * 取消高亮
     */
    unhighlight(name) {
        const model = this.loadedModels.get(name);
        if (model) {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        }
    }
}

// 使用示例：
/*
// 在 app.js 中：
const modelLoader = new RealAnatomyLoader(this.scene);

// 加载单个 glTF 模型（从 Sketchfab 下载）
modelLoader.loadGLTF('models/skeleton.glb', '完整骨骼', {
    type: 'bone',
    position: [0, 87, 0],
    scale: [1, 1, 1]
});

// 批量加载 BodyParts3D 模型
const bodyParts = [
    { name: '颅骨', url: 'models/bodyparts3d/skull.obj', type: 'bone', position: [0, 163, 0] },
    { name: '股骨左', url: 'models/bodyparts3d/femur_l.obj', type: 'bone', position: [-10, 80, 0] },
    { name: '股骨右', url: 'models/bodyparts3d/femur_r.obj', type: 'bone', position: [10, 80, 0] },
];
modelLoader.loadBodyParts3D(bodyParts);
*/
