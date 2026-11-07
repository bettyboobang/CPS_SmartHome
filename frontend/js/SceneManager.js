export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x91c9c7);
        this.scene.fog = new THREE.FogExp2(0x91c9c7, 0.025);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 2.0, 5.5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Посилання на важливі рухомі / динамічні частини
        this.terminalScreens = [];
        this.servoArms = [];
        this.plasmaBulb = null;
        this.plasmaLight = null;
        this.ceilingLight = null;
        this.doorLeft = null;
        this.doorRight = null;

        this.initLights();
        this.buildRoom();
    }

    initLights() {
        const hemiLight = new THREE.HemisphereLight(0xe5ffff, 0x2f605a, 0.65);
        this.scene.add(hemiLight);

        this.ceilingLight = new THREE.PointLight(0x4df2c2, 1.2, 18);
        this.ceilingLight.position.set(0, 4.4, 0);
        this.ceilingLight.castShadow = true;
        this.scene.add(this.ceilingLight);

        const doorGlow = new THREE.DirectionalLight(0xbdfcf0, 0.6);
        doorGlow.position.set(0, 4, -7);
        this.scene.add(doorGlow);
    }

    // Процедурна текстура мікрочипа (ковдра Текни)
    createChipTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#4da892'; ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#2d6d5f'; ctx.fillRect(156, 156, 200, 200);
        ctx.strokeStyle = '#85f5d6'; ctx.lineWidth = 6; ctx.strokeRect(156, 156, 200, 200);
        ctx.strokeStyle = '#c6fff0'; ctx.lineWidth = 4;
        ctx.strokeRect(190, 190, 132, 132);
        ctx.strokeStyle = '#71d4bc';
        for (let i = 0; i < 4; i++) {
            let o = 180 + i * 40;
            ctx.beginPath();
            ctx.moveTo(o, 156); ctx.lineTo(o, 50);
            ctx.moveTo(o, 356); ctx.lineTo(o, 460);
            ctx.moveTo(156, o); ctx.lineTo(50, o);
            ctx.moveTo(356, o); ctx.lineTo(460, o);
            ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
    }

    // Процедурна текстура килима
    createRugTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8ce1d5'; ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 472, 472);
        ctx.beginPath();
        ctx.moveTo(60, 60); ctx.lineTo(200, 60); ctx.lineTo(200, 220); ctx.lineTo(360, 220);
        ctx.moveTo(80, 420); ctx.lineTo(160, 420); ctx.lineTo(160, 300); ctx.lineTo(320, 300);
        ctx.stroke();
        return new THREE.CanvasTexture(canvas);
    }

    // Екран терміналу
    createScreenTexture(title) {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#062024'; ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#38e5b4'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, 492, 236);
        ctx.fillStyle = '#38e5b4'; ctx.font = 'bold 26px monospace';
        ctx.fillText(`> ${title}`, 25, 50);
        ctx.font = '18px monospace';
        ctx.fillText("ZENITH PROTOCOL: ONLINE", 25, 95);
        ctx.fillText("FIREWALL: QUANTUM-ACTIVE", 25, 130);
        return new THREE.CanvasTexture(canvas);
    }

    buildRoom() {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x93c5c5, roughness: 0.6 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x81beab, roughness: 0.5 });

        // Підлога
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Подіум сходинок
        const stepMat = new THREE.MeshStandardMaterial({ color: 0x64a999, roughness: 0.4 });
        const step1 = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.25, 32, 1, false, 0, Math.PI / 2), stepMat);
        step1.position.set(7, 0.12, 7); step1.rotation.y = Math.PI;
        this.scene.add(step1);

        const step2 = new THREE.Mesh(new THREE.CylinderGeometry(6.8, 6.8, 0.25, 32, 1, false, 0, Math.PI / 2), stepMat);
        step2.position.set(7, 0.35, 7); step2.rotation.y = Math.PI;
        this.scene.add(step2);

        // Стіни
        const wallB = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
        wallB.position.set(0, 3, -7); this.scene.add(wallB);

        const wallL = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
        wallL.position.set(-7, 3, 0); wallL.rotation.y = Math.PI / 2; this.scene.add(wallL);

        const wallR = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
        wallR.position.set(7, 3, 0); wallR.rotation.y = -Math.PI / 2; this.scene.add(wallR);

        // Килим
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), new THREE.MeshStandardMaterial({ map: this.createRugTexture() }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(1.2, 0.02, 0.8);
        this.scene.add(rug);
    }

    createBedGroup() {
        const group = new THREE.Group();
        group.position.set(-3.8, 0, 1.2);
        group.rotation.y = Math.PI / 6;

        const frameMat = new THREE.MeshStandardMaterial({ color: 0x205558, roughness: 0.3 });
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.4, 32, 1, false, 0, Math.PI), frameMat);
        head.rotation.z = -Math.PI / 2; head.position.set(0, 0.85, -1.8);
        group.add(head);

        const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 3.2), frameMat);
        base.position.set(0, 0.3, 0); group.add(base);

        const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.6), new THREE.MeshStandardMaterial({ color: 0xf5ee98 }));
        pillow.position.set(0, 0.7, -1.1); group.add(pillow);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 2.4), new THREE.MeshStandardMaterial({ map: this.createChipTexture() }));
        blanket.position.set(0, 0.65, 0.4); group.add(blanket);

        this.scene.add(group);
        return group;
    }

    createTerminalGroup() {
        const group = new THREE.Group();
        group.position.set(4.5, 0.35, 1.5);
        group.rotation.y = -Math.PI / 4;

        const deskMat = new THREE.MeshStandardMaterial({ color: 0x2d8787, metalness: 0.4, roughness: 0.3 });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.1, 24, 1, false, Math.PI * 0.7, Math.PI * 0.9), deskMat);
        group.add(base);

        const titles = ["ZENITH OS", "CYBER MATRIX", "TELEMETRY"];
        for (let i = -1; i <= 1; i++) {
            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.7, 0.08),
                new THREE.MeshStandardMaterial({
                    map: this.createScreenTexture(titles[i + 1]),
                    emissive: 0x22f5b8,
                    emissiveIntensity: 0.6
                })
            );
            screen.position.set(i * 1.1, 1.25, 1.3 - Math.abs(i) * 0.2);
            screen.rotation.y = -i * 0.35;
            group.add(screen);
            this.terminalScreens.push(screen);
        }

        for (let side of [-1.2, 1.2]) {
            const arm = new THREE.Group();
            arm.position.set(side, 1.0, 1.0);
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), deskMat);
            rod.rotation.z = side > 0 ? -Math.PI / 4 : Math.PI / 4;
            arm.add(rod);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0x3be8b0 }));
            lamp.position.set(side > 0 ? 0.3 : -0.3, 0.4, 0);
            arm.add(lamp);
            group.add(arm);
            this.servoArms.push(arm);
        }

        this.scene.add(group);
        return group;
    }

    createDoorGroup() {
        const group = new THREE.Group();
        group.position.set(0, 0, -6.95);

        const doorMat = new THREE.MeshStandardMaterial({ color: 0x78cfb7, emissive: 0x226655, emissiveIntensity: 0.4 });
        this.doorLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 0.08), doorMat);
        this.doorLeft.position.set(-0.6, 1.8, 0);
        group.add(this.doorLeft);

        this.doorRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 0.08), doorMat);
        this.doorRight.position.set(0.6, 1.8, 0);
        group.add(this.doorRight);

        this.scene.add(group);
        return group;
    }

    createPlasmaLampGroup() {
        const group = new THREE.Group();
        group.position.set(-5.6, 3.2, -3.2);

        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.6), new THREE.MeshStandardMaterial({ color: 0x228787 }));
        group.add(shelf);

        this.plasmaBulb = new THREE.Mesh(
            new THREE.ConeGeometry(0.24, 0.9, 24),
            new THREE.MeshStandardMaterial({ color: 0x9b51e0, emissive: 0x8a2be2, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 })
        );
        this.plasmaBulb.position.y = 0.55;
        group.add(this.plasmaBulb);

        this.plasmaLight = new THREE.PointLight(0xa855f7, 1.0, 4);
        this.plasmaLight.position.set(0, 0.6, 0);
        group.add(this.plasmaLight);

        this.scene.add(group);
        return group;
    }

    createWardrobeGroup() {
        const group = new THREE.Group();
        group.position.set(4.8, 0, -4.5);
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x76ceba }));
        body.position.y = 2.1;
        group.add(body);
        this.scene.add(group);
        return group;
    }

    createClockGroup() {
        const group = new THREE.Group();
        group.position.set(-2.8, 1.4, -2.6);
        const shelf = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x228787 }));
        group.add(shelf);

        const clockBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.15), new THREE.MeshBasicMaterial({ color: 0x113b3e }));
        clockBody.position.set(0, 0.18, 0);
        group.add(clockBody);

        this.scene.add(group);
        return group;
    }
}