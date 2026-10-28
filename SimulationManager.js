export class SimulationEngine {//керує симуляцією розумного будинку, перевіряючи стан датчика руху та керуючи світлом на основі цього стану, а також відправляючи телеметрію на бекенд
    constructor(deviceManager, backendUrl = 'http://localhost:3000') {
        this.deviceManager = deviceManager;
        this.backendUrl = backendUrl;
        this.autoMode = true;
        this.backendConnected = false;
        this.checkBackendConnection();
    }

    async checkBackendConnection() {//перевіряє підключення до бекенду, надсилаючи запит на /api/status та оновлюючи стан підключення та елемент статусу на сторінці
        try {//надсилає запит на бекенд для перевірки його доступності
            const res = await fetch(`${this.backendUrl}/api/status`);
            if (res.ok) {
                this.backendConnected = true;
                const statusElem = document.getElementById('backend-status');
                if (statusElem) {
                    statusElem.textContent = 'Сервер підключено';
                    statusElem.className = 'status-connected';
                }
            }
        } catch (err) {//якщо запит не вдався, встановлює стан підключення як false та виводить попередження в консоль
            console.warn('Сервер бекенду недоступний. Автономний режим.');
        }
    }

    update(cameraPosition) {//оновлює стан симуляції, перевіряючи стан датчика руху та керуючи світлом на основі цього стану, а також відправляючи телеметрію на бекенд
        const sensor = this.deviceManager.getDeviceById('motion_sensor_1');//отримує екземпляр датчика руху з DeviceManager за його id
        const light = this.deviceManager.getDeviceById('smart_light_1');//отримує екземпляр розумного світла з DeviceManager за його id

        if (!sensor || !light) return { distance: 0, triggered: false };//перевіряє, чи існують датчик руху та розумне світло, і якщо ні, повертає значення за замовчуванням

        const { distance, triggered } = sensor.checkProximity(cameraPosition);//перевіряє, чи знаходиться камера в межах радіусу виявлення датчика руху та отримує відстань і стан тригера

        if (this.autoMode) {//якщо увімкнено автоматичний режим, керує станом розумного світла на основі стану датчика руху та відправляє телеметрію на бекенд
            if (triggered && !light.getStatus()) {
                light.turnOn();
                this.sendTelemetry('light_auto_on', { distance });
            } else if (!triggered && light.getStatus()) {
                light.turnOff();
                this.sendTelemetry('light_auto_off', { distance });
            }
        }
        return { distance, triggered };
    }

    async sendTelemetry(event, data) {//відправляє телеметрію на бекенд, якщо підключення до нього встановлено, надсилаючи POST-запит на /api/telemetry з даними події та поточним часом
        if (!this.backendConnected) return;//перевіряє, чи встановлено підключення до бекенду, і якщо ні, припиняє виконання функції
        try {//надсилає POST-запит на бекенд з даними телеметрії
            await fetch(`${this.backendUrl}/api/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
            });
        } catch (e) {//якщо запит не вдався, виводить помилку в консоль
            console.error('Помилка відправки телеметрії:', e);
        }
    }
}