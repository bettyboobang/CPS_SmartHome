export class SmartDevice {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.isEnabled = false;//поточний стан пристрою
    }
    toggle() {//перемикає стан пристрою на протилежний і повертає новий стан
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }
    getStatus() {//повертає поточний стан пристрою
        return this.isEnabled;
    }
}

export class SmartLight extends SmartDevice {//розширює SmartDevice, додаючи властивості для керування світлом
    constructor(id, name, lightObdject, meshObject) {//створює екземпляр розумного світла з заданими параметрами
        super(id, name);
        this.lightObdject = lightObdject;//зберігає посилання на об'єкт світла
        this.meshObject = meshObject;//зберігає посилання на об'єкт сітки, що представляє світло в сцені
        this.intensity = 1.5;
    }
    turnOn() {//вмикає світло, встановлюючи його інтенсивність та змінюючи колір сітки
        this.isEnabled = true;
        this.lightObdject.intensity = this.intensity;
        this.meshObject.material.color.set.Hex(0xffff00);//змінює колір сітки на жовтий, щоб візуально показати, що світло увімкнено
    }
    turnOff() {//вимикає світло, встановлюючи його інтенсивність та змінюючи колір сітки
        this.isEnabled = false;
        this.lightObdject.intensity = 0.1;//зменшує інтенсивність світла до мінімального значення
        this.meshObject.material.color.set.Hex(0x555555);
    }
    setIntensity(val) {//встановлює інтенсивність світла, якщо воно увімкнено
        this.intensity = val;
        if (this.isEnabled) {//перевіряє, чи світло увімкнено
            this.lightObdject.intensity = val;
        }
    }
}

export class MotionSensor extends SmartDevice {//розширює SmartDevice, додаючи властивості для керування датчиком руху
    constructor(id, name, sensorMesh, detectionRadius = 3.0) {//створює екземпляр датчика руху з заданими параметрами
        super(id, name);
        this.sensorMesh = sensorMesh;
        this.detectionRadius = detectionRadius;//зберігає радіус виявлення руху
        this.position = sensorMesh.position;//зберігає позицію датчика руху для перевірки близькості
        this.isTriggered = false;
    }
    checkProximity(cameraPosition) {//перевіряє, чи знаходиться камера в межах радіусу виявлення датчика руху
        const distance = cameraPosition.distanceTo(this.position);
        const triggered = distance < this.detectionRadius;//визначає, чи знаходиться камера в межах радіусу виявлення
        if(triggered !== this.isTriggered) {//перевіряє, чи змінився стан датчика руху
            this.isTriggered = triggered;
            this.sensorMesh.material.color.setHex(triggered ? 0xff0000 : 0x00ff00);//змінює колір сітки датчика руху залежно від того, чи було виявлено рух
        }
        return {distance, triggered};
    }
}