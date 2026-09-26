const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.get("/", (req, res) => {
    res.json({
        message: "Movie API is running!"
    });
});

app.get("/test", (req, res) => {
    res.send("TEST WORKS");
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS test"
        );

        res.json({
            success: true,
            message: "MySQL connected!",
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});

app.get("/api/titles", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM titles LIMIT 20"
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get titles"
        });
    }
});

app.get("/api/titles/:id/videos", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM videos WHERE title_id = ?",
            [req.params.id]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get videos"
        });
    }
});

// Video Proxy
app.get("/api/video/:titleId", async (req, res) => {
    try {
        // پیدا کردن ویدیو از دیتابیس
        const [rows] = await db.query(
            "SELECT * FROM videos WHERE title_id = ? LIMIT 1",
            [req.params.titleId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        const videoUrl = rows[0].url;

        // دریافت Range برای پخش ویدیو
        const headers = {};

        if (req.headers.range) {
            headers.Range = req.headers.range;
        }

        const response = await axios({
            method: "GET",
            url: videoUrl,
            responseType: "stream",
            headers: headers,
            validateStatus: () => true
        });

        res.status(response.status);

        if (response.headers["content-type"]) {
            res.setHeader(
                "Content-Type",
                response.headers["content-type"]
            );
        }

        if (response.headers["content-length"]) {
            res.setHeader(
                "Content-Length",
                response.headers["content-length"]
            );
        }

        if (response.headers["content-range"]) {
            res.setHeader(
                "Content-Range",
                response.headers["content-range"]
            );
        }

        if (response.headers["accept-ranges"]) {
            res.setHeader(
                "Accept-Ranges",
                response.headers["accept-ranges"]
            );
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("Video proxy error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

console.log("TEST ROUTE LOADED");

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});