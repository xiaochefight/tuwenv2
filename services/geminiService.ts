import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CardContent } from "../types";

export const generateCardContent = async (inputText: string): Promise<CardContent> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key，请检查环境变量。");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "极具吸引力的爆款主标题。" },
        summary: { type: Type.STRING, description: "一段精炼的摘要，概括核心价值，约50-80字。" },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-4个简短的核心亮点（每点不超过20字），用于封面展示。",
        },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "分段小标题，吸引人。" },
              content: { type: Type.STRING, description: "该段落的详细内容，必须丰富详实，字数控制在150-200字左右，确保填满一张手机屏幕的阅读区域。" }
            },
            required: ["title", "content"]
          },
          description: "4-5个详细的内容板块，用于后续的长图或翻页卡片展示。"
        },
        category: { type: Type.STRING, description: "1-2个词的分类标签。" },
        emoji: { type: Type.STRING, description: "最能代表核心主题的单个emoji。" },
        sentimentColor: { type: Type.STRING, description: "颜色HEX代码。" },
        readingTime: { type: Type.STRING, description: "预计阅读时间。" },
        authorOrSource: { type: Type.STRING, description: "作者或来源。" },
      },
      required: ["title", "summary", "keyPoints", "sections", "category", "emoji", "sentimentColor", "readingTime", "authorOrSource"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是专业的社交媒体内容专家（小红书/公众号）。
      你的任务是将用户输入的文本转化为一套“图文笔记”内容。
      
      结构要求：
      1. **封面**：需要一个爆款标题，一段简介，和3-4个短亮点。
      2. **详细页（Sections）**：将内容拆解为4-5个逻辑清晰的板块。每个板块必须有非常丰富的内容（150-200字），适合制作成一张信息量充足的图片，严禁内容空洞，如果原文内容不足，请根据主题进行合理的扩充和润色，使其丰满。
      
      请务必使用中文（简体）输出所有内容。
      
      文本输入: "${inputText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 未返回内容");
    }

    return JSON.parse(text) as CardContent;
  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "生成内容时发生未知错误");
  }
};