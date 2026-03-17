# 人体骨骼3D交互图谱 | Human Skeleton 3D Explorer

基于 **BodyParts3D** 真实MRI扫描数据的3D人体骨骼可视化应用。

> **English**: An interactive 3D human skeleton visualization application based on BodyParts3D real MRI scan data.

---

## 🎉 项目特点 | Features

- ✅ **真实人体模型** - 基于2mm MRI扫描的医学级数据  
  *Real human anatomy* - Medical-grade data from 2mm MRI scans
  
- ✅ **202个骨骼** - 近乎完整的人体骨骼系统  
  *202 bones* - Near-complete human skeletal system
  
- ✅ **双语标注** - 中文 + 英文解剖学术语  
  *Bilingual labels* - Chinese + English anatomical terminology
  
- ✅ **双向交互** - 点击3D模型或列表相互联动  
  *Bidirectional interaction* - Click 3D model or list to highlight
  
- ✅ **双语搜索** - 支持中英文搜索骨骼  
  *Bilingual search* - Search bones in Chinese or English
  
- ✅ **多层缓存** - 首次加载后，后续访问速度提升3-5倍  
  *Multi-layer caching* - 3-5x faster loading after first visit
  
- ✅ **开源免费** - CC BY-SA 许可  
  *Open source & free* - CC BY-SA license

---

## 🗃️ 模型来源 | Data Source

- **模型库** | Database: [BodyParts3D / Anatomography](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/)
- **机构** | Institution: 日本东京大学生命科学数据库中心 (The Database Center for Life Science, Japan)
- **版本** | Version: `2021-06-08 16:43`
- **分类** | Classification: **partof** (部位分类系统)
- **技术** | Technology: 2mm间隔全身MRI扫描
- **许可** | License: CC BY-SA 2.1 Japan

### 引用格式 | Citation

```
BodyParts3D, © The Database Center for Life Science 
licensed under CC Attribution-Share Alike 2.1 Japan
https://dbarchive.biosciencedbc.jp/en/bodyparts3d/
```

---

## 📋 项目范围 | Project Scope

### 本项目 | This Project
**仅限骨骼展示** | Skeleton only
- 包含202块骨骼的完整骨骼系统
- 支持双语搜索和交互
- 配备多层缓存机制加速访问

### 完整解剖模型 | Full Anatomy Model
如需查看包含**器官、肌肉、血管、神经**的完整解剖模型，请访问：  
*For the complete anatomy model including organs, muscles, blood vessels, and nerves, visit:*

- 🌐 **在线访问** | Online: https://jixiangying.github.io/anatomy/
- 📦 **源代码** | Source: https://github.com/jixiangying/anatomy

> 完整版包含1,258个OBJ文件，涵盖人体所有主要器官系统。
> *The full version contains 1,258 OBJ files covering all major organ systems.*

---

## 🚀 快速开始 | Quick Start

### 在线访问（推荐）| Online Access (Recommended)

🌐 **GitHub Pages**: https://jixiangying.github.io/skeleton/

无需安装，直接在浏览器中访问即可查看3D人体骨骼模型。  
*No installation required. View the 3D skeleton directly in your browser.*

### 本地运行 | Local Development

```bash
git clone https://github.com/jixiangying/skeleton.git
cd skeleton
python3 -m http.server 3000
# 浏览器访问 | Open http://localhost:3000
```

---

## 📊 包含的骨骼系统 | Included Skeletal System

| 分类 | Category | 数量 | Count | 主要骨骼 | Main Bones |
|------|----------|------|-------|----------|------------|
| **颅骨** | Skull | 24 | 额骨、顶骨、颞骨、枕骨、蝶骨、筛骨、下颌骨、上颌骨、颧骨、鼻骨、泪骨、腭骨、犁骨、下鼻甲、舌骨 | Frontal, Parietal, Temporal, Occipital, Sphenoid, Ethmoid, Mandible, Maxilla, Zygomatic, Nasal, Lacrimal, Palatine, Vomer, Inferior Nasal Concha, Hyoid |
| **脊柱** | Spine | 25 | 颈椎C1-C7（含寰椎、枢椎）、胸椎T1-T12、腰椎L1-L5、骶骨 | Cervical C1-C7 (Atlas, Axis), Thoracic T1-T12, Lumbar L1-L5, Sacrum |
| **胸廓** | Thorax | 27 | 胸骨、左右各12根肋骨 | Sternum, 12 ribs each side |
| **上肢** | Upper Limbs | 64 | 锁骨、肩胛骨、肱骨、尺骨、桡骨、8块腕骨×2、5块掌骨×2、14块指骨×2 | Clavicle, Scapula, Humerus, Ulna, Radius, 8 Carpal bones ×2, 5 Metacarpals ×2, 14 Phalanges ×2 |
| **下肢** | Lower Limbs | 62 | 髋骨、股骨、髌骨、胫骨、腓骨、7块跗骨×2、5块跖骨×2、14块趾骨×2 | Hip bone, Femur, Patella, Tibia, Fibula, 7 Tarsal bones ×2, 5 Metatarsals ×2, 14 Phalanges ×2 |

