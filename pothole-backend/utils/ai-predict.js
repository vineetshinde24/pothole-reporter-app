const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptPath = path.join(__dirname, '../ml-model/predict.py');
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// Temp folder for input images
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// --- RUN PREDICTION ---
const runPrediction = (imageBuffer, mode) => {
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${mode}.jpg`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        const pythonProcess = spawn(pythonCommand, [scriptPath, tempFilePath, mode]);
        let result = '';

        pythonProcess.stdout.on('data', (data) => { result += data.toString(); });

        pythonProcess.stderr.on('data', (data) => {
            const line = data.toString();
            if (!line.includes('oneDNN') &&
                !line.includes('CPU instructions') &&
                !line.includes('TensorFlow binary') &&
                !line.includes('Loading') &&
                !line.includes('loaded')) {
                console.error('❌ AI Error:', line);
            }
        });

        pythonProcess.on('close', (code) => {
            try { fs.unlinkSync(tempFilePath); } catch {}
            if (code === 0) {
                try { resolve(JSON.parse(result)); }
                catch (e) { reject(new Error(`Failed to parse output: ${result}`)); }
            } else {
                reject(new Error(`Python exited with code ${code}`));
            }
        });

        pythonProcess.on('error', () => reject(new Error('Python not available')));
    });
};

// --- PUBLIC FUNCTIONS ---
const predictPothole = async (imageBuffer) => {
    console.log('🔄 Running pothole detection...');
    const output = await runPrediction(imageBuffer, 'detect');
    console.log(`✅ Confidence: ${(output.confidence * 100).toFixed(1)}%`);
    return output.confidence;
};

const predictSeverity = async (imageBuffer) => {
    console.log('🔄 Running severity prediction...');
    const output = await runPrediction(imageBuffer, 'severity');
    console.log(`✅ Severity: ${output.severity} (${(output.severity_confidence * 100).toFixed(1)}%)`);
    return output;
};

module.exports = { predictPothole, predictSeverity };