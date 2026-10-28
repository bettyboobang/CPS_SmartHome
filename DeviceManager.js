export class DeviceManager {//керує колекцією розумних пристроїв, дозволяючи додавати, отримувати та отримувати всі пристрої
    constructor() {
        this.devices = new Map();//зберігає всі пристрої в колекції Map, де ключем є id пристрою, а значенням є екземпляр пристрою
    }
    addDevice(device) {
        this.devices.set(device.id, device);//додає пристрій до колекції Map
    }
    getDeviceById(id) {
        return this.devices.get(id);//повертає пристрій за його id
    }
    getAllDevices() {
        return Array.from(this.devices.values());//повертає масив всіх пристроїв у колекції Map
    }
}