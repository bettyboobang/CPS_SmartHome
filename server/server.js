const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const devicesState = {//ініціалізує стан пристроїв у системі, включаючи розумне світло та датчик руху
    smart_light_1: { id: 'smart_light_1', name: 'Smart Light', status: 'OFF', intensity: 1.5 },
    motion_sensor_1: { id: 'motion_sensor_1', name: 'Motion Sensor', triggered: false }
};

const telemetryLogs = [];//ініціалізує масив для зберігання журналів телеметрії, що містить інформацію про події та дані, отримані від пристроїв

app.get('/api/status', (req, res) => {//обробляє GET-запит на /api/status, повертаючи статус сервера та повідомлення про активність бекенду
    res.json({ status: 'OK', message: 'CPS Smart Home Backend Active' });
});

app.get('/api/devices', (req, res) => {//обробляє GET-запит на /api/devices, повертаючи поточний стан усіх пристроїв у системі
    res.json(devicesState);
});

app.post('/api/telemetry', (req, res) => {//обробляє POST-запит на /api/telemetry, отримуючи дані телеметрії від пристроїв та зберігаючи їх у масиві журналів телеметрії
    const { event, data, timestamp } = req.body;
    const logEntry = { id: telemetryLogs.length + 1, event, data, timestamp };
    telemetryLogs.push(logEntry);

    console.log(`[Telemetry Log ${timestamp}] Event: ${event}`, data);
    res.json({ success: true, logged: logEntry });
});

app.listen(PORT, () => {
    console.log(`----------------------------------------------`);
    console.log(`Smart Home Server running on http://localhost:${PORT}`);
});