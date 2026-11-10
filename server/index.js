
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const Email = require("./models/Email");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// Test API
app.get("/", (req, res) => {
    console.log("BACKEND TEST ROUTE REACHED");
    res.send("BulkMail Backend is Running!");
});

// API to receive and send emails
app.post("/send-email", async (req, res) => {
    let newEmail;

    try {
        console.log("SEND EMAIL ROUTE REACHED");

        const { subject, body, recipients } = req.body;

        // Validate form data
        if (
            !subject ||
            !body ||
            !Array.isArray(recipients) ||
            recipients.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide subject, body and recipients."
            });
        }

        // Save email campaign in MongoDB
        newEmail = new Email({
            subject,
            body,
            recipients,
            status: "Pending"
        });

        await newEmail.save();

        console.log("EMAIL SAVED TO MONGODB");

        // Send actual email using Gmail
        console.log("ATTEMPTING TO SEND EMAIL");

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: recipients,
            subject: subject,
            text: body
        });

        // Update database after successful sending
        newEmail.status = "Sent";
        await newEmail.save();

        console.log("EMAIL SENT SUCCESSFULLY");

        res.status(200).json({
            message: "Emails sent successfully!",
            data: newEmail
        });

    } catch (error) {
        console.log("EMAIL ERROR:", error.message);
        console.log(error);

        if (newEmail) {
            try {
                newEmail.status = "Failed";
                await newEmail.save();
                console.log("EMAIL STATUS UPDATED TO FAILED");
            } catch (dbError) {
                console.log("DATABASE UPDATE ERROR:", dbError.message);
            }
        }

        res.status(500).json({
            message: "Email sending failed. Please check your Gmail configuration."
        });
    }
});

// API to get email history
app.get("/email-history", async (req, res) => {
    try {
        const emails = await Email.find().sort({ createdAt: -1 });

        res.status(200).json(emails);

    } catch (error) {
        console.log("History Error:", error.message);

        res.status(500).json({
            message: "Unable to fetch email history."
        });
    }
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
