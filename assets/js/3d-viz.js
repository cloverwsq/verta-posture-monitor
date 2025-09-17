/**
 * VertA 改进的3D可视化 - 更直观的压力传感器显示
 */

let scene, camera, renderer, cushion, pressurePoints = [];
let gridLines = [];

function init3D() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        console.warn('3D canvas not found');
        return;
    }

    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    const aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 创建改进的坐垫可视化
    createImprovedCushion();
    
    // 创建网格线
    createSensorGrid();
    
    // 创建压力传感器点（更规整）
    createPressurePointsGrid();
    
    // 添加光照
    addLighting();
    
    // 添加标签
    addLabels();
    
    // 设置相机位置
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);

    // 启动动画循环
    animate();
    
    // 添加鼠标控制
    addMouseControls();
    
    console.log('✅ Improved 3D visualization initialized');
}

function createImprovedCushion() {
    // 坐垫主体 - 更像真实的坐垫
    const cushionGeometry = new THREE.BoxGeometry(4, 0.4, 4);
    
    // 圆角效果
    const cushionMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.8 
    });
    
    cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    cushion.receiveShadow = true;
    cushion.castShadow = true;
    scene.add(cushion);

    // 添加坐垫表面 - 更柔软的外观
    const topGeometry = new THREE.PlaneGeometry(4, 4);
    const topMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4ecdc4,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const topSurface = new THREE.Mesh(topGeometry, topMaterial);
    topSurface.rotation.x = -Math.PI / 2;
    topSurface.position.y = 0.21;
    scene.add(topSurface);

    // 添加坐垫边框
    const edgeGeometry = new THREE.EdgesGeometry(cushionGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.5,
        transparent: true 
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    cushion.add(edges);
}

function createSensorGrid() {
    // 创建5x5网格线，更清晰地显示传感器布局
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.3, 
        transparent: true 
    });

    // 垂直线
    for (let i = 0; i <= 5; i++) {
        const geometry = new THREE.BufferGeometry();
        const x = (i - 2.5) * 0.8;
        const points = [
            new THREE.Vector3(x, 0.22, -2),
            new THREE.Vector3(x, 0.22, 2)
        ];
        geometry.setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        gridLines.push(line);
        scene.add(line);
    }

    // 水平线
    for (let j = 0; j <= 5; j++) {
        const geometry = new THREE.BufferGeometry();
        const z = (j - 2.5) * 0.8;
        const points = [
            new THREE.Vector3(-2, 0.22, z),
            new THREE.Vector3(2, 0.22, z)
        ];
        geometry.setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        gridLines.push(line);
        scene.add(line);
    }
}

function createPressurePointsGrid() {
    pressurePoints = [];
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            // 创建规整的5x5网格
            const x = (i - 2) * 0.8;
            const z = (j - 2) * 0.8;
            
            // 压力指示柱 - 更像传感器
            const columnGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.1, 8);
            const columnMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x4ecdc4,
                transparent: true,
                opacity: 0.8
            });
            
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(x, 0.3, z);
            column.castShadow = true;
            
            scene.add(column);
            pressurePoints.push({
                mesh: column,
                baseY: 0.3,
                baseHeight: 0.1,
                index: i * 5 + j,
                row: i,
                col: j
            });
        }
    }
}

function addLabels() {
    // 添加文字标签 (使用CSS3D或者简单的3D文本)
    // 这里用几何体创建简单的指示
    
    // "压力传感器网格" 标签区域
    const labelGeometry = new THREE.PlaneGeometry(3, 0.5);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, 512, 128);
    context.fillStyle = '#333';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('5×5 Pressure Sensor Grid', 256, 80);
    
    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: labelTexture, 
        transparent: true 
    });
    
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 2, 0);
    label.lookAt(camera.position);
    scene.add(label);
}

function addLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // 主光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // 柔和的补充光
    const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);
}

