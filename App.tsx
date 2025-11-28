
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Search, X, ChevronRight, Clock, Thermometer, ArrowLeft, Plus, Play, Pause, Check, RotateCcw } from 'lucide-react';
import { Product, ViewState, BrewingGuide } from './types';
import { COFFEE_MENU, BREWING_GUIDES } from './services/mockData';
import { Button } from './components/Button';

// --- VISUALIZATION COMPONENTS ---

const RadarChart = ({ body, acidity, sweetness }: { body: number, acidity: number, sweetness: number }) => {
  const CENTER = 50;
  const MAX_RADIUS = 35; // Radius for the chart (leaving space for labels)

  // Calculate coordinates for a point given a value (1-5) and angle in degrees
  const getPoint = (value: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const radius = (value / 5) * MAX_RADIUS;
    return {
      x: CENTER + radius * Math.cos(angleRad),
      y: CENTER + radius * Math.sin(angleRad)
    };
  };

  const acidityPt = getPoint(acidity, 0);
  const sweetnessPt = getPoint(sweetness, 120);
  const bodyPt = getPoint(body, 240);

  // Path string for the data polygon
  const dataPath = `M${acidityPt.x},${acidityPt.y} L${sweetnessPt.x},${sweetnessPt.y} L${bodyPt.x},${bodyPt.y} Z`;

  // Grid levels (1 to 5)
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="relative w-full aspect-square max-w-[160px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Concentric Grid Triangles */}
        {levels.map((level) => {
          const p1 = getPoint(level, 0);
          const p2 = getPoint(level, 120);
          const p3 = getPoint(level, 240);
          const points = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p1.x},${p1.y}`;
          return (
            <motion.polyline 
              key={level} 
              points={points} 
              fill="none" 
              stroke="#E5E5E5" 
              strokeWidth="0.5" 
              strokeDasharray={level === 5 ? "0" : "1 1"} 
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: level * 0.1, ease: "easeOut" }}
            />
          );
        })}

        {/* Axis Lines from Center */}
        {[0, 120, 240].map((angle, i) => {
           const p = getPoint(5, angle);
           return (
            <motion.line 
                key={angle} 
                x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} 
                stroke="#E5E5E5" 
                strokeWidth="0.5" 
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            />
           );
        })}

        {/* Data Shape (Blue Polygon) */}
        <motion.path 
          d={dataPath}
          fill="rgba(0, 71, 255, 0.05)" 
          stroke="#0047FF" 
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "circOut", delay: 0.8 }}
        />
        
        {/* Data Points (Dots at vertices) */}
        {[
            { pt: acidityPt, val: acidity },
            { pt: sweetnessPt, val: sweetness },
            { pt: bodyPt, val: body }
        ].map((item, i) => (
             <motion.circle 
                key={i}
                cx={item.pt.x} 
                cy={item.pt.y} 
                r="2" 
                fill="#0047FF"
                stroke="white"
                strokeWidth="1"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.15, type: "spring", stiffness: 200 }}
            />
        ))}

        {/* Static Labels (Text) */}
        <g className="font-mono">
            {/* Top: Acidity */}
            <text x="50" y="8" textAnchor="middle" className="text-[5px] fill-lab-black font-bold uppercase tracking-wider">Acidity</text>
            <text x="50" y="13" textAnchor="middle" className="text-[4px] fill-lab-blue font-bold">{acidity.toFixed(1)}</text>
            
            {/* Right: Sweetness */}
            <text x="90" y="75" textAnchor="middle" className="text-[5px] fill-lab-black font-bold uppercase tracking-wider">Sweet</text>
            <text x="90" y="80" textAnchor="middle" className="text-[4px] fill-lab-blue font-bold">{sweetness.toFixed(1)}</text>
            
            {/* Left: Body */}
            <text x="10" y="75" textAnchor="middle" className="text-[5px] fill-lab-black font-bold uppercase tracking-wider">Body</text>
            <text x="10" y="80" textAnchor="middle" className="text-[4px] fill-lab-blue font-bold">{body.toFixed(1)}</text>
        </g>

      </svg>
    </div>
  );
};

// --- UTILITY COMPONENTS ---

const NoiseOverlay = () => (
    <div className="bg-noise fixed inset-0 z-50 pointer-events-none mix-blend-multiply" />
);

const Toast = ({ message, visible, onClose }: { message: string, visible: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-lab-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-white/20"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- BREWING TIMER MODAL ---

const BrewingTimerModal: React.FC<{ guide: BrewingGuide, onClose: () => void }> = ({ guide, onClose }) => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(guide.steps[0].duration);
    const [isRunning, setIsRunning] = useState(false);
    
    const activeStep = guide.steps[activeStepIndex];
    const isFinished = activeStepIndex >= guide.steps.length;

    useEffect(() => {
        let interval: any;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isFinished) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, isFinished]);

    const handleNext = () => {
        if (activeStepIndex < guide.steps.length - 1) {
            setActiveStepIndex(prev => prev + 1);
            setTimeLeft(guide.steps[activeStepIndex + 1].duration);
            setIsRunning(true);
        } else {
            onClose();
        }
    };

    const progress = activeStep.duration > 0 ? ((activeStep.duration - timeLeft) / activeStep.duration) * 100 : 0;
    const circumference = 2 * Math.PI * 120; // Radius 120

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] bg-lab-white flex flex-col"
        >
             <NoiseOverlay />
             
             {/* Header */}
             <div className="p-6 flex justify-between items-center relative z-10">
                 <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-lab-blue uppercase tracking-widest">Interactive_Tool</span>
                    <h2 className="font-serif text-2xl">{guide.title}</h2>
                 </div>
                 <button onClick={onClose} className="p-2 bg-white border border-lab-line rounded-full hover:bg-lab-line transition-colors">
                     <X size={20} />
                 </button>
             </div>

             {/* Main Timer Display */}
             <div className="flex-1 flex flex-col items-center justify-center relative px-6">
                <div className="relative mb-12">
                     {/* Progress Ring */}
                     <svg className="transform -rotate-90 w-72 h-72">
                         <circle cx="144" cy="144" r="120" stroke="#E5E5E5" strokeWidth="2" fill="none" />
                         <motion.circle 
                            cx="144" cy="144" r="120" 
                            stroke="#0047FF" strokeWidth="4" fill="none"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                            transition={{ duration: 1, ease: "linear" }}
                         />
                     </svg>
                     
                     {/* Center Time */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="font-mono text-6xl font-light tabular-nums tracking-tighter">
                             {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                         </span>
                         <span className="font-mono text-xs text-lab-gray uppercase mt-2 tracking-widest">{activeStep.label} PHASE</span>
                     </div>
                </div>

                {/* Instruction Text */}
                <div className="text-center max-w-xs h-24">
                     <AnimatePresence mode="wait">
                         <motion.p 
                            key={activeStepIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="font-serif text-xl leading-relaxed"
                         >
                             {activeStep.description}
                         </motion.p>
                     </AnimatePresence>
                </div>
             </div>

             {/* Controls */}
             <div className="p-8 pb-12 relative z-10">
                 <div className="flex gap-4">
                     {timeLeft > 0 ? (
                         <button 
                            onClick={() => setIsRunning(!isRunning)}
                            className="flex-1 h-16 bg-lab-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-lab-blue transition-colors font-mono uppercase tracking-widest"
                         >
                            {isRunning ? <Pause size={20} /> : <Play size={20} />}
                            {isRunning ? "Pause" : "Start Timer"}
                         </button>
                     ) : (
                         <button 
                            onClick={handleNext}
                            className="flex-1 h-16 bg-lab-blue text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors font-mono uppercase tracking-widest"
                         >
                            {activeStepIndex < guide.steps.length - 1 ? (
                                <>Next Phase <ChevronRight size={20} /></>
                            ) : (
                                <>Finish <Check size={20} /></>
                            )}
                         </button>
                     )}
                     
                     <button 
                        onClick={() => { setTimeLeft(activeStep.duration); setIsRunning(false); }}
                        className="w-16 h-16 border border-lab-line rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                     >
                         <RotateCcw size={20} />
                     </button>
                 </div>
             </div>
        </motion.div>
    );
};

// --- LAYOUT COMPONENTS ---

const FloatingDock = ({ active, onBack }: { active: boolean, onBack: () => void }) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
      <motion.div 
        layout
        className="bg-lab-black/90 backdrop-blur-md rounded-2xl p-2 flex items-center gap-4 pointer-events-auto shadow-2xl border border-white/10"
      >
        {active ? (
          <button onClick={onBack} className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
            <X size={20} />
          </button>
        ) : (
           <>
            <button className="w-12 h-12 rounded-xl bg-lab-blue text-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-blue-500/30">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            </button>
            <div className="h-5 w-px bg-white/20" />
            <button className="p-3 text-white/70 hover:text-white transition-colors active:scale-95"><Search size={20} /></button>
            <button className="p-3 text-white/70 hover:text-white transition-colors active:scale-95 relative">
                <ShoppingCart size={20} />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-lab-blue rounded-full" />
            </button>
           </>
        )}
      </motion.div>
    </div>
  );
};

const Marquee = () => {
  return (
    <div className="overflow-hidden bg-lab-blue py-3 flex relative z-20 shadow-lg">
      <motion.div 
        className="whitespace-nowrap flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-8">
            <span>PEAK FRESHNESS GUARANTEED</span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            <span>Sensory Analysis In Progress</span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            <span>Batch No. 204</span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// --- SECTIONS ---

// Updated with reliable, high-quality Unsplash images
const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80", // 01. Pour Over (Cafe Vibe)
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80", // 02. Coffee Beans (Texture)
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80"  // 03. Latte Art (Aesthetic)
];

const HERO_METRICS = [
  { line1: "EXTRACTION: 93.5°C", line2: "FLOW: 12g/sec" },
  { line1: "ROAST: AGTRON 55", line2: "DROP TEMP: 204°C" },
  { line1: "PRESSURE: 9 BAR", line2: "TIME: 28 SEC" }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  
  // Parallax effects
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={ref} className="h-[65vh] relative w-full overflow-hidden border-b border-lab-black bg-lab-black">
      {/* Background Slideshow */}
      <motion.div style={{ opacity, y }} className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={currentSlide}
            src={HERO_SLIDES[currentSlide]}
            alt="Hero Background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover contrast-[1.1] brightness-[0.7]"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-lab-blue/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-lab-black/90 via-transparent to-transparent" />
      </motion.div>

      {/* Foreground Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
            <div className="flex gap-2">
                <div className="w-2 h-2 bg-lab-blue rounded-full animate-pulse mt-1.5" />
                <span className="font-mono text-[10px] text-white/80 tracking-widest uppercase">Live_Feed<br/>Oakland_Lab</span>
            </div>
            <span className="font-mono text-[10px] text-white/80 tracking-widest border border-white/20 px-2 py-1 rounded-md backdrop-blur-sm">VOL. 24</span>
        </div>

        <div>
            <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-6xl font-serif text-white leading-[0.85] mb-4 drop-shadow-2xl"
            >
                Blue Bottle<br/>
                <span className="italic font-light opacity-90">Laboratories</span>
            </motion.h1>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-end justify-between border-t border-white/30 pt-4"
            >
                <div className="font-mono text-[10px] text-white/90 space-y-1 min-w-[120px] h-8">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p>{HERO_METRICS[currentSlide].line1}</p>
                            <p>{HERO_METRICS[currentSlide].line2}</p>
                        </motion.div>
                     </AnimatePresence>
                </div>
                {/* Slide Indicators */}
                <div className="flex gap-1.5 mb-1">
                  {HERO_SLIDES.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-0.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-4 bg-white' : 'w-2 bg-white/30'}`} 
                    />
                  ))}
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

