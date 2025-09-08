const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "gopiraj@2001", // your password
    database: "salon"
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL");
});

// Generate slots from 9:00 AM to 9:00 PM (30 min interval)
function generateSlots() {
    let slots = [];
    let start = new Date();
    start.setHours(9, 0, 0, 0);
    let end = new Date();
    end.setHours(21, 0, 0, 0);

    while (start < end) {
        let h = String(start.getHours()).padStart(2, "0");
        let m = String(start.getMinutes()).padStart(2, "0");
        slots.push(`${h}:${m}:00`);
        start.setMinutes(start.getMinutes() + 30);
    }
    return slots;
}

// Book appointment
app.post("/book", (req, res) => {
    const { name, contact, email, category, date, time, message } = req.body;

    const sql = `
    INSERT INTO appointments 
    (customer_name, customer_contact, customer_email, category, appointment_date, appointment_time, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(sql, [name, contact, email, category, date, time, message], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "❌ Slot already booked! Please choose another." });
            }
            return res.status(500).json({ message: "❌ Server error", error: err });
        }
        res.json({ message: "✅ Appointment booked successfully!" });
    });
});


// Get available slots for a given date
app.get("/available-slots/:date", (req, res) => {
    const { date } = req.params;
    const allSlots = generateSlots();

    const sql = `SELECT appointment_time FROM appointments WHERE appointment_date = ?`;

    db.query(sql, [date], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });

        // Convert DB times (HH:MM:SS) -> HH:MM
        const bookedSlots = results.map(r => r.appointment_time.toString().substring(0, 5));

        const availableSlots = allSlots.map(s => s.substring(0, 5)) // format HH:MM
            .filter(slot => !bookedSlots.includes(slot));

        res.json({ availableSlots });
    });
});


app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));

// =======================
// ADMIN LOGIN
// =======================
const ADMIN_USER = "admin";   // Hardcoded for now
const ADMIN_PASS = "admin123"; // In production, use hashed passwords

app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ message: "✅ Login successful" });
    }
    res.status(401).json({ message: "❌ Invalid username or password" });
});

// =======================
// GET ALL APPOINTMENTS (Admin Only)
// =======================
app.get("/admin/appointments", (req, res) => {
    const sql = "SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        res.json(results);
    });
});



// =======================
// DELETE APPOINTMENT (Admin Only)
// =======================
app.delete("/admin/appointments/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM appointments WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "❌ Server error", error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "❌ Appointment not found" });
        }

        res.json({ message: "✅ Appointment deleted successfully!" });
    });
});

// =======================
// DELETE ALL APPOINTMENTS (Admin Only)
// =======================
app.delete("/admin/appointments", (req, res) => {
    const sql = "DELETE FROM appointments";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "❌ Server error", error: err });

        res.json({ message: `✅ All ${result.affectedRows} appointments deleted successfully!` });
    });
});
