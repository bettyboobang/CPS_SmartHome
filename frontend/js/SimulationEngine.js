export class SimulationEngine {
    constructor(sceneManager, controls, deviceManager, uiManager) {
        this.sm = sceneManager;
        this.controls = controls;
        this.dm = deviceManager;
        this.ui = uiManager;

        // Безпечна ініціалізація Stats.js (підтримка будь-яких версій бібліотеки)
        try {
            if (typeof Stats === 'function') {
                this.stats = new Stats();
                const statsElement = this.stats.dom || this.stats.domElement;
                if (statsElement) {
                    statsElement.style.position = 'absolute';
                    statsElement.style.left = 'auto';
                    statsElement.style.right = '10px';
                    statsElement.style.top = '10px';
                    document.body.appendChild(statsElement);
                }
            }
        } catch (e) {
            console.warn('[Stats.js] Лічильник кадрів пропущено:', e);
        }

        this.raycaster = new THREE.Raycaster();
        this.center = new THREE.Vector2(0, 0);
        this.prevTime = performance.now();
        this.currentTarget = null;
    }

    start() {
        console.log("🚀 [SimulationEngine] 3D рендеринг кімнати Текни запущено!");
        const loop = () => {
            requestAnimationFrame(loop);
            this.update();
        };
        loop();
    }

    update() {
        const time = performance.now();
        const delta = Math.min((time - this.prevTime) / 1000, 0.1);

        // 1. Оновлення контролера гравця
        if (this.controls && typeof this.controls.update === 'function') {
            this.controls.update(delta);
        }

        // 2. Анімація пульсації плазмової лампи
        if (this.sm.plasmaBulb && this.sm.plasmaBulb.visible) {
            const scale = 1.0 + Math.sin(time * 0.005) * 0.05;
            this.sm.plasmaBulb.scale.set(scale, scale, scale);
        }

        // 3. Анімація сканерів робочих рук
        if (this.sm.servoArms && this.sm.servoArms.length > 0) {
            this.sm.servoArms.forEach((arm, i) => {
                arm.rotation.y = Math.sin(time * 0.002 + i * Math.PI) * 0.25;
            });
        }

        // 4. Raycasting (прицілювання на пристрої)
        if (this.sm.camera) {
            this.raycaster.setFromCamera(this.center, this.sm.camera);
            const meshes = this.dm.getAllInteractiveMeshes();
            const intersects = this.raycaster.intersectObjects(meshes, true);

            if (intersects.length > 0 && intersects[0].distance < 6.0) {
                let hit = intersects[0].object;
                while (hit && !hit.userData.smartDevice && hit.parent) {
                    hit = hit.parent;
                }
                if (hit && hit.userData.smartDevice) {
                    this.currentTarget = hit.userData.smartDevice;
                    this.ui.showPrompt(this.currentTarget.name);
                } else {
                    this.currentTarget = null;
                    this.ui.hidePrompt();
                }
            } else {
                this.currentTarget = null;
                this.ui.hidePrompt();
            }
        }

        this.prevTime = time;
        if (this.stats && typeof this.stats.update === 'function') {
            this.stats.update();
        }

        // Рендеринг сцени
        if (this.sm.renderer && this.sm.scene && this.sm.camera) {
            this.sm.renderer.render(this.sm.scene, this.sm.camera);
        }
    }

    interactWithTarget() {
        if (this.currentTarget) {
            const payload = this.currentTarget.toggle();
            this.dm.updateDevice(this.currentTarget.id, payload);
        }
    }
}