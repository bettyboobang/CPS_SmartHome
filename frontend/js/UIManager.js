export class UIManager {
    constructor(deviceManager) {
        this.deviceManager = deviceManager;
        this.promptEl = document.getElementById('interactive-prompt');
        this.promptNameEl = document.getElementById('prompt-device-name');
        this.backendStatusEl = document.getElementById('backend-status');

        this.initGUI();
        this.initScenarios();
    }

    setServerStatus(online) {
    if (!this.backendStatusEl) {
        this.backendStatusEl = document.getElementById('backend-status');
    }
    if (this.backendStatusEl) {
        if (online) {
            this.backendStatusEl.innerText = "Сервер: З'єднано (Zenith CPS Online)";
            this.backendStatusEl.className = "status-connected";
        } else {
            this.backendStatusEl.innerText = "Сервер: Офлайн (Локальний автономний режим)";
            this.backendStatusEl.className = "status-disconnected";
        }
    }
}

    updateHUD(state) {
        if (!state || !state.devices) return;
        const tempEl = document.getElementById('hud-temp');
        const cpuEl = document.getElementById('hud-cpu');
        const doorEl = document.getElementById('hud-door');

        if (tempEl) tempEl.innerText = `${state.devices.climateControl.temperature} °C`;
        if (cpuEl) cpuEl.innerText = `${state.devices.mainTerminal.cpuLoad}%`;
        if (doorEl) doorEl.innerText = state.devices.cyberDoor.locked ? "LOCKED" : "OPEN";
    }

    showPrompt(name) {
        if (this.promptEl && this.promptNameEl) {
            this.promptNameEl.innerText = name;
            this.promptEl.style.opacity = '1';
        }
    }

    hidePrompt() {
        if (this.promptEl) this.promptEl.style.opacity = '0';
    }

    initGUI() {
        const gui = new lil.GUI({ title: "🎛️ Zenith CPS Control Panel" });
        const p = {
            terminal: true,
            doorLock: false,
            bedHeating: true,
            lamp: true,
            ambientColor: '#4df2c2',
            brightness: 0.85
        };

        const fMain = gui.addFolder('Термінал & Двері');
        fMain.add(p, 'terminal').name('Термінал Zen-OS').onChange(v => this.deviceManager.updateDevice('mainTerminal', { state: v }));
        fMain.add(p, 'doorLock').name('Кібер-Замок').onChange(v => this.deviceManager.updateDevice('cyberDoor', { locked: v, open: !v }));

        const fBed = gui.addFolder('Ліжко-Капсула');
        fBed.add(p, 'bedHeating').name('Підігрів чип-ковдри').onChange(v => this.deviceManager.updateDevice('podBed', { blanketHeating: v }));

        const fLight = gui.addFolder('Освітлення');
        fLight.add(p, 'lamp').name('Лава-лампа').onChange(v => this.deviceManager.updateDevice('plasmaLamp', { state: v }));
        fLight.addColor(p, 'ambientColor').name('Колір кімнати').onChange(v => this.deviceManager.updateDevice('ambientLighting', { color: v }));
        fLight.add(p, 'brightness', 0.1, 1.5, 0.05).name('Яскравість').onChange(v => this.deviceManager.updateDevice('ambientLighting', { brightness: v }));

        gui.add({ fn: () => this.deviceManager.triggerScenario('work') }, 'fn').name('⚡ Режим "Робота"');
        gui.add({ fn: () => this.deviceManager.triggerScenario('night') }, 'fn').name('🌙 Режим "Сон"');
        gui.add({ fn: () => this.deviceManager.triggerScenario('defense') }, 'fn').name('🛡️ "Кібер-Захист"');
    }

    initScenarios() {
        document.querySelectorAll('.btn-scen').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const scenario = btn.getAttribute('data-scenario');
                this.deviceManager.triggerScenario(scenario);
            });
        });
    }
}