function addMouseControls() {
    let mouseX = 0, mouseY = 0;
    let isMouseDown = false;
    let rotationX = 0.3, rotationY = 0.8; // 默认良好角度
    
    const canvas = renderer.domElement;
    
    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseenter', () => {
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        canvas.style.cursor = 'default';
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;
        
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        rotationY += deltaX * 0.01;
        rotationX += deltaY * 0.01;
        
        // 限制垂直旋转
        rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationX));
        
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
        
        const distance = camera.position.length();
        if (distance < 3) camera.position.normalize().multiplyScalar(3);
        if (distance > 12) camera.position.normalize().multiplyScalar(12);
    });
    
    // 应用旋转
    function applyRotation() {
        const radius = camera.position.length();
        camera.position.x = radius * Math.sin(rotationY) * Math.cos(rotationX);
        camera.position.y = radius * Math.sin(rotationX);
        camera.position.z = radius * Math.cos(rotationY) * Math.cos(rotationX);
        camera.lookAt(0, 0, 0);
    }
    
    window.applyMouseRotation = applyRotation;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 更新压力传感器显示
    pressurePoints.forEach((point, index) => {
        if (!point.mesh) return;
        
        // 获取传感器数据
        let intensity = 0.3;
        if (window.vertaApp && window.vertaApp.sensorData) {
            intensity = window.vertaApp.sensorData[index] || 0;
        } else {
            // 创造更真实的压力分布模式
            const centerX = 2, centerZ = 2;
            const distanceFromCenter = Math.sqrt(
                Math.pow(point.row - centerX, 2) + Math.pow(point.col - centerZ, 2)
            );
            
            // 中心区域压力更大，边缘压力小
            const centerWeight = Math.exp(-distanceFromCenter * 0.5);
            const timeVariation = Math.sin(time * 2 + index * 0.3) * 0.2;
            intensity = centerWeight * 0.8 + timeVariation + 0.1;
        }
        
        intensity = Math.max(0.1, Math.min(1, intensity));
        
        // 更新柱子高度 - 更明显的变化
        const targetHeight = point.baseHeight + intensity * 0.8;
        point.mesh.scale.y = targetHeight / point.baseHeight;
        point.mesh.position.y = point.baseY + (targetHeight - point.baseHeight) / 2;
        
        // 更新颜色 - 热图效果
        const hue = (1 - intensity) * 0.6; // 从红到蓝
        point.mesh.material.color.setHSL(hue, 0.8, 0.5);
        
        // 添加发光效果
        point.mesh.material.emissive.setHSL(hue, 0.5, intensity * 0.1);
    });
    
    // 应用鼠标控制
    if (window.applyMouseRotation) {
        window.applyMouseRotation();
    }
    
    renderer.render(scene, camera);
}

// 更新传感器数据的接口
function updateSensorVisualization(sensorData) {
    if (!Array.isArray(sensorData) || sensorData.length !== 25) return;
    
    pressurePoints.forEach((point, index) => {
        if (!point.mesh || index >= sensorData.length) return;
        
        const intensity = sensorData[index];
        
        // 更新位置
        const targetHeight = point.baseHeight + intensity * 0.8;
        point.mesh.scale.y = targetHeight / point.baseHeight;
        point.mesh.position.y = point.baseY + (targetHeight - point.baseHeight) / 2;
        
        // 更新颜色 (蓝色到红色)
        const hue = (1 - intensity) * 0.6;
        point.mesh.material.color.setHSL(hue, 1, 0.6);
        
        // 更新发光
        point.mesh.material.emissive.setHSL(hue, 0.5, intensity * 0.2);
    });
}

// 调整画布大小
function resize3D() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !renderer || !camera) return;
    
    const container = canvas.parentElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// 获取场景统计信息
function get3DStats() {
    return {
        objects: scene.children.length,
        pressurePoints: pressurePoints.length,
        gridLines: gridLines.length,
        cameraPosition: {
            x: camera.position.x.toFixed(2),
            y: camera.position.y.toFixed(2),
            z: camera.position.z.toFixed(2)
        }
    };
}

// 重置相机位置
function resetCameraPosition() {
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);
}

// 切换显示模式
function toggleWireframe() {
    pressurePoints.forEach(point => {
        if (point.mesh) {
            point.mesh.material.wireframe = !point.mesh.material.wireframe;
        }
    });
    
    if (cushion) {
        cushion.material.wireframe = !cushion.material.wireframe;
    }
}

// 导出函数
window.init3D = init3D;
window.updateSensorVisualization = updateSensorVisualization;
window.resize3D = resize3D;
window.get3DStats = get3DStats;
window.resetCameraPosition = resetCameraPosition;
window.toggleWireframe = toggleWireframe;

// 窗口大小变化时调整
window.addEventListener('resize', resize3D);

// 添加3D控制提示
function show3DControls() {
    if (window.showToast) {
        window.showToast('🖱️ Drag to rotate, scroll to zoom, ESC to reset camera', 'info', 5000);
    }
}

// ESC键重置相机
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        resetCameraPosition();
    }
});

// 导出控制函数
window.show3DControls = show3DControls;