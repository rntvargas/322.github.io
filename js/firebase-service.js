// Firebase service using compat SDK
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfwWrmC2wXZ8lpaZt7Wl9r5pz9WX06Qzw",
  authDomain: "asistenciauniversitaria-d153b.firebaseapp.com",
  projectId: "asistenciauniversitaria-d153b",
  storageBucket: "asistenciauniversitaria-d153b.firebasestorage.app",
  messagingSenderId: "869404372749",
  appId: "1:869404372749:web:eb82f4ed548932254d0a44",
  measurementId: "G-SQ219LRRRW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class FirebaseService {
    constructor() {
        this.employeesCol = db.collection("employees");
        this.attendanceCol = db.collection("attendance");
    }

    // Employee functions
    async getEmployees() {
        try {
            const snapshot = await this.employeesCol.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting employees:", error);
            throw error;
        }
    }

    async addEmployee(employee) {
        try {
            const docRef = await this.employeesCol.add({ 
                ...employee, 
                createdAt: new Date().toISOString() 
            });
            return { id: docRef.id, ...employee, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error("Error adding employee:", error);
            throw error;
        }
    }

    async updateEmployee(id, updates) {
        try {
            await this.employeesCol.doc(id).update(updates);
            return { id, ...updates };
        } catch (error) {
            console.error("Error updating employee:", error);
            throw error;
        }
    }

    async deleteEmployee(id) {
        try {
            await this.employeesCol.doc(id).delete();
            
            // Also delete related attendance records
            const attendanceQuery = this.attendanceCol.where("employeeId", "==", id);
            const snapshot = await attendanceQuery.get();
            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error deleting employee:", error);
            throw error;
        }
    }

    async getEmployeeById(id) {
        try {
            const doc = await this.employeesCol.doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting employee by ID:", error);
            throw error;
        }
    }

    // Attendance functions
    async getAttendance() {
        try {
            const snapshot = await this.attendanceCol.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting attendance:", error);
            throw error;
        }
    }

    async addAttendanceRecord(record) {
        try {
            // Check for existing record for the same employee and date
            const existingQuery = this.attendanceCol
                .where("employeeId", "==", record.employeeId)
                .where("date", "==", record.date);
            const existingRecords = await existingQuery.get();

            if (!existingRecords.empty) {
                // Update existing record
                const existingDoc = existingRecords.docs[0];
                await existingDoc.ref.update({ 
                    ...record, 
                    timestamp: new Date().toISOString() 
                });
                return { id: existingDoc.id, ...record };
            } else {
                // Add new record
                const docRef = await this.attendanceCol.add({ 
                    ...record, 
                    timestamp: new Date().toISOString() 
                });
                return { id: docRef.id, ...record };
            }
        } catch (error) {
            console.error("Error adding attendance record:", error);
            throw error;
        }
    }

    async getAttendanceByDate(date) {
        try {
            const query = this.attendanceCol.where("date", "==", date);
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting attendance by date:", error);
            throw error;
        }
    }

    async getAttendanceByEmployee(employeeId) {
        try {
            const query = this.attendanceCol.where("employeeId", "==", employeeId);
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting attendance by employee:", error);
            throw error;
        }
    }

    async getAttendanceByDateRange(startDate, endDate) {
        try {
            const query = this.attendanceCol
                .where("date", ">=", startDate)
                .where("date", "<=", endDate);
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting attendance by date range:", error);
            throw error;
        }
    }

    // Clear all data (from Firestore)
    async clearAllData() {
        try {
            // Delete all employees
            const employeesSnapshot = await this.employeesCol.get();
            const deleteEmployeesPromises = employeesSnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deleteEmployeesPromises);

            // Delete all attendance records
            const attendanceSnapshot = await this.attendanceCol.get();
            const deleteAttendancePromises = attendanceSnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deleteAttendancePromises);

            localStorage.removeItem("attendance_settings");
        } catch (error) {
            console.error("Error clearing all data:", error);
            throw error;
        }
    }

    // Load sample data (to Firestore)
    async loadSampleData() {
        try {
            await this.clearAllData(); // Clear existing data first

            const sampleEmployees = [
                {
                    name: "Ana Quispe",
                    department: "Danza Folklórica",
                    position: "Bailarina Principal",
                },
                {
                    name: "Carlos Mamani",
                    department: "Música Tradicional",
                    position: "Músico - Zampoña",
                },
                {
                    name: "María Condori",
                    department: "Danza Folklórica",
                    position: "Coreógrafa",
                },
                {
                    name: "José Huanca",
                    department: "Música Tradicional",
                    position: "Músico - Bombo",
                },
                {
                    name: "Rosa Choque",
                    department: "Vestuario",
                    position: "Coordinadora de Trajes",
                }
            ];

            const addedEmployees = [];
            for (const emp of sampleEmployees) {
                const newEmp = await this.addEmployee(emp);
                addedEmployees.push(newEmp);
            }

            const today = new Date().toISOString().split("T")[0];
            const sampleAttendance = [
                {
                    employeeId: addedEmployees[0].id,
                    date: today,
                    status: "present",
                    time: "14:00",
                    notes: "Ensayo de Wifalas",
                },
                {
                    employeeId: addedEmployees[1].id,
                    date: today,
                    status: "present",
                    time: "14:05",
                    notes: "Ensayo de Wifalas",
                },
                {
                    employeeId: addedEmployees[2].id,
                    date: today,
                    status: "late",
                    time: "14:20",
                    notes: "Llegó tarde al ensayo",
                }
            ];

            for (const att of sampleAttendance) {
                await this.addAttendanceRecord(att);
            }

            console.log("Sample data loaded successfully");
        } catch (error) {
            console.error("Error loading sample data:", error);
            throw error;
        }
    }
}

// Create global Firebase service instance
window.firebaseService = new FirebaseService();

