import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "../mongodb/connect.js";
import postRoutes from "../routes/postRoutes.js";
import imgGenerateRoutes from "../routes/imgGenerateRoutes.js";
import authRoutes from "../routes/authRoutes.js";
dotenv.config();

const app = express();
app.use(cors({ origin: 'https://ai-artwork-generator.vercel.app/', credentials: true }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/post", postRoutes);
app.use("/api/v1/imgGenerate", imgGenerateRoutes);
app.use('/api/v1/auth', authRoutes);

app.get("/", async (req, res) => {
    res.send("Hello there");
});

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL)
        app.listen(8000, () =>
            console.log("Server has started on port http://localhost:8000")
        );
    } catch (error) {
        console.log(error)
    }
};

startServer();
