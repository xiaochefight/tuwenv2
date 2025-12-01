
import React, { useRef, useEffect } from 'react';
import { CardContent, CardStyle, ContentSection, UserInfo } from '../types';
import { Quote, Check, Clock, Hash, Share2, MoreHorizontal, Bookmark, List, Feather, Layers, Star, ArrowRight, Grip, Zap, Coffee, Newspaper } from 'lucide-react';

interface CardRendererProps {
  content: CardContent;
  style: CardStyle;
  renderMode?: 'total' | 'cover' | 'slide';
  sectionIndex?: number;
  footerNote?: string;
  fixedAspectRatioClass?: string;
  userInfo?: UserInfo;
  isEditable?: boolean;
  onContentChange?: (newContent: CardContent) => void;
  onActiveElementChange?: (element: HTMLElement | null) => void;
}

// Inline Editable Component
// Robust implementation using contentEditable
const InlineEditable = ({ 
  value, 
  onUpdate, 
  isEditable, 
  className, 
  as: Component = 'span',
  children,
  onActiveElementChange,
  // Pass other props like 'onCompositionStart' if needed, though robust state sync handles most.
}: { 
  value?: string, 
  onUpdate: (val: string) => void, 
  isEditable?: boolean, 
  className?: string, 
  as?: any,
  children?: React.ReactNode,
  onActiveElementChange?: (element: HTMLElement | null) => void
}) => {
  const contentRef = useRef<HTMLElement>(null);
  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);

  // Sync prop changes to DOM only when NOT focused to avoid cursor jumps
  useEffect(() => {
    if (contentRef.current && value !== undefined && !isFocusedRef.current) {
      if (contentRef.current.innerHTML !== value) {
        contentRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    if (!isComposingRef.current) {
      const newVal = e.currentTarget.innerHTML;
      onUpdate(newVal);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLElement>) => {
    isComposingRef.current = false;
    const newVal = e.currentTarget.innerHTML;
    onUpdate(newVal);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    isFocusedRef.current = true;
    if (onActiveElementChange) onActiveElementChange(e.currentTarget);
    
    // Minimal visual cue, relies mainly on the floating toolbar for feedback
    e.currentTarget.style.outline = '2px dashed rgba(99, 102, 241, 0.3)';
    e.currentTarget.style.minWidth = '1px'; // Ensure empty fields are clickable
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    isFocusedRef.current = false;
    e.currentTarget.style.outline = '';
    
    // Ensure final state is saved
    if (value !== undefined && e.currentTarget.innerHTML !== value) {
      onUpdate(e.currentTarget.innerHTML);
    }
  };

  if (!isEditable) {
    if (value !== undefined) {
      return <Component className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      ref={contentRef}
      className={`${className} cursor-text transition-colors hover:bg-black/5 rounded px-[1px]`}
      contentEditable={isEditable}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onFocus={handleFocus}
      onBlur={handleBlur}
      dangerouslySetInnerHTML={value !== undefined ? { __html: value } : undefined}
      title="点击编辑"
      data-editable="true"
    >
      {value === undefined ? children : undefined}
    </Component>
  );
};

const CardRenderer: React.FC<CardRendererProps> = ({ 
  content, 
  style, 
  renderMode = 'total',
  sectionIndex = 0,
  footerNote,
  fixedAspectRatioClass,
  userInfo,
  isEditable,
  onContentChange,
  onActiveElementChange
}) => {
  
  const isHighRes = !!fixedAspectRatioClass;

  const baseCardClass = fixedAspectRatioClass 
    ? `w-full h-full overflow-hidden relative flex flex-col ${fixedAspectRatioClass}`
    : "min-h-[600px] h-auto w-full overflow-hidden relative flex flex-col transition-all duration-300";

  const showCoverElements = renderMode === 'total' || renderMode === 'cover';
  const showAllSections = renderMode === 'total';
  const showSingleSection = renderMode === 'slide';
  
  const currentSection = showSingleSection && content.sections[sectionIndex] 
    ? content.sections[sectionIndex] 
    : null;

  const s = (normal: string, large: string) => isHighRes ? large : normal;

  const renderPagination = (textColor: string = "text-gray-500") => {
    if (!footerNote) return null;
    return (
      <div className={`absolute bottom-4 right-6 ${s('text-[10px]', 'text-xl')} font-mono opacity-60 ${textColor} z-50 bg-black/5 px-3 py-1 rounded-full backdrop-blur-sm`}>
        {footerNote}
      </div>
    );
  };

  const updateContent = (field: keyof CardContent, value: any) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value });
    }
  };

  const updateKeyPoint = (index: number, value: string) => {
    if (onContentChange) {
      const newPoints = [...content.keyPoints];
      newPoints[index] = value;
      onContentChange({ ...content, keyPoints: newPoints });
    }
  };

  const updateSection = (index: number, field: keyof ContentSection, value: string) => {
    if (onContentChange) {
      const newSections = [...content.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      onContentChange({ ...content, sections: newSections });
    }
  };

  const commonProps = { isEditable, onActiveElementChange };

  // --- User Info Rendering ---
  const renderUserInfo = () => {
    if (!userInfo || !userInfo.enabled) return null;
    const { avatar, nickname, position, customPos, scale, opacity } = userInfo;
    
    const isDarkStyle = [CardStyle.CYBERPUNK, CardStyle.ELEGANT_LUXURY, CardStyle.GLASSMORPHISM, CardStyle.MODERN_GRADIENT].includes(style);
    const textColorClass = isDarkStyle ? 'text-white' : 'text-gray-800';
    const textShadowClass = isDarkStyle ? 'drop-shadow-md' : 'drop-shadow-sm';

    let posClass = '';
    let styleObj: React.CSSProperties = { opacity: opacity, transform: `scale(${scale})` };

    if (position === 'custom') {
      styleObj.left = `${customPos.x}%`;
      styleObj.top = `${customPos.y}%`;
      styleObj.transformOrigin = 'center center';
    } else {
      switch (position) {
        case 'top-left': posClass = `top-6 left-6 flex-row`; styleObj.transformOrigin = 'left center'; break;
        case 'top-right': posClass = `top-6 right-6 flex-row-reverse text-right`; styleObj.transformOrigin = 'right center'; break;
        case 'bottom-left': posClass = `bottom-6 left-6 flex-row`; styleObj.transformOrigin = 'left center'; break;
        case 'bottom-right': posClass = `bottom-6 right-6 flex-row-reverse text-right`; styleObj.transformOrigin = 'right center'; break;
        default: posClass = `bottom-6 left-6 flex-row`; styleObj.transformOrigin = 'left center';
      }
    }
    const avatarSize = isHighRes ? 'w-[50px] h-[50px]' : 'w-10 h-10';
    const fontSize = isHighRes ? 'text-xl' : 'text-sm';
    const gap = isHighRes ? 'gap-3' : 'gap-2';

    return (
      <div className={`absolute ${position === 'custom' ? '' : posClass} flex items-center ${gap} z-50 pointer-events-none transition-all duration-300`} style={styleObj}>
        {avatar && <div className={`${avatarSize} rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-200`}><img src={avatar} alt="User" className="w-full h-full object-cover" /></div>}
        {nickname && <span className={`${fontSize} font-bold ${textColorClass} ${textShadowClass} max-w-[150px] truncate`}>{nickname}</span>}
      </div>
    );
  };
  
  const Wrapper = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={className}>
      {children}
      {renderUserInfo()}
    </div>
  );

  const renderKeyPointsList = (className: string, itemClass: string, icon?: React.ReactNode) => (
    <div className={className}>
       {content.keyPoints.map((point, i) => (
         <div key={i} className={itemClass}>
            {icon}
            <InlineEditable value={point} onUpdate={(val) => updateKeyPoint(i, val)} {...commonProps} />
         </div>
       ))}
    </div>
  );

  const renderSectionContent = (section: ContentSection, idx: number, titleClass: string, textClass: string, containerClass: string = "mb-6") => (
    <div key={idx} className={containerClass}>
       <InlineEditable as="h4" className={titleClass} value={section.title} onUpdate={(val) => updateSection(idx, 'title', val)} {...commonProps} />
       <InlineEditable as="p" className={textClass} value={section.content} onUpdate={(val) => updateSection(idx, 'content', val)} {...commonProps} />
    </div>
  );

  // --- Style Implementations ---
  // Styles have been normalized to remove conflicting inner formatting where possible

  if (style === CardStyle.MINIMALIST) {
    return (
      <Wrapper className={`${baseCardClass} bg-white border border-gray-200 ${s('p-6', 'p-12')}`}>
        <div className={`absolute ${s('-top-20 -right-20 w-64 h-64', '-top-40 -right-40 w-[600px] h-[600px]')} bg-gray-50 rounded-full z-0`}></div>
        <div className="relative z-10 flex flex-col flex-grow">
          <div className={`flex items-center justify-between ${s('mb-6', 'mb-12')}`}>
            <InlineEditable as="span" className={`${s('text-[10px]', 'text-2xl')} font-bold tracking-[0.2em] uppercase text-gray-400 border-b border-gray-200 pb-2`} value={showSingleSection ? content.title : content.category} onUpdate={(val) => updateContent(showSingleSection ? 'title' : 'category', val)} {...commonProps} />
            <div className={`flex items-center gap-2 text-gray-400`}>
              <Clock size={isHighRes ? 24 : 12} />
              <InlineEditable as="span" className={s('text-[10px]', 'text-xl')} value={content.readingTime} onUpdate={(val) => updateContent('readingTime', val)} {...commonProps} />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {showCoverElements && (
              <>
                <InlineEditable as="h3" className={`${s('text-3xl', 'text-6xl')} font-serif font-medium text-gray-900 leading-tight`} value={content.title} onUpdate={(val) => updateContent('title', val)} {...commonProps} />
                <div className="flex-1 flex flex-col justify-center">
                    <InlineEditable as="p" className={`text-gray-600 leading-relaxed font-sans text-justify border-l-4 border-gray-900 pl-6 py-2 my-6 ${s('text-xl', 'text-2xl')}`} value={content.summary} onUpdate={(val) => updateContent('summary', val)} {...commonProps} />
                </div>
                {content.keyPoints.length > 0 && (
                  <div className={`bg-gray-50 ${s('p-5', 'p-10')} rounded-3xl mt-auto`}>
                    <h4 className={`${s('text-[10px]', 'text-2xl')} font-bold uppercase text-gray-400 mb-6 flex items-center gap-2`}><List size={isHighRes ? 24 : 10} /> 核心亮点</h4>
                    {renderKeyPointsList("space-y-6", `flex items-start gap-4 ${s('text-sm', 'text-3xl')} text-gray-700 font-medium leading-relaxed`, <span className={`mt-3 ${s('w-1 h-1', 'w-3 h-3')} bg-gray-900 rounded-full flex-shrink-0`} />)}
                  </div>
                )}
              </>
            )}
            {showSingleSection && currentSection && (
                <div className={`flex flex-col justify-center h-full relative ${s('pb-10', 'pb-48')}`}>
                  <span className="absolute top-0 -left-6 text-[250px] font-black text-gray-100 -z-10 leading-none select-none opacity-60">{(sectionIndex + 1).toString().padStart(2, '0')}</span>
                  <div className={`${s('mb-8 mt-6', 'mb-12 mt-4')}`}>
                    <InlineEditable as="h2" className={`${s('text-3xl', 'text-5xl')} font-serif font-medium text-gray-900 mb-8 leading-tight`} value={currentSection.title} onUpdate={(val) => updateSection(sectionIndex, 'title', val)} {...commonProps} />
                    <div className="w-24 h-2 bg-gray-900 mb-8"></div>
                  </div>
                  <InlineEditable as="div" className={`${s('text-lg', 'text-3xl')} text-gray-700 leading-[1.8] text-justify font-sans tracking-wide`} value={currentSection.content} onUpdate={(val) => updateSection(sectionIndex, 'content', val)} {...commonProps} />
                </div>
            )}
            {showAllSections && content.sections.map((section, i) => renderSectionContent(section, i, "text-lg font-bold text-gray-800 mb-2 mt-4", "text-sm text-gray-600 leading-relaxed text-justify"))}
          </div>
          <div className={`mt-8 pt-6 border-t border-gray-100 flex justify-between items-center relative ${s('text-xs', 'text-xl')}`}>
            <InlineEditable as="div" className="font-bold text-gray-900" value={content.authorOrSource} onUpdate={(val) => updateContent('authorOrSource', val)} {...commonProps} />
            <div className={`${s('text-2xl', 'text-5xl')} grayscale opacity-80`}>{content.emoji}</div>
            {renderPagination()}
          </div>
        </div>
      </Wrapper>
    );
  }

  if (style === CardStyle.MODERN_GRADIENT) {
    return (
      <Wrapper className={`${baseCardClass} bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-2 text-white`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 z-0 pointer-events-none"></div>
        <div className={`flex-grow bg-black/20 backdrop-blur-md ${s('p-6', 'p-12')} flex flex-col justify-between border border-white/10 relative z-10 rounded-xl overflow-hidden`}>
          <div className="flex-1 flex flex-col">
            <div className={`flex justify-between items-start ${s('mb-6', 'mb-12')}`}>
              <InlineEditable as="span" className={`px-4 py-1.5 bg-white/20 rounded-lg ${s('text-[10px]', 'text-xl')} font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm`} value={showSingleSection ? content.title : content.category} onUpdate={(val) => updateContent(showSingleSection ? 'title' : 'category', val)} {...commonProps} />
              <span className={`${s('text-4xl', 'text-7xl')} drop-shadow-lg filter grayscale-[0.2]`}>{content.emoji}</span>
            </div>
            {showCoverElements && (
              <>
                  <div className="flex-1 flex flex-col justify-center">
                    <InlineEditable as="h3" className={`${s('text-2xl', 'text-6xl')} font-bold mb-10 leading-tight drop-shadow-md`} value={content.title} onUpdate={(val) => updateContent('title', val)} {...commonProps} />
                    <div className={`bg-white/10 rounded-3xl ${s('p-5', 'p-10')} backdrop-blur-sm mb-8 border border-white/5 shadow-inner`}>
                      <InlineEditable as="p" className={`text-white/95 ${s('text-sm', 'text-2xl')} font-medium leading-relaxed text-justify tracking-wide`} value={content.summary} onUpdate={(val) => updateContent('summary', val)} {...commonProps} />
                    </div>
                  </div>
                  {content.keyPoints.length > 0 && (
                    <div className="space-y-6 mt-auto mb-6">
                      {renderKeyPointsList("", `flex gap-4 items-start group ${s('text-xs', 'text-2xl')} text-white/95 leading-relaxed font-medium`, <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0"><Check size={isHighRes ? 20 : 10} strokeWidth={3} /></div>)}
                    </div>
                  )}
              </>
            )}
            {showSingleSection && currentSection && (
              <div className="flex flex-col h-full relative">
                  <div className="absolute top-[-20px] right-[-20px] opacity-10 font-black text-[200px] leading-none tracking-tighter select-none pointer-events-none">{(sectionIndex + 1).toString().padStart(2, '0')}</div>
                  <div className={`flex-1 flex flex-col justify-center relative z-10 ${s('pb-10', 'pb-48')}`}>
                      <div className={`bg-gradient-to-b from-white/15 to-white/5 ${s('p-8', 'p-14')} rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl`}>
                        <div className="flex items-center gap-4 mb-8">
                            <span className={`flex items-center justify-center ${s('w-8 h-8', 'w-16 h-16')} rounded-full bg-white/20 text-white font-bold ${s('text-sm', 'text-2xl')}`}>{sectionIndex + 1}</span>
                            <InlineEditable as="h2" className={`${s('text-2xl', 'text-4xl')} font-bold text-white leading-tight`} value={currentSection.title} onUpdate={(val) => updateSection(sectionIndex, 'title', val)} {...commonProps} />
                        </div>
                        <InlineEditable as="p" className={`${s('text-lg', 'text-3xl')} text-white/95 leading-[1.8] font-medium text-justify tracking-wide drop-shadow-sm`} value={currentSection.content} onUpdate={(val) => updateSection(sectionIndex, 'content', val)} {...commonProps} />
                      </div>
                  </div>
              </div>
            )}
            {showAllSections && content.sections.map((section, i) => renderSectionContent(section, i, "text-lg font-bold text-white mb-2", "text-sm text-white/80 leading-relaxed font-light", "bg-black/10 p-4 rounded-lg"))}
          </div>
          <div className={`mt-12 pt-6 border-t border-white/10 flex justify-between items-center ${s('text-[10px]', 'text-xl')} font-medium opacity-80 relative z-20`}>
              <InlineEditable value={content.authorOrSource} onUpdate={(val) => updateContent('authorOrSource', val)} {...commonProps} />
              <InlineEditable value={content.readingTime} onUpdate={(val) => updateContent('readingTime', val)} {...commonProps} />
              {renderPagination("text-white/90 font-bold bg-white/20")}
          </div>
        </div>
      </Wrapper>
    );
  }

  // Fallback for other styles (Generic mapping for consistent editing)
  const isLuxury = style === CardStyle.ELEGANT_LUXURY;
  const isOrganic = style === CardStyle.NATURE_ORGANIC;
  const isGlass = style === CardStyle.GLASSMORPHISM;
  const isNews = style === CardStyle.NEWSPAPER;
  const isNeo = style === CardStyle.NEO_BRUTALISM;
  const isCyber = style === CardStyle.CYBERPUNK;

  let bgClass = "bg-white";
  let textClass = "text-gray-900";
  if (isLuxury) { bgClass = "bg-[#0a0a0a]"; textClass = "text-[#f0f0f0]"; }
  if (isOrganic) { bgClass = "bg-[#f5f5f0]"; textClass = "text-[#2d342d]"; }
  if (isGlass) { bgClass = "bg-gradient-to-br from-blue-400 to-indigo-600"; textClass = "text-white"; }
  if (isNews) { bgClass = "bg-[#F0EAD6]"; textClass = "text-gray-900"; }
  if (isNeo) { bgClass = "bg-[#FFDEE9]"; textClass = "text-black"; }
  if (isCyber) { bgClass = "bg-zinc-950"; textClass = "text-cyan-400"; }

  const borderColor = isNeo ? "border-4 border-black" : (isCyber ? "border border-cyan-900/50" : "");

  return (
    <Wrapper className={`${baseCardClass} ${bgClass} ${textClass} ${borderColor} ${s('p-6', 'p-12')}`}>
       {isLuxury && <div className="absolute inset-0 border border-[#C5A059] m-2 pointer-events-none"></div>}
       {isNews && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] pointer-events-none"></div>}
       {isNeo && <div className="absolute top-0 right-0 p-4"><div className="w-8 h-8 rounded-full bg-black"></div></div>}
       
       <div className={`relative z-10 flex flex-col flex-grow ${isGlass ? "bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20" : ""}`}>
          <div className="flex justify-between items-center mb-8">
             <InlineEditable as="span" className={`${isLuxury ? 'text-[#C5A059]' : 'opacity-60'} uppercase tracking-widest ${s('text-xs', 'text-xl')} font-bold ${isNeo ? 'bg-white border-2 border-black px-2 shadow-sm' : ''}`} value={content.category} onUpdate={(val) => updateContent('category', val)} {...commonProps} />
             {isNews && <span className="font-serif italic border-b border-black">The Daily News</span>}
             {isCyber && <span className="font-mono text-pink-500 flex items-center gap-1"><Zap size={14}/> SYSTEM.READY</span>}
          </div>

          {showCoverElements && (
             <>
               <div className="flex-1 flex flex-col justify-center">
                  <InlineEditable as="h1" className={`${isLuxury ? 'font-serif text-[#C5A059]' : isNews ? 'font-serif' : 'font-bold'} ${s('text-3xl', 'text-6xl')} mb-6 leading-tight ${isNeo ? 'bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_#000]' : ''}`} value={content.title} onUpdate={(val) => updateContent('title', val)} {...commonProps} />
                  <InlineEditable as="p" className={`${s('text-lg', 'text-2xl')} opacity-80 leading-relaxed ${isNeo ? 'font-bold' : ''}`} value={content.summary} onUpdate={(val) => updateContent('summary', val)} {...commonProps} />
               </div>
               {content.keyPoints.length > 0 && (
                 <div className="mt-8">
                    {renderKeyPointsList("space-y-3", `flex items-center gap-3 ${s('text-sm', 'text-2xl')} opacity-90 ${isNeo ? 'font-bold' : ''}`, isLuxury ? <Star size={12} color="#C5A059" /> : <div className="w-2 h-2 rounded-full bg-current"></div>)}
                 </div>
               )}
             </>
          )}

          {showSingleSection && currentSection && (
              <div className={`flex flex-col justify-center h-full ${s('pb-10', 'pb-48')}`}>
                 <InlineEditable as="h2" className={`${s('text-2xl', 'text-5xl')} font-bold mb-6 ${isLuxury ? 'text-[#C5A059]' : ''} ${isNeo ? 'bg-white border-4 border-black p-2 shadow-[4px_4px_0_0_#000]' : ''}`} value={currentSection.title} onUpdate={(val) => updateSection(sectionIndex, 'title', val)} {...commonProps} />
                 <InlineEditable as="p" className={`${s('text-lg', 'text-3xl')} leading-relaxed opacity-90 text-justify ${isNeo ? 'font-bold' : ''}`} value={currentSection.content} onUpdate={(val) => updateSection(sectionIndex, 'content', val)} {...commonProps} />
              </div>
          )}

          {showAllSections && content.sections.map((section, i) => renderSectionContent(section, i, `font-bold text-lg ${isLuxury ? 'text-[#C5A059]' : ''}`, "text-sm opacity-80"))}

          <div className="mt-auto pt-6 opacity-60 flex justify-between items-center">
             <InlineEditable value={content.authorOrSource} onUpdate={(val) => updateContent('authorOrSource', val)} {...commonProps} />
             {renderPagination(isLuxury ? "text-[#C5A059]" : "")}
          </div>
       </div>
    </Wrapper>
  );
};

export default CardRenderer;
