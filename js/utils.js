// Utility functions for the attendance app
class Utils {
    // Format date to readable string
    static formatDate(date, locale = 'es-ES') {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format time to readable string
    static formatTime(time) {
        if (typeof time === 'string' && time.includes(':')) {
            return time;
        }
        if (time instanceof Date) {
            return time.toTimeString().slice(0, 5);
        }
        return time;
    }

    // Get current date in YYYY-MM-DD format
    static getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    // Get current time in HH:MM format
    static getCurrentTime() {
        return new Date().toTimeString().slice(0, 5);
    }

    // Calculate if time is late
    static isLate(arrivalTime, workStartTime, lateThreshold = 15) {
        const arrival = new Date(`2000-01-01T${arrivalTime}`);
        const start = new Date(`2000-01-01T${workStartTime}`);
        const diffMinutes = (arrival - start) / (1000 * 60);
        return diffMinutes > lateThreshold;
    }

    // Get status color class
    static getStatusClass(status) {
        switch (status) {
            case 'present': return 'present';
            case 'absent': return 'absent';
            case 'late': return 'late';
            default: return '';
        }
    }

    // Get status icon
    static getStatusIcon(status) {
        switch (status) {
            case 'present': return 'fas fa-check';
            case 'absent': return 'fas fa-times';
            case 'late': return 'fas fa-clock';
            default: return 'fas fa-question';
        }
    }

    // Get status text in Spanish
    static getStatusText(status) {
        switch (status) {
            case 'present': return 'Presente';
            case 'absent': return 'Ausente';
            case 'late': return 'Tardanza';
            default: return 'Desconocido';
        }
    }

    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate time format (HH:MM)
    static isValidTime(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Position notification
        this.positionNotification(notification);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        return notification;
    }

    static getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    static positionNotification(notification) {
        const notifications = document.querySelectorAll('.notification');
        let top = 20;
        notifications.forEach((notif, index) => {
            if (notif !== notification) {
                top += notif.offsetHeight + 10;
            }
        });
        notification.style.top = `${top}px`;
    }

    static removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Export data to CSV
    static exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            this.showNotification('No hay datos para exportar', 'warning');
            return;
        }

        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header] || '';
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvContent += values.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Archivo CSV descargado', 'success');
        }
    }

    // Export data to JSON
    static exportToJSON(data, filename) {
        if (!data) {
            this.showNotification('No hay datos para exportar', 'warning');
            return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Archivo JSON descargado', 'success');
        }
    }

    // Import data from file
    static importFromFile(file, callback) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let data;
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(e.target.result);
                } else if (file.name.endsWith('.csv')) {
                    data = Utils.parseCSV(e.target.result);
                } else {
                    throw new Error('Formato de archivo no soportado');
                }
                
                callback(null, data);
            } catch (error) {
                callback(error, null);
            }
        };
        
        reader.onerror = function() {
            callback(new Error('Error al leer el archivo'), null);
        };
        
        reader.readAsText(file);
    }

    // Parse CSV content
    static parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        
        return data;
    }

    // Calculate attendance statistics
    static calculateAttendanceStats(attendance, employees, startDate, endDate) {
        const stats = {
            totalDays: 0,
            totalEmployees: employees.length,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            attendanceRate: 0,
            employeeStats: []
        };

        // Calculate date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        stats.totalDays = daysDiff;

        // Calculate per employee stats
        employees.forEach(employee => {
            const employeeAttendance = attendance.filter(record => record.employeeId === employee.id);
            const present = employeeAttendance.filter(r => r.status === 'present').length;
            const late = employeeAttendance.filter(r => r.status === 'late').length;
            const absent = daysDiff - employeeAttendance.length;

            stats.employeeStats.push({
                employee: employee,
                present: present,
                late: late,
                absent: absent,
                attendanceRate: ((present + late) / daysDiff * 100).toFixed(1)
            });

            stats.presentDays += present;
            stats.lateDays += late;
            stats.absentDays += absent;
        });

        // Calculate overall attendance rate
        const totalPossibleDays = stats.totalEmployees * daysDiff;
        const totalPresentDays = stats.presentDays + stats.lateDays;
        stats.attendanceRate = totalPossibleDays > 0 ? (totalPresentDays / totalPossibleDays * 100).toFixed(1) : 0;

        return stats;
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check if device is mobile
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get browser info
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            browser: browser,
            userAgent: ua,
            isMobile: this.isMobile()
        };
    }
}

// Add notification styles if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            right: 20px;
            z-index: 10000;
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--primary-color);
            min-width: 300px;
            max-width: 400px;
            opacity: 1;
            transform: translateX(0);
            transition: all 0.3s ease-in-out;
        }
        
        .notification-success { border-left-color: var(--success-color); }
        .notification-error { border-left-color: var(--danger-color); }
        .notification-warning { border-left-color: var(--warning-color); }
        
        .notification-content {
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-content i {
            font-size: 1.25rem;
        }
        
        .notification-success i { color: var(--success-color); }
        .notification-error i { color: var(--danger-color); }
        .notification-warning i { color: var(--warning-color); }
        .notification-info i { color: var(--primary-color); }
        
        .notification-content span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0.25rem;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
}

// Make Utils available globally
window.Utils = Utils;

