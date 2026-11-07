export class DeviceManager {
    constructor(serverUrl = 'http://localhost:3001/api') {
        this.serverUrl = serverUrl;
        this.devices = new Map();
        this.onStateSynced = null;
    }

    registerDevice(device) {
        this.devices.set(device.id, device);
    }

    getDevice(id) {
        return this.devices.get(id);
    }

    getAllInteractiveMeshes() {
        const meshes = [];
        this.devices.forEach(dev => {
            if (dev.meshGroup) meshes.push(dev.meshGroup);
        });
        return meshes;
    }

    async fetchState() {
        try {
            const res = await fetch(`${this.serverUrl}/devices`);
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();

            // Оновлюємо зареєстровані 3D пристрої
            if (data.devices) {
                for (let [id, devState] of Object.entries(data.devices)) {
                    const dev = this.devices.get(id);
                    if (dev) {
                        dev.setState(devState, true);
                    }
                }
            }

            if (this.onStateSynced) {
                this.onStateSynced(data);
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    async updateDevice(id, payload) {
        const dev = this.devices.get(id);
        if (dev) {
            dev.setState(payload, true);
        }

        try {
            const res = await fetch(`${this.serverUrl}/devices/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.warn(`[DeviceManager] Офлайн-режим для пристрою ${id}`);
        }
    }

    async triggerScenario(name) {
        try {
            const res = await fetch(`${this.serverUrl}/scenarios/${name}`, { method: 'POST' });
            const data = await res.json();
            if (data.success && data.state) {
                for (let [id, devState] of Object.entries(data.state.devices)) {
                    const dev = this.devices.get(id);
                    if (dev) dev.setState(devState, true);
                }
                if (this.onStateSynced) this.onStateSynced(data.state);
            }
        } catch (e) {
            console.warn(`[DeviceManager] Не вдалося активувати сценарій ${name}`);
        }
    }
}