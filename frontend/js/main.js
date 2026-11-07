import { SceneManager } from './SceneManager.js';
import { FirstPersonControls } from './FirstPersonControls.js';
import { DeviceManager } from './DeviceManager.js';
import { SmartDevice } from './SmartDevice.js';
import { UIManager } from './UIManager.js';
import { SimulationEngine } from './SimulationEngine.js';

function startApp() {
    try {
        console.log("⚙️ Ініціалізація розумної кімнати Текни...");

        // 1. Створення 3D сцени
        const sceneManager = new SceneManager();

        // 2. Керування від першої особи
        const controls = new FirstPersonControls(sceneManager.camera, document.body);

        // 3. Автовизначення URL бекенду (підтримує і запуск через Node 3001, і Live Server)
        const API_URL = window.location.port === '3001' ? '/api' : 'http://127.0.0.1:3001/api';
        const deviceManager = new DeviceManager(API_URL);

        // 4. Реєстрація смарт-пристроїв кімнати Текни
        // Термінал
        const terminalGroup = sceneManager.createTerminalGroup();
        deviceManager.registerDevice(new SmartDevice('mainTerminal', 'Головний термінал Zen-OS', terminalGroup, { state: true }, (st) => {
            sceneManager.terminalScreens.forEach(s => {
                if (s.material) s.material.emissiveIntensity = st.state ? 0.6 : 0.05;
            });
        }));

        // Ліжко з чипом
        const bedGroup = sceneManager.createBedGroup();
        deviceManager.registerDevice(new SmartDevice('podBed', 'Біо-Ліжко з чип-ковдрою', bedGroup, { blanketHeating: true }));

        // Двері
        const doorGroup = sceneManager.createDoorGroup();
        deviceManager.registerDevice(new SmartDevice('cyberDoor', 'Кібер-Замок Дверей', doorGroup, { locked: false, open: true }, (st) => {
            if (sceneManager.doorLeft && sceneManager.doorRight) {
                sceneManager.doorLeft.position.x = st.open ? -1.3 : -0.6;
                sceneManager.doorRight.position.x = st.open ? 1.3 : 0.6;
            }
        }));

        // Лава-лампа
        const lampGroup = sceneManager.createPlasmaLampGroup();
        deviceManager.registerDevice(new SmartDevice('plasmaLamp', 'Неонова Лава-лампа', lampGroup, { state: true }, (st) => {
            if (sceneManager.plasmaBulb && sceneManager.plasmaLight) {
                sceneManager.plasmaBulb.visible = st.state;
                sceneManager.plasmaLight.intensity = st.state ? 1.0 : 0.0;
                if (st.color) sceneManager.plasmaLight.color.set(st.color);
            }
        }));

        // Шафа & Клімат
        const wardrobeGroup = sceneManager.createWardrobeGroup();
        deviceManager.registerDevice(new SmartDevice('climateControl', 'Кліматична станція', wardrobeGroup, { state: true }));

        // Квантовий годинник
        const clockGroup = sceneManager.createClockGroup();
        deviceManager.registerDevice(new SmartDevice('deskClock', 'Квантовий Годинник', clockGroup, { state: true }));

        // Загальне світло
        deviceManager.registerDevice(new SmartDevice('ambientLighting', 'Освітлення кімнати', null, { state: true, brightness: 0.85 }, (st) => {
            if (sceneManager.ceilingLight) {
                sceneManager.ceilingLight.intensity = st.state ? st.brightness * 1.3 : 0.2;
                if (st.color) sceneManager.ceilingLight.color.set(st.color);
            }
        }));

        // 5. Інтерфейс
        const uiManager = new UIManager(deviceManager);
        deviceManager.onStateSynced = (state) => {
            uiManager.updateHUD(state);
        };

        // 6. Рушій симуляції
        const engine = new SimulationEngine(sceneManager, controls, deviceManager, uiManager);

        // 7. Події взаємодії
        window.addEventListener('click', () => {
            if (controls.controls.isLocked) engine.interactWithTarget();
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') engine.interactWithTarget();
        });

        // Блокування миші через екранне меню
        const instructions = document.getElementById('instructions');
        instructions.addEventListener('click', () => {
            controls.controls.lock();
        });
        controls.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
        });
        controls.controls.addEventListener('unlock', () => {
            instructions.style.display = 'block';
        });

        window.addEventListener('resize', () => {
            sceneManager.camera.aspect = window.innerWidth / window.innerHeight;
            sceneManager.camera.updateProjectionMatrix();
            sceneManager.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 8. Синхронізація з CPS сервером
        async function syncLoop() {
            const state = await deviceManager.fetchState();
            uiManager.setServerStatus(Boolean(state));
        }
        syncLoop();
        setInterval(syncLoop, 1500);

        // 9. Запуск рендерингу
        engine.start();

    } catch (err) {
        console.error("❌ Критична помилка ініціалізації:", err);
    }
}

// Запуск після завантаження сторінки
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}