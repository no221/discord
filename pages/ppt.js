// pages/index.js // Generated website from Canva design DAG2gUyXy2A // Drop this file into a Next.js project (pages/index.js) or adapt for app/ route. // Requirements: framer-motion (npm i framer-motion). Tailwind is optional — simple CSS included.

import { useState, useEffect, useRef } from 'react'; import { motion, AnimatePresence } from 'framer-motion';

// --- Slide assets exported from your Canva design (thumbnails). --- // If you want higher-res images, export them from Canva as PNG/JPEG and replace these URLs with your hosted files. const slides = [ "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/58/thumbnail/0001.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251112T044814Z&X-Amz-Expires=24819&X-Amz-Signature=2489f2e695ed901f892de7802b8ef49527dd06d16943733bed435c8861bbbd9f&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A41%3A53%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0002.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251112T054024Z&X-Amz-Expires=21301&X-Amz-Signature=d00ec20ffb3b89b4b60caadbb6491a3ce47a930117b8934d807af928eb1c716e&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A35%3A25%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0003.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T192356Z&X-Amz-Expires=60044&X-Amz-Signature=2521a3490ef67c636754e8ce22b94b92431d2ad5efb2852acd7007da4b8bce98&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2012%3A04%3A40%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0004.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T143243Z&X-Amz-Expires=77294&X-Amz-Signature=dcab3248f0c5c2e1e46339c7c0497d0730f60a00f87a56e19bcfab05b1a9abc1&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2012%3A00%3A57%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0005.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251112T015932Z&X-Amz-Expires=35140&X-Amz-Signature=691e43795894335e82a4e32c9257bc5d0dbacfb3651a167c5f846723c74663c1&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A45%3A12%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0006.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T184405Z&X-Amz-Expires=60616&X-Amz-Signature=2f74b380f3759cce972971817cd18addf92d50e5a261815a69cb3d68318c1738&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A34%3A21%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0007.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T122111Z&X-Amz-Expires=84736&X-Amz-Signature=775bfb75e6ee7e4c804b45b794c60acdabbe995a8ebdd2a66e153ec0e368553c&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A53%3A27%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0008.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251111%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251111T222312Z&X-Amz-Expires=49454&X-Amz-Signature=891e150b3624c5f40c377f08fd55697aabfa02ff72b532767ac4db74e121d656&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2012%3A07%3A26%20GMT", "https://document-export.canva.com/yXy2A/DAG2gUyXy2A/57/thumbnail/0009.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWEOTUD6Q%2F20251112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251112T031249Z&X-Amz-Expires=31479&X-Amz-Signature=703f716eeb45fa08273fb6eb905584c524516964b01e1a52c74f3415a56bfb17&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2012%20Nov%202025%2011%3A57%3A28%20GMT" ];

export default function Home() { const [[page, direction], setPage] = useState([0, 0]); const index = page; const autoplayRef = useRef(null); const autoplayDelay = 4000; // ms

useEffect(() => { // autoplay autoplayRef.current = setInterval(() => { changeSlide(1); }, autoplayDelay); return () => clearInterval(autoplayRef.current); }, [page]);

useEffect(() => { function onKey(e) { if (e.key === 'ArrowRight') changeSlide(1); if (e.key === 'ArrowLeft') changeSlide(-1); } window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [page]);

function changeSlide(dir) { clearInterval(autoplayRef.current); setPage(([p]) => { const next = (p + dir + slides.length) % slides.length; return [next, dir]; }); }

// framer-motion variants for enter / center / exit (uses direction to decide motion) const variants = { enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.98, }), center: { zIndex: 1, x: 0, opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' }, }, exit: (dir) => ({ zIndex: 0, x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.98, transition: { duration: 0.5, ease: 'easeIn' }, }) };

// preload neighbor images for smoother transitions useEffect(() => { const next = (index + 1) % slides.length; const prev = (index - 1 + slides.length) % slides.length; [slides[next], slides[prev]].forEach(src => { const img = new Image(); img.src = src; }); }, [index]);

return ( <div style={styles.page}> <div style={styles.container}> <AnimatePresence custom={direction} initial={false} mode="wait"> <motion.img key={index} src={slides[index]} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset, velocity }) => { const swipe = offset.x + velocity.x * 100; if (swipe > 150) changeSlide(-1); else if (swipe < -150) changeSlide(1); }} style={styles.image} alt={Slide ${index + 1}} /> </AnimatePresence>

{/* Controls */}
    <button aria-label="Previous" onClick={() => changeSlide(-1)} style={styles.leftBtn}>‹</button>
    <button aria-label="Next" onClick={() => changeSlide(1)} style={styles.rightBtn}>›</button>

    {/* Indicators */}
    <div style={styles.indicators}>
      {slides.map((s, i) => (
        <button
          key={i}
          onClick={() => setPage([i, i > index ? 1 : -1])}
          aria-label={`Go to slide ${i + 1}`}
          style={i === index ? styles.dotActive : styles.dot}
        />
      ))}
    </div>
  </div>

  {/* Simple instructions footer */}
  <div style={styles.footer}>
    <small>Use arrows, swipe, or the buttons to navigate. Replace `slides` with higher-res exports from Canva if desired.</small>
  </div>
</div>

); }

// --- Inline styles (keeps this file self-contained) --- const styles = { page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1020', padding: '40px 20px' }, container: { width: '100%', maxWidth: 1000, height: 600, position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 50px rgba(2,6,23,0.7)', background: '#000' }, image: { position: 'absolute', inset: 0, margin: 'auto', width: '100%', height: '100%', objectFit: 'cover' }, leftBtn: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: 26, cursor: 'pointer' }, rightBtn: { position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: 26, cursor: 'pointer' }, indicators: { position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 6 }, dot: { width: 10, height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer' }, dotActive: { width: 12, height: 12, borderRadius: 12, background: '#fff', border: 'none', cursor: 'pointer' }, footer: { marginTop: 18, color: '#b6c1d9' } };

/* Next steps / notes for you:

1. This file is saved to the canvas as "nextjs-pages-slides.js". Open it and copy into your project's pages/index.js.


2. Install framer-motion: npm i framer-motion (used for entrance/exit animations). If you prefer CSS animations, I can convert it.


3. To use higher-resolution images, open your Canva design, export each page as PNG/JPEG, host them (or put them in /public) and replace the slides array entries.


4. If you want the slide content (text, links, buttons) as editable HTML rather than flattened images, I can extract text elements from the design and create semantic markup per slide — tell me and I'll fetch the design content. */


