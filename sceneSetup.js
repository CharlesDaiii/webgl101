import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // 初始化渲染器设置
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    
    // 加载背景纹理
    const textureLoader = new THREE.TextureLoader();
    const comboBackground = textureLoader.load('combo-background.png');
    
    // 设置背景纹理的更新函数
    scene.updateBackground = (comboCount) => {
        if (comboCount >= 5) {
            scene.background = comboBackground;
        } else {
            scene.background = null;
            renderer.setClearColor(0x000000);
        }
    };
    
    // 初始化相机位置
    camera.position.set(0, 30, 30);
    camera.lookAt(0, 0, 0);
    
    return { scene, camera, renderer };
}

export function setupLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 200, 30, Math.PI/4, 0.3);
    spotLight.position.set(0, 15, 5);
    spotLight.castShadow = true;
    spotLight.power = 2000;
    scene.add(spotLight);
    
    return { ambientLight, spotLight };
}