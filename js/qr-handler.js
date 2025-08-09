// QR Handler module for generating and scanning QR codes
class QRHandler {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.video = null;
        this.canvas = null;
    }

    // Initialize QR functionality
    init() {
        this.video = document.getElementById("qr-video");
        this.canvas = document.getElementById("qr-canvas");
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start scanner button
        document.getElementById("start-scanner").addEventListener("click", () => {
            this.startScanner();
        });

        // Stop scanner button
        document.getElementById("stop-scanner").addEventListener("click", () => {
            this.stopScanner();
        });

        // Download QR button
        document.getElementById("download-qr").addEventListener("click", () => {
            this.downloadQR();
        });
    }

    // Generate QR code for employee
    async generateEmployeeQR(employee) {
        try {
            const qrData = {
                type: "employee",
                id: employee.id,
                name: employee.name,
                timestamp: Date.now()
            };

            const qrString = JSON.stringify(qrData);
            
            // Clear previous QR
            if (this.canvas) {
                const ctx = this.canvas.getContext("2d");
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }

            // Generate QR code
            await QRCode.toCanvas(this.canvas, qrString, {
                width: 256,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF"
                }
            });

            // Update modal content
            document.getElementById("qr-employee-name").textContent = employee.name;
            
            return qrString;
        } catch (error) {
            console.error("Error generating QR code:", error);
            this.showMessage("Error al generar código QR", "error");
            return null;
        }
    }

    // Start QR scanner
    async startScanner() {
        try {
            if (this.isScanning) return;

            // Check if QrScanner is available globally
            if (typeof QrScanner === "undefined") {
                this.showMessage("Escáner QR no disponible. Verifique que las librerías estén cargadas.", "error");
                return;
            }

            // Request camera permission
            const hasCamera = await QrScanner.hasCamera();
            if (!hasCamera) {
                this.showMessage("No se encontró cámara disponible", "error");
                return;
            }

            // Create scanner instance
            this.scanner = new QrScanner(
                this.video,
                (result) => this.handleScanResult(result),
                {
                    onDecodeError: (error) => {
                        // Silently handle decode errors (normal when no QR is visible)
                        console.debug("QR decode error:", error);
                    },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            // Start scanning
            await this.scanner.start();
            this.isScanning = true;

            // Update UI
            document.getElementById("start-scanner").style.display = "none";
            document.getElementById("stop-scanner").style.display = "inline-flex";
            document.getElementById("qr-result").innerHTML = "<p>Escaneando... Apunte la cámara hacia un código QR</p>";

        } catch (error) {
            console.error("Error starting scanner:", error);
            this.showMessage("Error al iniciar el escáner: " + error.message, "error");
        }
    }

    // Stop QR scanner
    stopScanner() {
        if (this.scanner && this.isScanning) {
            this.scanner.stop();
            this.scanner.destroy();
            this.scanner = null;
            this.isScanning = false;

            // Update UI
            document.getElementById("start-scanner").style.display = "inline-flex";
            document.getElementById("stop-scanner").style.display = "none";
            document.getElementById("qr-result").innerHTML = "<p>Escáner detenido</p>";
        }
    }

    // Handle scan result
    async handleScanResult(result) {
        try {
            console.log("QR scanned:", result);
            
            // Try to parse as JSON
            let qrData;
            try {
                qrData = JSON.parse(result);
            } catch (e) {
                // If not JSON, treat as simple text (maybe employee ID)
                qrData = { type: "simple", data: result };
            }

            if (qrData.type === "employee" && qrData.id) {
                await this.handleEmployeeQR(qrData);
            } else {
                // Try to find employee by ID or name
                await this.handleSimpleQR(result);
            }

        } catch (error) {
            console.error("Error handling scan result:", error);
            this.showMessage("Error al procesar código QR", "error");
        }
    }

    // Handle employee QR code
    async handleEmployeeQR(qrData) {
        const employee = await window.storage.getEmployeeById(qrData.id);
        if (employee) {
            await this.markAttendanceFromQR(employee);
        } else {
            this.showMessage("Empleado no encontrado: " + qrData.name, "error");
        }
    }

    // Handle simple QR code (try to match with employee)
    async handleSimpleQR(data) {
        // Try to find employee by ID or name
        const employees = await window.storage.getEmployees();
        const employee = employees.find(emp => 
            emp.id === data || 
            emp.name.toLowerCase().includes(data.toLowerCase())
        );

        if (employee) {
            await this.markAttendanceFromQR(employee);
        } else {
            this.showMessage("No se pudo identificar al empleado del código QR: " + data, "error");
        }
    }

    // Mark attendance from QR scan
    async markAttendanceFromQR(employee) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().slice(0, 5);

        // Check if already marked today
        const existingRecord = (await window.storage.getAttendanceByDate(today))
            .find(record => record.employeeId === employee.id);

        if (existingRecord) {
            this.showMessage(`${employee.name} ya tiene asistencia registrada hoy (${existingRecord.status})`, "warning");
            return;
        }

        // Determine status based on time
        const workStartTime = window.storage.settings.workStartTime || "09:00";
        const lateThreshold = window.storage.settings.lateThreshold || 15;
        
        const startTime = new Date(`${today}T${workStartTime}`);
        const currentDateTime = new Date(`${today}T${currentTime}`);
        const diffMinutes = (currentDateTime - startTime) / (1000 * 60);

        let status = "present";
        if (diffMinutes > lateThreshold) {
            status = "late";
        }

        // Add attendance record
        const record = {
            employeeId: employee.id,
            date: today,
            status: status,
            time: currentTime,
            notes: "Registrado por QR"
        };

        await window.storage.addAttendanceRecord(record);

        // Show success message
        const statusText = status === "late" ? "TARDANZA" : "PRESENTE";
        this.showMessage(`✅ ${employee.name} - ${statusText} (${currentTime})`, "success");

        // Update dashboard if visible
        if (window.app && window.app.updateDashboard) {
            await window.app.updateDashboard();
        }

        // Stop scanner after successful scan
        setTimeout(() => {
            this.stopScanner();
        }, 2000);
    }

    // Download QR code
    downloadQR() {
        if (!this.canvas) return;

        try {
            // Create download link
            const link = document.createElement("a");
            link.download = "employee-qr.png";
            link.href = this.canvas.toDataURL();
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showMessage("Código QR descargado", "success");
        } catch (error) {
            console.error("Error downloading QR:", error);
            this.showMessage("Error al descargar código QR", "error");
        }
    }

    // Show message to user
    showMessage(message, type = "info") {
        const resultDiv = document.getElementById("qr-result");
        if (resultDiv) {
            const className = type === "error" ? "error" : type === "success" ? "success" : type === "warning" ? "warning" : "info";
            resultDiv.innerHTML = `<p class="${className}">${message}</p>`;
            
            // Add CSS classes for styling
            resultDiv.className = `qr-result ${className}`;
            
            // Clear message after 5 seconds for non-error messages
            if (type !== "error") {
                setTimeout(() => {
                    if (resultDiv.textContent === message) {
                        resultDiv.innerHTML = "<p>Listo para escanear</p>";
                        resultDiv.className = "qr-result";
                    }
                }, 5000);
            }
        }
    }

    // Generate QR for all employees (batch)
    async generateAllEmployeeQRs() {
        const employees = await window.storage.getEmployees();
        const qrCodes = [];

        for (const employee of employees) {
            try {
                const qrData = {
                    type: "employee",
                    id: employee.id,
                    name: employee.name,
                    timestamp: Date.now()
                };

                const qrString = JSON.stringify(qrData);
                
                // Create a temporary canvas for each QR
                const tempCanvas = document.createElement("canvas");
                await QRCode.toCanvas(tempCanvas, qrString, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF"
                    }
                });

                qrCodes.push({
                    employee: employee,
                    canvas: tempCanvas,
                    dataUrl: tempCanvas.toDataURL()
                });

            } catch (error) {
                console.error(`Error generating QR for ${employee.name}:`, error);
            }
        }

        return qrCodes;
    }

    // Cleanup when page unloads
    cleanup() {
        if (this.scanner && this.isScanning) {
            this.stopScanner();
        }
    }
}

// Create global QR handler instance
window.qrHandler = new QRHandler();

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
    if (window.qrHandler) {
        window.qrHandler.cleanup();
    }
});
