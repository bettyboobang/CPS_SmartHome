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
    constructor(id, name, lightObject, meshObject) {//створює екземпляр розумного світла з заданими параметрами
        super(id, name);
        this.lightObject = lightObject;//зберігає посилання на об'єкт світла
        this.meshObject = meshObject;//зберігає посилання на об'єкт сітки, що представляє світло в сцені
        this.intensity = 1.5;
    }
    turnOn() {//вмикає світло, встановлюючи його інтенсивність та змінюючи колір сітки
        this.isEnabled = true;
        this.lightObject.intensity = this.intensity;
        this.meshObject.material.color.setHex(0xffff00);//змінює колір сітки на жовтий, щоб візуально показати, що світло увімкнено
    }
    turnOff() {//вимикає світло, встановлюючи його інтенсивність та змінюючи колір сітки
        this.isEnabled = false;
        this.lightObject.intensity = 0.1;//зменшує інтенсивність світла до мінімального значення
        this.meshObject.material.color.setHex(0x555555);
    }
    setIntensity(val) {//встановлює інтенсивність світла, якщо воно увімкнено
        this.intensity = val;
        if (this.isEnabled) {//перевіряє, чи світло увімкнено
            this.lightObject.intensity = val;
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

class SmartLavaLamp extends SmartDevice {
    constructor(id, name, lightObject, meshObject) {
        super(id, name);
        this.light = lightObject;
        this.mesh = meshObject;
        this.color = '#8A2BE2';
    }

    turnOn() {
        this.isEnabled = true;
        this.light.intensity = 1.2;
        this.mesh.material.emissive.setHex(0x8A2BE2);
    }

    turnOff() {
        this.isEnabled = false;
        this.light.intensity = 0.1;
        this.mesh.material.emissive.setHex(0x220033);
    }

    setColor(hexColor) {
        this.color = hexColor;
        this.light.color.set(hexColor);
        this.mesh.material.emissive.set(hexColor);
    }
}
class SmartDoor extends SmartDevice {
    constructor(id, name, leftDoorMesh, rightDoorMesh) {
        super(id, name);
        this.leftDoor = leftDoorMesh;
        this.rightDoor = rightDoorMesh;
        this.isOpen = false;
        this.closedXLeft = leftDoorMesh.position.x;
        this.closedXRight = rightDoorMesh.position.x;
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.isEnabled = true;
            this.leftDoor.position.x = this.closedXLeft - 1.2;
            this.rightDoor.position.x = this.closedXRight + 1.2;
        }
    }

    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.isEnabled = false;
            this.leftDoor.position.x = this.closedXLeft;
            this.rightDoor.position.x = this.closedXRight;
        }
    }
}

class SmartWorkstation extends SmartDevice {
    constructor(id, name, screenMeshes, screenLight) {
        super(id, name);
        this.screens = screenMeshes;
        this.light = screenLight;
    }

    activate() {
        this.isEnabled = true;
        this.light.intensity = 1.0;
        this.screens.forEach(screen => {
            screen.material.emissive.setHex(0x00FFFF);
        });
    }

    deactivate() {
        this.isEnabled = false;
        this.light.intensity = 0.0;
        this.screens.forEach(screen => {
            screen.material.emissive.setHex(0x051111);
        });
    }
}