import express from "express";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const router = express.Router();

// Helper function to handle Hugging Face API calls
async function queryHuggingFace(prompt) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_AI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: prompt,
        options: { 
          wait_for_model: true,
          use_cache: false 
        }
      }),
    }
  );
console.log(response);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Hugging Face API error");
  }

  return response;
}

router.route("/")
  .get((req, res) => {
    res.send("Hello from the image generation route");
  })
  .post(async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.STABILITY_AI_TOKEN) {
        return res.status(500).json({ error: "API token not configured" });
      }

      console.log("Sending prompt to Hugging Face:", prompt);
      const response = await queryHuggingFace(prompt);

      // Check content type
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return res.status(200).json({ success: true, data });
      } 
      
      if (contentType && contentType.includes("image")) {
        const imageBuffer = await response.buffer();
        const base64Image = imageBuffer.toString('base64');
        return res.status(200).json({ 
          success: true,
          photo: base64Image 
        });
      }

      throw new Error("Unexpected response type from Hugging Face");

    } catch (error) {
      console.error("Image generation error:", error);
      return res.status(500).json({ 
        success: false,
        error: error.message || "Image generation failed",
        details: error.details || null
      });
    }
  });

export default router;