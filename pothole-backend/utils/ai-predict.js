const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const predictPothole = (imageBuffer) => {
    return new Promise((resolve, reject) => {
        try {
            const scriptPath = path.join(__dirname, '../ml-model/predict.py');
            
            // Create temporary file
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const tempFilePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
            fs.writeFileSync(tempFilePath, imageBuffer);
            
            console.log('🔄 Starting AI verification...');
            
            // Auto-detect Python path
            const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
            
            const pythonProcess = spawn(pythonCommand, [scriptPath, tempFilePath]);

            let result = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                // Filter out TensorFlow info logs
                const logLine = data.toString();
                if (!logLine.includes('oneDNN') && 
                    !logLine.includes('CPU instructions') &&
                    !logLine.includes('TensorFlow binary')) {
                    console.error('❌ AI Error:', logLine);
                }
            });

            pythonProcess.on('close', (code) => {
                // Clean up temp file
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (e) {
                    // Silent cleanup
                }
                
                if (code === 0) {
                    try {
                        const output = JSON.parse(result);
                        console.log(`✅ AI Confidence: ${(output.confidence * 100).toFixed(1)}%`);
                        resolve(output.confidence);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse AI output`));
                    }
                } else {
                    reject(new Error(`AI verification failed`));
                }
            });

            pythonProcess.on('error', (error) => {
                reject(new Error(`AI service unavailable - make sure Python is installed`));
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { predictPothole };