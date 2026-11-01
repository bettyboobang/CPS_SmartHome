import { SceneManager } from './SceneManager.js';
import { FirstPersonController } from './FirstPersonControls.js';
import { SmartLight, MotionSensor } from './SmartDevice.js';
import { DeviceManager } from './DeviceManager.js';
import { SimulationEngine } from './SimulationEngine.js';
import { UIManager } from './UIManager.js';

class App {//ініціалізує основний додаток, створюючи менеджер сцени, контролер від першої особи, менеджер пристроїв, движок симуляції та менеджер інтерфейсу користувача
    constructor() {
        this.sceneManager = new SceneManager();
        this.fpController = new FirstPersonController(//ініціалізує контролер від першої особи з заданою камерою, елементом DOM та елементом інструкцій
            this.sceneManager.camera,
            document.body,
            document.getElementById('instructions')
        );

        this.deviceManager = new DeviceManager();
        this.initDevices();

        this.simEngine = new SimulationEngine(this.deviceManager);
        this.uiManager = new UIManager(this.simEngine, this.deviceManager);

        this.prevTime = performance.now();
        this.animate = this.animate.bind(this);
    }

    initDevices() {//ініціалізує розумне світло та датчик руху, додаючи їх до сцени та менеджера пристроїв
        const lampGeo = new THREE.SphereGeometry(0.2, 32, 32);
        const lampMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
        const lampMesh = new THREE.Mesh(lampGeo, lampMat);
        lampMesh.position.set(0, 3.2, 0);
        this.sceneManager.scene.add(lampMesh);

        const pointLight = new THREE.PointLight(0xfffaed, 0.1, 15);
        pointLight.position.set(0, 3.1, 0);
        pointLight.castShadow = true;
        this.sceneManager.scene.add(pointLight);

        const smartLight = new SmartLight('smart_light_1', 'Головне освітлення', pointLight, lampMesh);
        this.deviceManager.addDevice(smartLight);

        const sensorGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat);
        sensorMesh.position.set(0, 1.8, -4.9);
        this.sceneManager.scene.add(sensorMesh);

        const motionSensor = new MotionSensor('motion_sensor_1', 'Датчик руху входу', sensorMesh, 3.0);
        this.deviceManager.addDevice(motionSensor);
    }

    animate() {//основний цикл анімації
        requestAnimationFrame(this.animate);
        try {
            this.tick();
        } catch (err) {
            showFatal('Помилка в циклі анімації', err);
        }
    }

    tick() {//один кадр: оновлює контролер, симуляцію, інтерфейс і рендерить сцену
        const time = performance.now();
        const deltaTime = (time - this.prevTime) / 1000;

        this.fpController.update(deltaTime);

        const { distance, triggered } = this.simEngine.update(this.sceneManager.camera.position);//оновлює стан движка симуляції на основі позиції камери та отримує відстань до датчика та стан його активації
        this.uiManager.update(distance, triggered);

        this.sceneManager.render();//рендерить сцену з поточною камерою
        this.prevTime = time;
    }

    start() {//запускає основний цикл анімації
        this.animate();
    }
}

function showFatal(title, err) {//показує помилку прямо на сторінці, щоб не доводилось відкривати консоль
    console.error(title, err);
    let box = document.getElementById('fatal-error');
    if (!box) {
        box = document.createElement('pre');
        box.id = 'fatal-error';
        box.style.cssText = 'position:fixed;left:10px;bottom:10px;right:10px;max-height:40vh;overflow:auto;z-index:1000;background:#300;color:#fcc;padding:12px;border-radius:8px;font-size:13px;user-select:text;';
        document.body.appendChild(box);
    }
    box.textContent = title + ':\n' + (err && err.stack ? err.stack : err);
}

window.addEventListener('error', (e) => showFatal('Помилка', e.error || e.message));

if (typeof THREE === 'undefined' || !THREE.PointerLockControls) {
    showFatal('Не завантажилась бібліотека three.js (або PointerLockControls)', 'Перевірте інтернет/VPN/блокувальник реклами: скрипти беруться з cdnjs.cloudflare.com та cdn.jsdelivr.net');
} else {
    new App().start();
}