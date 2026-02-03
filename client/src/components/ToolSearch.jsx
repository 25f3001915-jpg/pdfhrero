import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ToolSearch = () => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Define your tools here (title, keywords, url, short desc)
  const TOOLS = [
    { title: "Merge PDF", url: "/merge-pdf", desc: "Combine PDFs in your preferred order.", tags:["merge","combine","join"] },
    { title: "Split PDF", url: "/split-pdf", desc: "Extract pages or split into multiple PDFs.", tags:["split","extract","pages"] },
    { title: "Compress PDF", url: "/compress-pdf", desc: "Reduce file size with high quality.", tags:["compress","reduce","size","kb","mb"] },
    { title: "PDF to Word", url: "/pdf-to-word", desc: "Convert PDF to DOC/DOCX easily.", tags:["pdf to word","docx","convert"] },
    { title: "Word to PDF", url: "/word-to-pdf", desc: "Convert DOC/DOCX to PDF.", tags:["word to pdf","docx to pdf"] },
    { title: "PDF to JPG", url: "/pdf-to-image", desc: "Convert pages to images or extract images.", tags:["pdf to jpg","image","png"] },
    { title: "JPG to PDF", url: "/image-to-pdf", desc: "Convert images to PDF in seconds.", tags:["jpg to pdf","image to pdf"] },
    { title: "Rotate PDF", url: "/rotate-pdf", desc: "Rotate pages and save instantly.", tags:["rotate","orientation"] },
    { title: "Unlock PDF", url: "/unlock-pdf", desc: "Remove password (if you have permission).", tags:["unlock","remove password"] },
    { title: "Protect PDF", url: "/protect-pdf", desc: "Add password encryption to PDFs.", tags:["protect","encrypt","password"] },
    { title: "Watermark", url: "/watermark-pdf", desc: "Stamp text or image watermark.", tags:["watermark","stamp"] },
    { title: "HTML to PDF", url: "/html-to-pdf", desc: "Convert a webpage URL into PDF.", tags:["html to pdf","url to pdf","webpage"] },
    { title: "OCR PDF", url: "/ocr", desc: "Make scanned PDFs searchable.", tags:["ocr","scanned","text"] },
    { title: "Repair PDF", url: "/repair-pdf", desc: "Fix corrupted PDF files.", tags:["repair","fix","corrupt"] },
    { title: "Organize PDF", url: "/organize", desc: "Reorder, delete, add pages.", tags:["organize","reorder","delete pages"] },
    { title: "Page Numbers", url: "/page-numbers", desc: "Add page numbers to PDFs.", tags:["page numbers","pagination"] },
    { title: "Sign PDF", url: "/sign-pdf", desc: "Add digital signatures to PDFs.", tags:["sign","signature","digital"] },
    { title: "Redact PDF", url: "/redact-pdf", desc: "Remove sensitive information from PDFs.", tags:["redact","privacy","security"] },
    { title: "Compare PDF", url: "/compare-pdf", desc: "Compare differences between PDFs.", tags:["compare","difference","changes"] },
    { title: "Excel to PDF", url: "/excel-to-pdf", desc: "Convert Excel spreadsheets to PDF.", tags:["excel to pdf","xlsx to pdf"] },
    { title: "PowerPoint to PDF", url: "/powerpoint-to-pdf", desc: "Convert PowerPoint presentations to PDF.", tags:["powerpoint to pdf","ppt to pdf"] },
    { title: "Edit PDF", url: "/edit-pdf", desc: "Edit text and images in PDFs.", tags:["edit","modify","update"] },
    { title: "Crop PDF", url: "/crop-pdf", desc: "Crop PDF pages to desired size.", tags:["crop","resize","dimensions"] },
    { title: "Compress Image", url: "/compress-image", desc: "Reduce image file sizes.", tags:["compress","image","optimize"] },
    { title: "Convert Image", url: "/convert-image", desc: "Convert between image formats.", tags:["convert","format","image"] },
    { title: "PDF to PDF/A", url: "/pdf-to-pdfa", desc: "Convert PDF to archival format.", tags:["pdfa","archive","iso"] }
  ];

  const normalize = (s) => (s || "").toLowerCase().trim();

  const scoreTool = (tool, q) => {
    const hay = normalize(tool.title + " " + tool.desc + " " + (tool.tags || []).join(" "));
    if (!q) return 0;
    if (normalize(tool.title).includes(q)) return 100;
    if (hay.includes(q)) return 70;
    // token scoring
    const tokens = q.split(/\s+/).filter(Boolean);
    let hit = 0;
    tokens.forEach(tok => { if (hay.includes(tok)) hit += 10; });
    return hit;
  };

  const filteredTools = TOOLS.filter(tool => scoreTool(tool, normalize(query)) > 0)
    .sort((a, b) => scoreTool(b, normalize(query)) - scoreTool(a, normalize(query)))
    .slice(0, 10);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filteredTools.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredTools[activeIndex]) {
        navigate(filteredTools[activeIndex].url);
        setShowResults(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  return (
    <div className="search-wrap" role="search">
      <div className="search-icon" aria-hidden="true">⌕</div>
      <input
        ref={inputRef}
        id="toolSearch"
        className="search-input"
        type="search"
        placeholder="Search a tool (e.g., merge pdf, compress, pdf to word)…"
        autoComplete="off"
        aria-label="Search PDF tools"
        aria-controls="searchResults"
        aria-expanded={showResults}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(e.target.value.trim() !== '');
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() !== '' && setShowResults(true)}
      />
      <div className="kbd-hint" aria-hidden="true">Ctrl K</div>
      
      {showResults && filteredTools.length > 0 && (
        <div id="searchResults" className={`results ${showResults ? 'show' : ''}`} role="listbox" aria-label="Tool results">
          {filteredTools.map((tool, index) => (
            <div
              key={tool.url}
              className={`result-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                navigate(tool.url);
                setShowResults(false);
                setQuery('');
              }}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              aria-selected={index === activeIndex}
            >
              <div>
                <div className="result-title">{tool.title}</div>
                <div className="result-meta">{tool.desc}</div>
              </div>
              <div className="result-meta">{tool.tags.slice(0, 3).join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolSearch;