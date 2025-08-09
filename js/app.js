// Main application controller
class AttendanceApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentEmployee = null;
        this.init();
    }

    // Initialize the application
    async init() {
        this.setupEventListeners();
        this.initializeQR();
        await this.loadInitialData();
        await this.updateDashboard();
        this.updateCurrentDate();
        this.applyTheme();
        
        // Load sample data if no employees exist in Firebase
        const employees = await window.storage.getEmployees();
        if (employees.length === 0) {
            await window.storage.loadSampleData();
            await this.updateDashboard();
            await this.updateEmployeesList();
            Utils.showNotification('Datos de ejemplo cargados en Firebase', 'info');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                await this.switchTab(e.target.dataset.tab);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', async () => {
            await this.exportData();
        });

        // Employee management
        document.getElementById('add-employee').addEventListener('click', () => {
            this.showEmployeeModal();
        });

        document.getElementById('employee-form').addEventListener('submit', async (e) => {
            await this.handleEmployeeSubmit(e);
        });

        // Attendance
        document.getElementById('mark-attendance').addEventListener('click', async () => {
            await this.markAttendance();
        });

        document.getElementById('attendance-date').addEventListener('change', async (e) => {
            await this.loadAttendanceForDate(e.target.value);
        });

        // Reports
        document.getElementById('generate-report').addEventListener('click', async () => {
            await this.generateReport();
        });

        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Set current date for attendance
        document.getElementById('attendance-date').value = Utils.getCurrentDate();
    }

    // Initialize QR functionality
    initializeQR() {
        if (window.qrHandler) {
            window.qrHandler.init();
        }
    }

    // Load initial data
    async loadInitialData() {
        await this.updateEmployeesList();
        await this.updateEmployeeSelect();
        await this.loadAttendanceForDate(Utils.getCurrentDate());
    }

    // Switch between tabs
    async switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'dashboard':
                await this.updateDashboard();
                break;
            case 'employees':
                await this.updateEmployeesList();
                break;
            case 'attendance':
                await this.loadAttendanceForDate(document.getElementById('attendance-date').value);
                break;
            case 'reports':
                this.initializeReports();
                break;
        }
    }

    // Update dashboard statistics
    async updateDashboard() {
        const stats = await window.storage.getStatistics();
        
        // Update stat cards
        document.getElementById('total-employees').textContent = stats.totalEmployees;
        document.getElementById('present-today').textContent = stats.present;
        document.getElementById('absent-today').textContent = stats.absent;
        document.getElementById('late-today').textContent = stats.late;

        // Update today's attendance list
        await this.updateTodayAttendanceList();
    }

    // Update today's attendance list
    async updateTodayAttendanceList() {
        const todayAttendance = await window.storage.getTodayAttendance();
        const employees = await window.storage.getEmployees();
        const listContainer = document.getElementById('today-attendance-list');

        if (employees.length === 0) {
            listContainer.innerHTML = '<p class="text-center">No hay empleados registrados</p>';
            return;
        }

        let html = '';
        
        employees.forEach(employee => {
            const record = todayAttendance.find(r => r.employeeId === employee.id);
            const status = record ? record.status : 'absent';
            const time = record ? record.time : '--:--';
            const notes = record ? record.notes : '';

            html += `
                <div class="attendance-item ${status}">
                    <div class="employee-info">
                        <h4>${employee.name}</h4>
                        <p>${employee.department} - ${employee.position}</p>
                    </div>
                    <div class="attendance-status">
                        <span class="status-badge ${status}">
                            <i class="${Utils.getStatusIcon(status)}"></i>
                            ${Utils.getStatusText(status)}
                        </span>
                        <span class="time">${time}</span>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    }

    // Update current date display
    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            currentDateElement.textContent = Utils.formatDate(new Date());
        }
    }

    // Update employees list
    async updateEmployeesList() {
        const employees = await window.storage.getEmployees();
        const container = document.getElementById('employees-list');

        if (employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x"></i>
                    <h3>No hay empleados registrados</h3>
                    <p>Comience agregando empleados para gestionar la asistencia</p>
                </div>
            `;
            return;
        }

        let html = '';
        employees.forEach(employee => {
            html += `
                <div class="employee-card">
                    <div class="employee-header">
                        <div class="employee-info">
                            <h3>${employee.name}</h3>
                            <div class="employee-meta">
                                <p><i class="fas fa-building"></i> ${employee.department}</p>
                                <p><i class="fas fa-briefcase"></i> ${employee.position}</p>
                                <p><i class="fas fa-calendar"></i> Desde ${Utils.formatDate(employee.createdAt)}</p>
                            </div>
                        </div>
                        <div class="employee-actions">
                            <button class="btn-icon" onclick="app.showQRModal('${employee.id}')" title="Ver QR">
                                <i class="fas fa-qrcode"></i>
                            </button>
                            <button class="btn-icon" onclick="app.editEmployee('${employee.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="app.deleteEmployee('${employee.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Update employee select dropdown
    async updateEmployeeSelect() {
        const employees = await window.storage.getEmployees();
        const select = document.getElementById('employee-select');
        
        select.innerHTML = '<option value="">Seleccionar empleado...</option>';
        
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = employee.name;
            select.appendChild(option);
        });
    }

    // Show employee modal
    showEmployeeModal(employeeId = null) {
        const modal = document.getElementById('employee-modal');
        const form = document.getElementById('employee-form');
        const title = document.getElementById('modal-title');

        // Reset form
        form.reset();
        document.getElementById('employee-id').value = '';

        if (employeeId) {
            // Edit mode
            window.storage.getEmployeeById(employeeId).then(employee => {
                if (employee) {
                    title.textContent = 'Editar Empleado';
                    document.getElementById('employee-id').value = employee.id;
                    document.getElementById('employee-name').value = employee.name;
                    document.getElementById('employee-department').value = employee.department;
                    document.getElementById('employee-position').value = employee.position;
                }
            });
        } else {
            // Add mode
            title.textContent = 'Agregar Empleado';
        }

        modal.classList.add('active');
    }

    // Handle employee form submission
    async handleEmployeeSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const employeeData = {
            name: formData.get('employee-name') || document.getElementById('employee-name').value,
            department: formData.get('employee-department') || document.getElementById('employee-department').value,
            position: formData.get('employee-position') || document.getElementById('employee-position').value
        };

        // Validate required fields
        if (!employeeData.name || !employeeData.department || !employeeData.position) {
            Utils.showNotification('Todos los campos son obligatorios', 'error');
            return;
        }

        const employeeId = document.getElementById('employee-id').value;

        try {
            if (employeeId) {
                // Update existing employee
                await window.storage.updateEmployee(employeeId, employeeData);
                Utils.showNotification('Empleado actualizado correctamente', 'success');
            } else {
                // Add new employee
                await window.storage.addEmployee(employeeData);
                Utils.showNotification('Empleado agregado correctamente', 'success');
            }

            this.closeModal(document.getElementById('employee-modal'));
            await this.updateEmployeesList();
            await this.updateEmployeeSelect();
            await this.updateDashboard();

        } catch (error) {
            console.error('Error saving employee:', error);
            Utils.showNotification('Error al guardar empleado', 'error');
        }
    }

    // Edit employee
    editEmployee(employeeId) {
        this.showEmployeeModal(employeeId);
    }

    // Delete employee
    async deleteEmployee(employeeId) {
        const employee = await window.storage.getEmployeeById(employeeId);
        if (!employee) return;

        if (confirm(`¿Está seguro de eliminar a ${employee.name}? Esta acción no se puede deshacer.`)) {
            try {
                await window.storage.deleteEmployee(employeeId);
                Utils.showNotification('Empleado eliminado correctamente', 'success');
                await this.updateEmployeesList();
                await this.updateEmployeeSelect();
                await this.updateDashboard();
            } catch (error) {
                console.error('Error deleting employee:', error);
                Utils.showNotification('Error al eliminar empleado', 'error');
            }
        }
    }

    // Show QR modal for employee
    async showQRModal(employeeId) {
        const employee = await window.storage.getEmployeeById(employeeId);
        if (!employee) return;

        const modal = document.getElementById('qr-modal');
        
        try {
            await window.qrHandler.generateEmployeeQR(employee);
            modal.classList.add('active');
        } catch (error) {
            console.error('Error showing QR modal:', error);
            Utils.showNotification('Error al generar código QR', 'error');
        }
    }

    // Mark attendance
    async markAttendance() {
        const employeeId = document.getElementById('employee-select').value;
        const status = document.getElementById('status-select').value;
        const date = document.getElementById('attendance-date').value;
        const time = document.getElementById('time-input').value;
        const notes = document.getElementById('notes-input').value;

        // Validate required fields
        if (!employeeId) {
            Utils.showNotification('Seleccione un empleado', 'error');
            return;
        }

        if (!date) {
            Utils.showNotification('Seleccione una fecha', 'error');
            return;
        }

        // Use current time if not specified
        const finalTime = time || Utils.getCurrentTime();

        const record = {
            employeeId: employeeId,
            date: date,
            status: status,
            time: finalTime,
            notes: notes
        };

        try {
            await window.storage.addAttendanceRecord(record);
            const employee = await window.storage.getEmployeeById(employeeId);
            Utils.showNotification(`Asistencia registrada para ${employee.name}`, 'success');
            
            // Reset form
            document.getElementById('employee-select').value = '';
            document.getElementById('time-input').value = '';
            document.getElementById('notes-input').value = '';
            
            // Refresh data
            await this.loadAttendanceForDate(date);
            await this.updateDashboard();

        } catch (error) {
            console.error('Error marking attendance:', error);
            Utils.showNotification('Error al registrar asistencia', 'error');
        }
    }

    // Load attendance for specific date
    async loadAttendanceForDate(date) {
        const attendance = await window.storage.getAttendanceByDate(date);
        const employees = await window.storage.getEmployees();
        const container = document.getElementById('attendance-history');

        if (attendance.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times fa-2x"></i>
                    <p>No hay registros de asistencia para ${Utils.formatDate(date)}</p>
                </div>
            `;
            return;
        }

        let html = '<h3>Registros del día</h3><div class="attendance-records">';
        
        for (const record of attendance) {
            const employee = employees.find(emp => emp.id === record.employeeId);
            if (employee) {
                html += `
                    <div class="attendance-record ${record.status}">
                        <div class="record-info">
                            <h4>${employee.name}</h4>
                            <p>${employee.department}</p>
                        </div>
                        <div class="record-details">
                            <span class="status-badge ${record.status}">
                                <i class="${Utils.getStatusIcon(record.status)}"></i>
                                ${Utils.getStatusText(record.status)}
                            </span>
                            <span class="time">${record.time}</span>
                            ${record.notes ? `<p class="notes">${record.notes}</p>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        html += '</div>';
        container.innerHTML = html;
    }

    // Initialize reports
    initializeReports() {
        const today = Utils.getCurrentDate();
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        document.getElementById('report-start-date').value = startOfMonth;
        document.getElementById('report-end-date').value = today;
    }

    // Generate report
    async generateReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;

        if (!startDate || !endDate) {
            Utils.showNotification('Seleccione el rango de fechas', 'error');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            Utils.showNotification('La fecha de inicio debe ser anterior a la fecha final', 'error');
            return;
        }

        const attendance = await window.storage.getAttendanceByDateRange(startDate, endDate);
        const employees = await window.storage.getEmployees();
        const stats = Utils.calculateAttendanceStats(attendance, employees, startDate, endDate);

        this.displayReport(stats, startDate, endDate);
    }

    // Display report
    displayReport(stats, startDate, endDate) {
        const container = document.getElementById('report-content');
        
        let html = `
            <div class="report-header">
                <h3>Reporte de Asistencia</h3>
                <p>Período: ${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}</p>
                <p>Total de días: ${stats.totalDays} | Tasa de asistencia general: ${stats.attendanceRate}%</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <h4>Resumen General</h4>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="label">Días presentes:</span>
                            <span class="value">${stats.presentDays}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Tardanzas:</span>
                            <span class="value">${stats.lateDays}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Ausencias:</span>
                            <span class="value">${stats.absentDays}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="report-details">
                <h4>Detalle por Empleado</h4>
                <div class="employee-reports">
        `;

        stats.employeeStats.forEach(empStat => {
            html += `
                <div class="employee-report">
                    <div class="employee-header">
                        <h5>${empStat.employee.name}</h5>
                        <span class="attendance-rate">${empStat.attendanceRate}%</span>
                    </div>
                    <div class="employee-stats">
                        <div class="stat present">
                            <i class="fas fa-check"></i>
                            <span>Presente: ${empStat.present}</span>
                        </div>
                        <div class="stat late">
                            <i class="fas fa-clock"></i>
                            <span>Tardanza: ${empStat.late}</span>
                        </div>
                        <div class="stat absent">
                            <i class="fas fa-times"></i>
                            <span>Ausente: ${empStat.absent}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            
            <div class="report-actions">
                <button class="btn-primary" onclick="app.exportReport('${startDate}', '${endDate}')">
                    <i class="fas fa-download"></i> Exportar Reporte
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    // Export report
    async exportReport(startDate, endDate) {
        const attendance = await window.storage.getAttendanceByDateRange(startDate, endDate);
        const employees = await window.storage.getEmployees();
        
        // Prepare data for export
        const reportData = [];
        
        attendance.forEach(record => {
            const employee = employees.find(emp => emp.id === record.employeeId);
            if (employee) {
                reportData.push({
                    Fecha: record.date,
                    Empleado: employee.name,
                    Departamento: employee.department,
                    Cargo: employee.position,
                    Estado: Utils.getStatusText(record.status),
                    Hora: record.time,
                    Notas: record.notes || ''
                });
            }
        });

        const filename = `reporte_asistencia_${startDate}_${endDate}.csv`;
        Utils.exportToCSV(reportData, filename);
    }

    // Export all data
    async exportData() {
        const data = await window.storage.exportData();
        const filename = `backup_asistencia_${Utils.getCurrentDate()}.json`;
        Utils.exportToJSON(data, filename);
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        window.storage.saveSettings({ theme: newTheme });
        
        // Update icon
        const icon = document.querySelector('#theme-toggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Apply saved theme
    applyTheme() {
        const theme = window.storage.settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update icon
        const icon = document.querySelector('#theme-toggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Close modal
    closeModal(modal) {
        modal.classList.remove('active');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AttendanceApp();
});

// Handle page visibility change to update dashboard
document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && window.app) {
        await window.app.updateDashboard();
    }
});

