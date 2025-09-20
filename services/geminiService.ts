
import { GoogleGenAI, Type } from "@google/genai";
import type { StrategyOutput, CopyOutput, VisualsOutput, VideoOutput } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const strategySchema = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING, description: "The name of the new brand." },
    tagline: { type: Type.STRING, description: "A catchy tagline for the brand." },
    marketResearch: { type: Type.STRING, description: "A summary of the target market and competitors." },
    brandIdentity: { type: Type.STRING, description: "The brand's personality, values, and voice." },
    creativeBrief: { type: Type.STRING, description: "A detailed brief for the creative team." },
  },
  required: ["brandName", "tagline", "marketResearch", "brandIdentity", "creativeBrief"],
};

const copySchema = {
    type: Type.OBJECT,
    properties: {
        adCopy: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ["title", "body"]
            }
        },
        socialMediaCaptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        blogPost: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
            },
            required: ["title", "content"]
        }
    },
    required: ["adCopy", "socialMediaCaptions", "blogPost"]
};

const colorPaletteSchema = {
    type: Type.OBJECT,
    properties: {
        palette: {
            type: Type.ARRAY,
            description: "An array of 5 hex color codes.",
            items: { type: Type.STRING }
        }
    },
    required: ["palette"]
}


export const generateStrategy = async (prompt: string): Promise<StrategyOutput> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a complete marketing strategy for the following concept: "${prompt}". Provide a brand name, tagline, market research, brand identity, and a creative brief.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: strategySchema,
    },
  });
  return JSON.parse(response.text);
};


export const generateCopy = async (brief: string): Promise<CopyOutput> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this creative brief, generate compelling marketing copy. Include two distinct ad copy variations (title and body), three social media captions, and a short blog post (title and content).\n\nBrief: ${brief}`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: copySchema,
        }
    });
    return JSON.parse(response.text);
};


export const generateVisuals = async (brandName: string, brief: string, adCopy: string): Promise<VisualsOutput> => {
    // 1. Generate Color Palette
    const colorResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a 5-color branding palette based on this creative brief: ${brief}. The brand is called "${brandName}". Provide hex codes.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: colorPaletteSchema,
        }
    });
    const { palette: colorPalette } = JSON.parse(colorResponse.text);

    // 2. Generate Logo and Marketing Images in parallel
    const imagePrompts = [
      `A modern, minimalist logo for a brand called "${brandName}". The logo should be clean, memorable, and reflect these values: ${brief}. White background.`,
      `A vibrant, high-quality marketing photograph inspired by this ad copy: "${adCopy}". The image should be visually appealing and suitable for social media.`,
      `An alternative marketing photograph for "${brandName}" that captures the essence of this brief: "${brief}". Focus on a different angle or concept.`
    ];

    const imagePromises = imagePrompts.map(prompt => 
        ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
        })
    );
    
    const imageResults = await Promise.all(imagePromises);
    const base64Images = imageResults.map(res => res.generatedImages[0].image.imageBytes);

    return {
        colorPalette,
        logo: base64Images[0],
        marketingImages: [base64Images[1], base64Images[2]]
    };
};

export const generateVideo = async (
    prompt: string, 
    image: string,
    onProgressUpdate: (message: string) => void
): Promise<VideoOutput> => {
    onProgressUpdate('Initiating video generation...');
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: `Create a short, 10-second animated video ad based on this prompt: "${prompt}". The style should be modern and energetic.`,
        image: {
            imageBytes: image,
            mimeType: 'image/jpeg',
        },
        config: { numberOfVideos: 1 }
    });

    onProgressUpdate('Video request sent. Awaiting processing...');
    let pollCount = 0;
    while (!operation.done) {
        pollCount++;
        onProgressUpdate(`Processing... (check ${pollCount})`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgressUpdate('Video processed. Fetching data...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation finished but no download link was provided.');
    }
    
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video. Status: ${response.statusText}`);
    }
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    onProgressUpdate('Video ready!');
    return { videoUrl };
};
