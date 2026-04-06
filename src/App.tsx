/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Search, 
  Heart, 
  Compass, 
  Moon, 
  Sun,
  Loader2,
  ChevronRight,
  Info,
  Download,
  FileText
} from 'lucide-react';
import { calculateMatch, BirthDetails, AstroResult } from './services/astrology';
import Markdown from 'react-markdown';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image-more';

export default function App() {
  const [details, setDetails] = useState<BirthDetails>({
    dob: '',
    tob: '',
    pob: ''
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<AstroResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.dob || !details.tob || !details.pob) {
      setError("Please fill in all birth details.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await calculateMatch(details);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while calculating your celestial match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    
    setDownloading(true);
    setError(null);
    try {
      const element = resultsRef.current;
      
      // Temporarily hide elements with 'no-print' class
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

      // Use dom-to-image-more for better CSS compatibility (oklab, etc.)
      const dataUrl = await domtoimage.toJpeg(element, {
        quality: 0.85,
        bgcolor: '#0a0502',
        style: {
          // Ensure the captured area looks correct
          'border-radius': '0',
          'margin': '0',
          'padding': '20px'
        }
      });
      
      // Restore visibility
      noPrintElements.forEach(el => (el as HTMLElement).style.visibility = '');

      // Create PDF
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => (img.onload = resolve));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
      
      // Blob-based download for reliability
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AstroSpouse_Report_${details.dob || 'Celestial'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      setError("Failed to generate PDF. This can happen with modern CSS features. Try taking a screenshot or opening in a new tab.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#e0d8d0] font-serif selection:bg-[#ff4e00]/30">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#3a1510] rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4e00] rounded-full blur-[150px] opacity-10" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#ff4e00]/30 bg-[#ff4e00]/5 mb-6">
              <Sparkles className="text-[#ff4e00] w-8 h-8" />
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-4 bg-gradient-to-b from-white to-[#e0d8d0]/60 bg-clip-text text-transparent">
              AstroSpouse
            </h1>
            <p className="text-lg text-[#e0d8d0]/60 max-w-xl mx-auto italic">
              Unveiling the celestial blueprint of your ideal partner through the wisdom of Vedic and Western traditions.
            </p>
          </motion.div>
        </header>

        {/* Input Form */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151619]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="flex items-center text-xs uppercase tracking-widest text-[#ff4e00] font-sans font-semibold">
                  <CalendarIcon className="w-4 h-4 mr-2" /> Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={details.dob}
                  onChange={(e) => setDetails({ ...details, dob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e00]/50 transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-xs uppercase tracking-widest text-[#ff4e00] font-sans font-semibold">
                  <Clock className="w-4 h-4 mr-2" /> Time of Birth
                </label>
                <input
                  type="time"
                  required
                  value={details.tob}
                  onChange={(e) => setDetails({ ...details, tob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e00]/50 transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-xs uppercase tracking-widest text-[#ff4e00] font-sans font-semibold">
                  <MapPin className="w-4 h-4 mr-2" /> Place of Birth
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  required
                  value={details.pob}
                  onChange={(e) => setDetails({ ...details, pob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e00]/50 transition-colors text-white placeholder:text-white/20"
                />
              </div>
              <div className="md:col-span-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff4e00] hover:bg-[#ff6a26] disabled:bg-[#ff4e00]/50 text-white font-sans font-bold py-4 rounded-2xl transition-all flex items-center justify-center group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Consulting the Stars...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      Calculate Celestial Match
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <p className="mt-4 text-red-400 text-sm text-center font-sans">{error}</p>
            )}
          </motion.div>
        </section>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-16"
            >
              {/* Download Action */}
              <div className="flex justify-end mb-4 no-print">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-sans font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </>
                  )}
                </button>
              </div>

              {/* Person's Chart Summary */}
              <section>
                <div className="flex items-center mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <h2 className="mx-6 text-2xl font-light italic">Your Cosmic Signature</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
                  <div className="prose prose-invert max-w-none">
                    <Markdown>{result.personChart}</Markdown>
                  </div>
                </div>
              </section>

              {/* Astrology Systems Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Indian Astrology */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#151619] border border-white/10 rounded-[32px] p-8 flex flex-col"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-4">
                      <Compass className="text-orange-500 w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-medium">Indian (Vedic) Best</h3>
                  </div>
                  <div className="text-[#e0d8d0]/70 text-sm leading-relaxed flex-1 prose prose-invert prose-sm">
                    <Markdown>{result.indianSpouseProfile}</Markdown>
                  </div>
                </motion.div>

                {/* Western Astrology */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#151619] border border-white/10 rounded-[32px] p-8 flex flex-col"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                      <Moon className="text-blue-500 w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-medium">Western Best</h3>
                  </div>
                  <div className="text-[#e0d8d0]/70 text-sm leading-relaxed flex-1 prose prose-invert prose-sm">
                    <Markdown>{result.westernSpouseProfile}</Markdown>
                  </div>
                </motion.div>
              </div>

              {/* Combined Best */}
              <section>
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0502] border border-[#ff4e00]/20 rounded-[40px] p-10 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00]/10 blur-[100px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <Heart className="text-[#ff4e00] w-8 h-8 mr-4 fill-[#ff4e00]/20" />
                      <h2 className="text-3xl font-light">The Combined Ideal</h2>
                    </div>
                    <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                      <Markdown>{result.combinedBestProfile}</Markdown>
                    </div>
                  </div>
                </div>
              </section>

              {/* Potential Birth Dates */}
              <section className="pb-24">
                <div className="flex items-center mb-12">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <h2 className="mx-6 text-2xl font-light italic">Celestial Windows</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.potentialBirthDates.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-default group"
                    >
                      <div className="text-[#ff4e00] font-sans font-bold text-lg mb-3 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="text-sm text-[#e0d8d0]/60 leading-relaxed group-hover:text-[#e0d8d0]/90 transition-colors">
                        {item.reason}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-12 text-center">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs text-[#e0d8d0]/40 uppercase tracking-widest">
                    <Info className="w-4 h-4 mr-2" />
                    Calculated within a +/- 20 year range
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-[#e0d8d0]/20 text-xs uppercase tracking-[0.2em]">
        <p>&copy; 2026 AstroSpouse &bull; Celestial Wisdom for Modern Hearts</p>
      </footer>
    </div>
  );
}
