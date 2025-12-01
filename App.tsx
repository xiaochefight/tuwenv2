import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Wand2, Eraser, AlignLeft } from 'lucide-react';
import { generateCardContent } from './services/geminiService';
import { CardContent, GenerationState } from './types';
import CardGrid from './components/CardGrid';
import { EXAMPLE_TEXT } from './constants';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [cardContent, setCardContent] = useState<CardContent | null>(null);
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    hasResult: false,
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setState({ isLoading: true, error: null, hasResult: false });
    
    try {
      const result = await generateCardContent(inputText);
      setCardContent(result);
      setState({ isLoading: false, error: null, hasResult: true });
    } catch (e: any) {
      const errorMessage = e?.message || "生成失败，请重试。";
      setState({ 
        isLoading: false, 
        error: errorMessage, 
        hasResult: false 
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setCardContent(null);
    setState({ isLoading: false, error: null, hasResult: false });
  };

  const fillExample = () => {
    setInputText(EXAMPLE_TEXT);
  };

  // Scroll to results when generated
  useEffect(() => {
    if (state.hasResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.hasResult]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-200 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            <Sparkles size={14} />
            <span>AI 驱动</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            魔术 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">卡片生成器</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            将任何文本、文章或笔记转化为精美的信息卡片。由 Gemini AI 自动总结，提供 8 种独特的视觉风格。
          </p>
        </div>
      </header>

      {/* Input Section */}
      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2">
          <div className="relative">
             <textarea
                className="w-full h-48 p-6 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-lg transition-all"
                placeholder="在此粘贴您的文本（文章、邮件、笔记）..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
             />
             <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={fillExample}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                >
                  <AlignLeft size={12} /> 试用示例
                </button>
                {inputText && (
                  <button 
                    onClick={handleClear}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Eraser size={12} /> 清空
                  </button>
                )}
             </div>
          </div>
          
          <div className="p-2 mt-2">
             <button
                onClick={handleGenerate}
                disabled={state.isLoading || !inputText.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                  state.isLoading || !inputText.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99]'
                }`}
             >
               {state.isLoading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>正在施展魔法...</span>
                 </>
               ) : (
                 <>
                   <Wand2 size={20} />
                   <span>生成卡片</span>
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-center text-sm flex flex-col items-center gap-2">
            <span>{state.error}</span>
          </div>
        )}
      </main>

      {/* Results Section */}
      <section ref={resultsRef} className="mt-24 min-h-[500px]">
        {state.hasResult && cardContent && (
           <CardGrid content={cardContent} onContentChange={setCardContent} />
        )}
        
        {!state.hasResult && !state.isLoading && (
          <div className="text-center py-20 opacity-30 select-none">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto grayscale mb-4">
               <div className="h-32 bg-slate-200 rounded-lg"></div>
               <div className="h-32 bg-slate-200 rounded-lg"></div>
               <div className="h-32 bg-slate-200 rounded-lg"></div>
            </div>
            <p className="text-slate-400 font-medium">生成的卡片将显示在这里</p>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 py-12 mt-12 bg-white">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>由 Gemini 2.5 Flash 驱动 • 使用 React & Tailwind 构建</p>
        </div>
      </footer>
    </div>
  );
};

export default App;