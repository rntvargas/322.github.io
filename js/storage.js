// Storage module for handling data, now using Firebase
class AttendanceStorage {
    constructor() {
        this.firebase = window.firebaseService;
        this.settings = this.getSettings(); // Settings still in LocalStorage
    }

    // Employee management
    async getEmployees() {
        return await this.firebase.getEmployees();
    }

    async addEmployee(employee) {
        return await this.firebase.addEmployee(employee);
    }

    async updateEmployee(id, updates) {
        return await this.firebase.updateEmployee(id, updates);
    }

    async deleteEmployee(id) {
        await this.firebase.deleteEmployee(id);
    }

    async getEmployeeById(id) {
        const employees = await this.firebase.getEmployees();
        return employees.find(emp => emp.id === id);
    }

    // Attendance management
    async getAttendance() {
        return await this.firebase.getAttendance();
    }

    async addAttendanceRecord(record) {
        return await this.firebase.addAttendanceRecord(record);
    }

    async getAttendanceByDate(date) {
        return await this.firebase.getAttendanceByDate(date);
    }

    async getAttendanceByEmployee(employeeId) {
        return await this.firebase.getAttendanceByEmployee(employeeId);
    }

    async getAttendanceByDateRange(startDate, endDate) {
        return await this.firebase.getAttendanceByDateRange(startDate, endDate);
    }

    async getTodayAttendance() {
        const today = new Date().toISOString().split("T")[0];
        return await this.firebase.getAttendanceByDate(today);
    }

    // Settings management (still using LocalStorage for simplicity)
    getSettings() {
        const stored = localStorage.getItem("attendance_settings");
        return stored ? JSON.parse(stored) : {
            theme: "light",
            workStartTime: "09:00",
            workEndTime: "17:00",
            lateThreshold: 15, // minutes
            language: "es"
        };
    }

    saveSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem("attendance_settings", JSON.stringify(this.settings));
    }

    // Statistics
    async getStatistics(date = null) {
        const targetDate = date || new Date().toISOString().split("T")[0];
        const dayAttendance = await this.firebase.getAttendanceByDate(targetDate);
        const employees = await this.firebase.getEmployees();
        
        const stats = {
            totalEmployees: employees.length,
            present: dayAttendance.filter(r => r.status === "present").length,
            absent: employees.length - dayAttendance.length,
            late: dayAttendance.filter(r => r.status === "late").length
        };

        stats.absent = stats.totalEmployees - dayAttendance.length;
        
        return stats;
    }

    // Data export/import (now handles Firebase data)
    async exportData() {
        const employees = await this.firebase.getEmployees();
        const attendance = await this.firebase.getAttendance();
        return {
            employees: employees,
            attendance: attendance,
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    async importData(data) {
        try {
            // Clear existing data in Firebase first
            await this.firebase.clearAllData();

            if (data.employees) {
                for (const emp of data.employees) {
                    await this.firebase.addEmployee(emp);
                }
            }
            if (data.attendance) {
                for (const att of data.attendance) {
                    await this.firebase.addAttendanceRecord(att);
                }
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            return true;
        } catch (error) {
            console.error("Error importing data:", error);
            return false;
        }
    }

    // Clear all data (from Firebase)
    async clearAllData() {
        await this.firebase.clearAllData();
    }

    // Sample data for testing (to Firebase)
    async loadSampleData() {
        await this.firebase.loadSampleData();
    }
}

// Create global storage instance
window.storage = new AttendanceStorage();


