import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  analyzeSchoolPerformance: async (data: any) => {
    try {
      const prompt = `
        En tant qu'analyste expert en gestion scolaire, analyse les indicateurs de performance suivants pour une école :
        
        - Nombre d'étudiants : ${data.kpis.students}
        - Moyenne générale : ${data.kpis.avgGrade.toFixed(2)}/20
        - Taux d'assiduité : ${data.kpis.attendanceRate}%
        - Taux de recouvrement financier : ${data.kpis.recoveryRate.toFixed(1)}%
        - Nombre de personnel : ${data.kpis.staffCount}
        
        Donne-moi :
        1. Un résumé exécutif (2 phrases).
        2. Les 3 principaux points forts.
        3. Les 3 principaux risques ou zones d'amélioration.
        4. Une recommandation stratégique prioritaire.
        
        Réponds en français avec un ton professionnel et encourageant. Utilise des emojis pour illustrer chaque point.
        Formatte le texte de manière structurée (Markdown).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      return response.text || "Désolé, je n'ai pas pu générer d'analyse pour le moment.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Une erreur est survenue lors de l'analyse intelligente. Veuillez vérifier votre clé API Gemini dans les paramètres.";
    }
  }
};
