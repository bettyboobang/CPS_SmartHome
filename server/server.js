const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- ДОДАНО

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// <-- ДОДАНО: автоматично відкривати файли з папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// База даних стану кіберфізичних пристроїв кімнати Текни
const smartRoomState = {
    roomInfo: {
        owner: "Tecna (Winx Club)",
        realm: "Zenith",
        status: "ONLINE_SECURE"
    },
    devices: {
        mainTerminal: { id: "mainTerminal", name: "Головний термінал Zen-OS", state: true, mode: "Diagnostic", cpuLoad: 42 },
        podBed: { id: "podBed", name: "Біометричне ліжко-капсула", state: true, blanketHeating: true, targetTemp: 22.5 },
        cyberDoor: { id: "cyberDoor", name: "Арочний магнітний замок", locked: false, open: true },
        plasmaLamp: { id: "plasmaLamp", name: "Неонова лава-лампа", state: true, color: "#9b51e0", pulseSpeed: 1.2 },
        ambientLighting: { id: "ambientLighting", name: "Підсвічування кімнати", state: true, color: "#4df2c2", brightness: 0.85 },
        climateControl: { id: "climateControl", name: "Клімат-контроль Zenith Air", state: true, temperature: 21.8, airPurifier: true },
        servoArms: { id: "servoArms", name: "Маніпулятори-сканери", state: true, activeScan: true },
        deskClock: { id: "deskClock", name: "Квантовий годинник", state: true, time: "12:00" }
    }
};

// Отримання даних
app.get('/api/devices', (req, res) => {
    smartRoomState.devices.mainTerminal.cpuLoad = Math.floor(35 + Math.random() * 25);
    smartRoomState.devices.climateControl.temperature = Number((21.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
    res.json(smartRoomState);
});

// Зміна параметрів
app.post('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (!smartRoomState.devices[id]) {
        return res.status(404).json({ error: `Пристрій ${id} не знайдено` });
    }
    smartRoomState.devices[id] = { ...smartRoomState.devices[id], ...updates };
    res.json({ success: true, device: smartRoomState.devices[id] });
});

// Сценарії
app.post('/api/scenarios/:name', (req, res) => {
    const { name } = req.params;
    if (name === 'night') {
        smartRoomState.devices.ambientLighting.brightness = 0.2;
        smartRoomState.devices.ambientLighting.color = "#103833";
        smartRoomState.devices.mainTerminal.state = false;
        smartRoomState.devices.cyberDoor.locked = true;
        smartRoomState.devices.cyberDoor.open = false;
    } else if (name === 'work') {
        smartRoomState.devices.ambientLighting.brightness = 0.95;
        smartRoomState.devices.ambientLighting.color = "#4df2c2";
        smartRoomState.devices.mainTerminal.state = true;
    } else if (name === 'defense') {
        smartRoomState.devices.ambientLighting.color = "#ff3366";
        smartRoomState.devices.ambientLighting.brightness = 1.0;
        smartRoomState.devices.cyberDoor.locked = true;
        smartRoomState.devices.cyberDoor.open = false;
    } else {
        smartRoomState.devices.ambientLighting.brightness = 0.85;
        smartRoomState.devices.ambientLighting.color = "#4df2c2";
        smartRoomState.devices.cyberDoor.locked = false;
        smartRoomState.devices.cyberDoor.open = true;
        smartRoomState.devices.mainTerminal.state = true;
    }
    res.json({ success: true, scenario: name, state: smartRoomState });
});

// Головна сторінка віддає index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`⚡ [Tecna's CPS Server] запущено!`);
    console.log(`👉 Відкрийте в браузері: http://localhost:${PORT}`);
});