const HomeView: React.FC<{ onSelect: (p: Product) => void, onOpenGuide: (g: BrewingGuide) => void }> = ({ onSelect, onOpenGuide }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="min-h-full pb-32 relative"
    >
      <HeroSection />
      <Marquee />

      {/* Brewing Guides (Horizontal Scroll) */}
      <div className="py-12 pl-6 border-b border-lab-line border-dashed">
        <div className="flex justify-between items-end pr-6 mb-6">
            <h3 className="font-serif text-2xl text-lab-black">Calibration <span className="italic text-lab-gray">Guides</span></h3>
            <span className="font-mono text-[10px] text-lab-blue uppercase hover:underline cursor-pointer">View All</span>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar pr-6">
            {BREWING_GUIDES.map((guide, idx) => (
                <motion.div 
                    key={guide.id}
                    onClick={() => onOpenGuide(guide)}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="min-w-[200px] group cursor-pointer relative aspect-[3/4] overflow-hidden border border-lab-line rounded-xl shadow-md"
                >
                    <motion.img 
                      src={guide.image} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      alt={guide.title}
                      initial={{ filter: "grayscale(100%)" }}
                      whileInView={{ filter: "grayscale(0%)" }}
                      transition={{ duration: 1.2, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="font-mono text-[9px] text-lab-blue uppercase bg-white/10 backdrop-blur-sm px-1.5 py-0.5 mb-2 inline-block rounded">Method 0{guide.id}</span>
                        <h4 className="font-serif text-xl text-white mb-2">{guide.title}</h4>
                        <div className="flex gap-3 font-mono text-[9px] text-white/70">
                            <span className="flex items-center gap-1"><Clock size={10} /> {guide.time}</span>
                            <span className="flex items-center gap-1"><Thermometer size={10} /> {guide.temp}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
            <div className="min-w-[50px] flex items-center justify-center border border-dashed border-lab-line text-lab-gray rounded-xl">
                <span className="rotate-90 font-mono text-[10px] uppercase tracking-widest">More</span>
            </div>
        </div>
      </div>

      {/* Main Coffee List */}
      <div className="px-4 py-12 space-y-4">
        <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-1.5 h-1.5 bg-lab-blue rounded-full animate-pulse" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-lab-black">Current_Roster</h3>
            <div className="h-px bg-lab-line flex-1" />
        </div>

        {COFFEE_MENU.map((product, i) => (
          <motion.div 
            key={product.id} 
            onClick={() => onSelect(product)} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group cursor-pointer"
          >
            <div className="relative bg-white border border-lab-line rounded-2xl p-4 flex gap-4 h-44 overflow-hidden shadow-sm transition-shadow">
                
                {/* Tech Info Left - UPDATED PRICE DISPLAY */}
                <div className="w-12 flex-shrink-0 flex flex-col items-start gap-1 border-r border-lab-line pr-2 z-20">
                    <span className="font-mono text-[10px] text-lab-gray">0{i+1}</span>
                    <span className="font-mono text-[10px] font-bold text-lab-black tracking-tighter">₩{product.price/1000}k</span>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center relative z-20 pr-24">
                    <div className="flex items-start justify-between mb-2">
                         <h3 className="text-2xl font-serif text-lab-black z-20 leading-none mb-2">{product.name}</h3>
                    </div>
                    <p className="font-mono text-[10px] text-lab-gray uppercase tracking-wider z-20 mb-3">{product.subTitle}</p>
                    
                    <div className="flex flex-wrap gap-2 z-20">
                        {product.notes.slice(0, 2).map((n, idx) => (
                            <span key={idx} className="text-[9px] font-mono border border-lab-line rounded px-1.5 py-0.5 text-lab-black bg-lab-white/50">{n}</span>
                        ))}
                    </div>
                </div>

                {/* Image Reveal - Scroll Triggered B/W to Color */}
                <div className="absolute right-0 top-0 bottom-0 w-32 mask-image-linear-gradient">
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white z-10 w-12" />
                     <motion.img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        initial={{ filter: "grayscale(100%)" }}
                        whileInView={{ filter: "grayscale(0%)" }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    />
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subscription Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-4 mb-12 bg-lab-blue text-white p-6 relative overflow-hidden group cursor-pointer rounded-2xl shadow-xl shadow-blue-900/20"
      >
          <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase tracking-widest mb-2 block border-b border-white/20 pb-2">Subscription</span>
              <h3 className="font-serif text-2xl mb-2">Never Run Out</h3>
              <p className="font-mono text-[10px] opacity-80 mb-4 max-w-[200px]">
                  Freshly roasted beans delivered to your door. customized to your brewing method.
              </p>
              <div className="flex items-center gap-2 font-mono text-xs underline">
                  CONFIGURE_PLAN <ChevronRight size={14} />
              </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-full bg-white/10 -skew-x-12 translate-x-16" />
      </motion.div>
    </motion.div>
  );
};

const DetailView: React.FC<{ product: Product, onBack: () => void, onAddToCart: () => void }> = ({ product, onBack, onAddToCart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="min-h-full bg-white pb-32"
    >
        {/* Header Image */}
        <div className="h-[40vh] relative overflow-hidden bg-lab-black">
            <motion.img 
                initial={{ scale: 1.2, filter: "grayscale(100%)" }}
                animate={{ scale: 1, filter: "grayscale(0%)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={product.image} 
                className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            
            {/* Back Button */}
            <button onClick={onBack} className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                <ArrowLeft size={20} />
            </button>
        </div>

        <div className="px-6 -mt-12 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-lab-blue uppercase tracking-widest border border-lab-blue/30 px-2 py-1 rounded">Lot. {product.id}0{product.id}</span>
                    <span className="font-mono text-lg font-bold">₩{product.price.toLocaleString()}</span>
                </div>
                <h1 className="font-serif text-4xl text-lab-black mb-2 leading-none">{product.name}</h1>
                <p className="font-mono text-xs text-lab-gray uppercase tracking-widest mb-6">{product.subTitle}</p>
                
                <p className="text-lab-black/80 font-sans leading-relaxed text-sm">
                    {product.description}
                </p>
            </div>

            {/* Analysis Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 bg-lab-blue rounded-full" />
                    <h3 className="font-mono text-xs uppercase tracking-widest text-lab-black">Sensory_Profile</h3>
                    <div className="h-px bg-lab-line flex-1" />
                </div>

                {/* Radar Chart */}
                {product.flavorProfile && (
                    <div className="bg-lab-white border border-lab-line rounded-2xl p-6 flex flex-col items-center">
                        <RadarChart {...product.flavorProfile} />
                        <span className="font-mono text-[9px] text-lab-gray mt-6 uppercase tracking-widest">Lab Analysis Result</span>
                    </div>
                )}

                {/* Flavor Notes */}
                <div className="grid grid-cols-2 gap-3">
                    {product.notes.map((note, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-lab-line rounded-lg p-4 flex items-center justify-center text-center shadow-sm"
                        >
                            <span className="font-serif text-lg italic text-lab-black">{note}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Purchase Action */}
            <div className="mt-12">
                 <Button fullWidth onClick={onAddToCart} className="bg-lab-black text-white hover:bg-lab-blue border-transparent h-14 text-sm gap-2">
                    <span>Add to Batch</span>
                    <Plus size={16} />
                 </Button>
            </div>
        </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeGuide, setActiveGuide] = useState<BrewingGuide | null>(null);
  const [toast, setToast] = useState<{msg: string, show: boolean}>({ msg: "", show: false });

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setView('DETAIL');
  };

  const handleBack = () => {
    setView('HOME');
    setTimeout(() => setSelectedProduct(null), 500);
  };

  const showToast = (msg: string) => {
      setToast({ msg, show: true });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }

  return (
    <div className="font-sans text-lab-black bg-lab-white min-h-screen selection:bg-lab-blue selection:text-white relative">
      <NoiseOverlay />
      
      <AnimatePresence>
        {activeGuide && <BrewingTimerModal key="modal" guide={activeGuide} onClose={() => setActiveGuide(null)} />}
      </AnimatePresence>

      <Toast message={toast.msg} visible={toast.show} onClose={() => setToast(prev => ({...prev, show: false}))} />

      <AnimatePresence mode="wait">
        {view === 'HOME' ? (
          <HomeView key="home" onSelect={handleProductSelect} onOpenGuide={setActiveGuide} />
        ) : (
          selectedProduct && (
            <DetailView 
                key="detail" 
                product={selectedProduct} 
                onBack={handleBack} 
                onAddToCart={() => showToast(`BATCH LOGGED: ${selectedProduct.name.toUpperCase()}`)} 
            />
          )
        )}
      </AnimatePresence>

      <FloatingDock active={view === 'DETAIL'} onBack={handleBack} />
    </div>
  );
}