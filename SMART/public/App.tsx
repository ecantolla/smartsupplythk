import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

// Asume que la API Key está en el entorno. No la pidas al usuario.
const API_KEY = process.env.API_KEY;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Por favor, introduce una idea para la historia.');
      return;
    }
    if (!API_KEY) {
      setError('La API Key no está configurada. Asegúrate de que la variable de entorno API_KEY esté disponible.');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: `Escribe una historia corta y creativa sobre: ${prompt}`,
      });
      setStory(response.text);
    } catch (e) {
      console.error(e);
      setError('Hubo un error al generar la historia. Por favor, revisa la consola.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">Generador de Historias</h1>
          <p className="text-slate-400 mt-2">Usa el poder de la IA para crear historias únicas.</p>
        </header>

        <main>
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Un astronauta que le tiene miedo a la oscuridad..."
              className="w-full p-3 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200"
              rows={3}
              aria-label="Idea para la historia"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </>
              ) : (
                'Generar Historia'
              )}
            </button>
          </div>

          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

          {story && (
            <div className="mt-8 bg-slate-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Tu Historia:</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{story}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;