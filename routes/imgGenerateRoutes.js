import express from "express";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Hello from the image generation route");
});

router.route("/").post(async (req, res) => {
    try {
        const { prompt } = req.body;
        const stabilityaiApiKey = process.env.STABILITY_AI_TOKEN;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${stabilityaiApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    inputs: prompt,
                    options: { wait_for_model: true } // ➔ Important
                }),
            }
        );

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            console.log("✅ Got JSON data from API:");
            console.log(data);

            res.status(200).json({ data });
        } else if (contentType && contentType.includes("image")) {
            const result = await response.blob();
            const image = Buffer.from(await result.arrayBuffer()).toString("base64");

            res.status(200).json({ photo: image });
        } else {
            throw new Error("Unexpected response from Hugging Face API");
        }
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send(error.message || "Something went wrong while generating image");
    }
});
export default router