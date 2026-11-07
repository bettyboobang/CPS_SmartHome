export class UIManager {
    constructor(simulationEngine, deviceManager) {
        this.simEngine = simulationEngine;
        this.deviceManager = deviceManager;

        this.initStats();
        this.initGUI();
    }

    initStats() {
        if (typeof Stats !== 'undefined') {
            this.stats = new Stats();
            this.stats.showPanel(0);
            const statsEl = this.stats.dom || this.stats.domElement;
            if (statsEl) document.body.appendChild(statsEl);
        }
    }
    initGUI() {
        if (typeof lil === 'undefined' || !lil.GUI) return;

        this.gui = new lil.GUI({ title: 'Панель керування CPS' });
        const light = this.deviceManager.getDeviceById('smart_light_1');

        this.params = {
            autoMode: true,
            lightOn: false,
            intensity: 1.5,
            distanceToSensor: '0.00 м',
            sensorTriggered: false
        };

        let manualToggle = null;
        let intensitySlider = null;

        const modeFolder = this.gui.addFolder('Режим роботи');
        modeFolder.add(this.params, 'autoMode').name('Автоматичний режим').onChange((val) => {
            this.simEngine.autoMode = val;
            if (manualToggle) manualToggle.disable(val);
            if (intensitySlider) intensitySlider.disable(val);
        });

        const lightFolder = this.gui.addFolder('Ручне керування');
        manualToggle = lightFolder.add(this.params, 'lightOn').name('Увімкнути світло').listen().onChange((val) => {
            if (!this.simEngine.autoMode && light) {
                val ? light.turnOn() : light.turnOff();
            }
        });
        manualToggle.disable(true);

        intensitySlider = lightFolder.add(this.params, 'intensity', 0, 3, 0.1).name('Інтенсивність').onChange((val) => {
            if (light) light.setIntensity(val);
        });
        intensitySlider.disable(true);

        const statusFolder = this.gui.addFolder('Моніторинг стану');
        statusFolder.add(this.params, 'distanceToSensor').name('Відстань до датчика').listen();
        statusFolder.add(this.params, 'sensorTriggered').name('Датчик активовано').listen();
    }
    initGUI(devices) {
        const gui = new lil.GUI({ title: 'Керування Кімнатою' });
        gui.add(this, 'autoMode').name('Авто-сценарій CPS');
        const lampFolder = gui.addFolder('Лава-Лампа');
        lampFolder.add(devices.lavaLamp, 'isEnabled').name('Увімкнено').listen().onChange(val => {
            val ? devices.lavaLamp.turnOn() : devices.lavaLamp.turnOff();
        });
        lampFolder.addColor(devices.lavaLamp, 'color').name('Колір сяйва').onChange(color => {
            devices.lavaLamp.setColor(color);
        });
        const pcFolder = gui.addFolder('Робоча Станція');
        pcFolder.add(devices.workstation, 'isEnabled').name('Монітори').listen();
        const doorFolder = gui.addFolder('Двері Кімнати');
        doorFolder.add(devices.smartDoor, 'isOpen').name('Відкрито').listen().onChange(val => {
            val ? devices.smartDoor.open() : devices.smartDoor.close();
        });
    }

    update(distance, triggered) {
        const light = this.deviceManager.getDeviceById('smart_light_1');
        if (this.params) {
            this.params.distanceToSensor = distance.toFixed(2) + ' м';
            this.params.sensorTriggered = triggered;
            this.params.lightOn = light ? light.getStatus() : false;
        }
        if (this.stats) {
            this.stats.update();
        }
    }
}