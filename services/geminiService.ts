import { GoogleGenAI } from "@google/genai";
import { DailyLog, Task, StudySession } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getDailyInsight = async (
  log: DailyLog,
  tasks: Task[],
  studySessions: StudySession[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key not configured. Unable to generate insights.";

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const skippedTasks = tasks.filter(t => t.status === 'Skipped').length;
  const studyMinutes = Math.floor(studySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

  const prompt = `
    Analyze this user's day for "GrowthQuest", a personal growth app.
    
    Data:
    - Date: ${log.date}
    - Mood: ${log.mood || 'Not recorded'}
    - Tasks Completed: ${completedTasks}
    - Tasks Skipped: ${skippedTasks}
    - Total Study Time: ${studyMinutes} minutes
    - Diary Entry: "${log.diaryEntry}"
    - Reflection (What went wrong): "${log.reflection?.wentWrong || 'N/A'}"
    - Reflection (Distractions): "${log.reflection?.distractions || 'N/A'}"
    - Reflection (Improvements): "${log.reflection?.improvements || 'N/A'}"

    Provide a concise, motivating, and actionable "Growth Tip" (max 100 words) to help them improve tomorrow. 
    Focus on their stated weaknesses and mood. Address them directly as "Growth Seeker".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Keep pushing forward! Consistency is key.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insight at this moment. Stay focused!";
  }
};
