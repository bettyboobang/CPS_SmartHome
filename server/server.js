const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

const devicesState = {
    smart_light_1: { id: 'smart_light_1', name: 'Smart Light', status: 'OFF', intensity: 1.5 },
    motion_sensor_1: { id: 'motion_sensor_1', name: 'Motion Sensor', triggered: false }
};

const telemetryLogs = [];

app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Smart Home Backend Active' });
});

app.get('/api/devices', (req, res) => {
    res.json(devicesState);
});

app.post('/api/telemetry', (req, res) => {
    const { event, data, timestamp } = req.body;
    const logEntry = { id: telemetryLogs.length + 1, event, data, timestamp };
    telemetryLogs.push(logEntry);
    console.log(`[Smart Home Telemetry ${timestamp}] ${event}:`, data);
    res.json({ success: true, logged: logEntry });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`---------------------------------`);
    console.log(`Smart Home Server running at http://localhost:${PORT}`);
    console.log(`Serving frontend from: ${frontendPath}`);
});