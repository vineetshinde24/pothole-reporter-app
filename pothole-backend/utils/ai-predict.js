const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptPath = path.join(__dirname, '../ml-model/predict.py');
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// ✅ Temp dir setup
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// ✅ Generic function to run predict.py with a mode
const runPrediction = (imageBuffer, mode) => {
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${mode}.jpg`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        const pythonProcess = spawn(pythonCommand, [scriptPath, tempFilePath, mode]);
        let result = '';

        pythonProcess.stdout.on('data', (data) => { result += data.toString(); });

        pythonProcess.stderr.on('data', (data) => {
            const logLine = data.toString();
            if (!logLine.includes('oneDNN') &&
                !logLine.includes('CPU instructions') &&
                !logLine.includes('TensorFlow binary') &&
                !logLine.includes('Loading') &&
                !logLine.includes('loaded')) {
                console.error('❌ AI Error:', logLine);
            }
        });

        pythonProcess.on('close', (code) => {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}

            if (code === 0) {
                try {
                    resolve(JSON.parse(result));
                } catch (e) {
                    reject(new Error(`Failed to parse AI output: ${result}`));
                }
            } else {
                reject(new Error(`AI process exited with code ${code}`));
            }
        });

        pythonProcess.on('error', () => {
            reject(new Error('AI service unavailable - make sure Python is installed'));
        });
    });
};

// ✅ Detection
const predictPothole = async (imageBuffer) => {
    console.log('🔄 Starting AI verification...');
    const output = await runPrediction(imageBuffer, 'detect');
    console.log(`✅ AI Confidence: ${(output.confidence * 100).toFixed(1)}%`);
    return output.confidence;
};

// ✅ Severity
const predictSeverity = async (imageBuffer) => {
    console.log('🔄 Starting severity analysis...');
    const output = await runPrediction(imageBuffer, 'severity');
    console.log(`✅ Severity: ${output.severity} (${(output.severity_confidence * 100).toFixed(1)}%)`);
    return output;
};

module.exports = { predictPothole, predictSeverity };