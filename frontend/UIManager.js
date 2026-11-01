export class UIManager {//керує інтерфейсом користувача, включаючи панель статистики та графічний інтерфейс для керування розумним світлом
    constructor(simulationEngine, deviceManager) {//ініціалізує менеджер інтерфейсу користувача з посиланням на движок симуляції та менеджер пристроїв
        this.simEngine = simulationEngine;
        this.deviceManager = deviceManager;
        this.initStats();
        this.initGUI();
    }

    initStats() {//ініціалізує панель статистики для відображення інформації про продуктивність
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);//додає панель статистики до документа
    }

    initGUI() {//ініціалізує графічний інтерфейс для керування розумним світлом та відображення стану датчика
        this.gui = new lil.GUI({ title: 'Панель керування' });
        const light = this.deviceManager.getDeviceById('smart_light_1');//отримує посилання на розумне світло з менеджера пристроїв

        this.params = {//зберігає параметри для графічного інтерфейсу, включаючи режим роботи, стан світла, інтенсивність та стан датчика
            autoMode: true,
            lightOn: false,
            intensity: 1.5,
            distanceToSensor: '0.00 м',
            sensorTriggered: false
        };

        const modeFolder = this.gui.addFolder('Режим роботи');
        modeFolder.add(this.params, 'autoMode').name('Автоматичний режим').onChange((val) => {//додає обробник зміни стану автоматичного режиму, щоб оновити стан світла та доступність елементів керування
            this.simEngine.autoMode = val;
            manualToggle.disable(val);
            intensitySlider.disable(val);
        });

        const lightFolder = this.gui.addFolder('Ручне керування');//додає елементи керування для ручного керування розумним світлом, включаючи перемикач увімкнення та вимкнення та повзунок інтенсивності
        const manualToggle = lightFolder.add(this.params, 'lightOn').name('Увімкнути світло').onChange((val) => {
            if (!this.simEngine.autoMode) {
                val ? light.turnOn() : light.turnOff();
            }
        });
        manualToggle.disable(true);//вимикає перемикач увімкнення та вимкнення, якщо автоматичний режим активний

        const intensitySlider = lightFolder.add(this.params, 'intensity', 0, 3, 0.1).name('Інтенсивність').onChange((val) => {//додає обробник зміни значення повзунка інтенсивності, щоб оновити інтенсивність світла
            light.setIntensity(val);
        });
        intensitySlider.disable(true);

        const statusFolder = this.gui.addFolder('Моніторинг стану');
        statusFolder.add(this.params, 'distanceToSensor').name('Відстань до датчика').listen();
        statusFolder.add(this.params, 'sensorTriggered').name('Датчик активовано').listen();
    }

    update(distance, triggered) {//оновлює параметри графічного інтерфейсу на основі поточного стану датчика та світла
        const light = this.deviceManager.getDeviceById('smart_light_1');
        this.params.distanceToSensor = distance.toFixed(2) + ' м';
        this.params.sensorTriggered = triggered;
        this.params.lightOn = light ? light.getStatus() : false;
        this.stats.update();
    }
}