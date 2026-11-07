// Допоміжна функція для генерації процедурних шпалер/текстур мікросхем
function createCircuitTexture(baseColor = '#72B3AC', lineColor = '#39FF14', glowColor = '#00FFFF') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Базовий колір шпалер
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Малювання ліній плати
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.fillStyle = glowColor;

    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * 16) * 32;
        const y = Math.floor(Math.random() * 16) * 32;
        const length = (Math.floor(Math.random() * 4) + 1) * 32;
        const horizontal = Math.random() > 0.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        if (horizontal) {
            ctx.lineTo(x + length, y);
            ctx.arc(x + length, y, 5, 0, Math.PI * 2);
        } else {
            ctx.lineTo(x, y + length);
            ctx.arc(x, y + length, 5, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa6e3d0);

        this.initCamera();
        this.initRenderer();
        this.buildTecnaRoom();
    }

    // Ініціалізація камери
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // Початкова позиція гравця (рівень очей 1.6м)
        this.camera.position.set(0, 1.6, 3);
    }

    // Ініціалізація WebGL рендерера
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        const existingCanvas = document.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    buildTecnaRoom() {
        const wallTexture = createCircuitTexture('#5ca195', '#2bf280', '#00f0ff');
        wallTexture.repeat.set(2, 2);
        const floorTexture = createCircuitTexture('#a3d9a5', '#38b368', '#7df2ae');
        floorTexture.repeat.set(4, 4);
        const floorGeo = new THREE.PlaneGeometry(12, 12);
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.4 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.5 });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallMat);
        backWall.position.set(0, 3, -6);
        this.scene.add(backWall);
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallMat);
        leftWall.position.set(-6, 3, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        const bedGroup = new THREE.Group();
        const bedFrameGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 16, 1, false, 0, Math.PI);
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e6f6d, metalness: 0.3 });
        const bedFrame = new THREE.Mesh(bedFrameGeo, bedMat);
        bedFrame.rotation.z = Math.PI / 2;
        bedFrame.rotation.y = Math.PI / 2;
        bedFrame.position.set(-4, 0.6, -3);
        bedGroup.add(bedFrame);
        this.scene.add(bedGroup);
        const shelfGeo = new THREE.BoxGeometry(1.5, 0.1, 0.6);
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x00a896 });
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(-4.5, 3.2, -2);
        this.scene.add(shelf);
        const lampGeo = new THREE.ConeGeometry(0.2, 0.8, 16);
        const lampMat = new THREE.MeshStandardMaterial({ 
            color: 0x6C5CE7, 
            emissive: 0x6C5CE7, 
            emissiveIntensity: 0.8 
        });
        this.lavaLampMesh = new THREE.Mesh(lampGeo, lampMat);
        this.lavaLampMesh.position.set(-4.5, 3.7, -2);
        this.scene.add(this.lavaLampMesh);
        this.lavaLight = new THREE.PointLight(0x8A2BE2, 1, 5);
        this.lavaLight.position.set(-4.5, 3.7, -2);
        this.scene.add(this.lavaLight);
        const deskGeo = new THREE.BoxGeometry(2, 0.1, 1.2);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x1a5e5a });
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(4, 1, -4);
        this.scene.add(desk);
        const screenGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.7, 16, 1, true, -0.5, 1);
        const screenMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000, 
            emissive: 0x00ffff, 
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide 
        });
        this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
        this.screenMesh.position.set(4, 1.8, -4.2);
        this.scene.add(this.screenMesh);

        this.workstationLight = new THREE.PointLight(0x00ffff, 0.8, 3);
        this.workstationLight.position.set(4, 1.8, -3.8);
        this.scene.add(this.workstationLight);
        const ambientLight = new THREE.AmbientLight(0xd4f7ec, 0.7);
        this.scene.add(ambientLight);
    }
}