**总计** | **Total**: **202块骨骼**（接近完整的成人骨骼系统）  
*Near-complete adult skeletal system (missing auditory ossicles and coccyx)*

---

## 🎮 使用说明 | User Guide

| 操作 | Operation | 功能 | Function |
|------|-----------|------|----------|
| 左键拖动 | Left click + drag | 旋转视角 | Rotate view |
| 右键拖动 | Right click + drag | 平移视角 | Pan view |
| 滚轮 | Scroll wheel | 缩放 | Zoom |
| 点击左侧列表 | Click left list | 高亮3D模型并显示详情 | Highlight 3D model & show details |
| 点击3D模型 | Click 3D model | 自动滚动并高亮左侧列表项 | Auto-scroll & highlight list item |
| 搜索框 | Search box | 中英文搜索骨骼 | Search bones in Chinese/English |

---

## ⚡ 缓存机制 | Caching

本项目采用**三层缓存架构**提升加载速度：  
*This project uses a three-layer caching architecture for faster loading:*

1. **内存缓存** | Memory Cache - 当前会话期间保持
2. **IndexedDB** - 持久化存储解析后的几何数据
3. **Service Worker** - HTTP缓存，支持离线访问

首次加载后，后续访问速度提升**3-5倍**，并支持离线浏览。  
*After first load, subsequent visits are 3-5x faster and support offline browsing.*

---

## ⚠️ 已知限制 | Known Limitations

1. **缺少听骨**（6块）- 锤骨、砧骨、镫骨左右各3块  
   *Missing auditory ossicles* (6 bones) - Malleus, Incus, Stapes
   - 原因：2mm分辨率MRI无法清晰重建3mm大小的听骨
   - *Reason: 2mm MRI resolution cannot clearly reconstruct 3mm bones*

2. **缺少尾骨**（1块）- 通常由3-5块尾椎融合而成  
   *Missing coccyx* (1 bone)
   - 原因：在BodyParts3D中可能归类为骶骨的一部分
   - *Reason: May be classified as part of sacrum in BodyParts3D*

3. **重复骨骼**（3块记录）  
   *Duplicate bones* (3 duplicate records)
   - 舌骨：2个文件（FJ2772, FJ3201）| Hyoid: 2 files
   - 胸骨：3个文件（FJ3153, FJ3178, FJ3290）| Sternum: 3 files
   - 实际独特骨骼：199块 | Unique bones: 199

---

## 🛠️ 技术栈 | Tech Stack

- **Three.js r128** - 3D渲染引擎 | 3D rendering engine
- **Tailwind CSS** - UI样式（CDN）| UI styling
- **原生JavaScript** - 应用逻辑 | Application logic
- **Service Worker** - 离线缓存 | Offline caching
- **IndexedDB** - 客户端数据库 | Client-side database

---

## 📁 项目结构 | Project Structure

```
skeleton/
├── index.html                      # 主页面 - 3D查看器
├── sw.js                           # Service Worker - 缓存
├── README.md                       # 项目说明
├── CACHE_README.md                 # 缓存机制文档
├── js/
│   ├── ModelCache.js               # IndexedDB缓存管理
│   ├── OBJLoader.js                # Three.js OBJ加载器
│   └── OrbitControls.js            # 轨道控制器
├── data/                           # BodyParts3D元数据
│   └── partof_*.txt                # 部位分类数据
└── partof_BP3D_4.0_obj_99/         # 3D模型文件夹 (202个OBJ)
    └── FJ*.obj
```

---

## 📄 许可 | License

BodyParts3D数据遵循 **CC BY-SA 2.1 Japan** 许可：  
*BodyParts3D data is licensed under CC BY-SA 2.1 Japan:*

- ✅ 允许自由使用、修改、分发 | Free to use, modify, distribute
- ✅ 允许商业使用 | Commercial use allowed
- ⚠️ 需要注明出处 | Attribution required

---

Created with ❤️ for anatomy education  
为解剖学教育而创建
