
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';

export default function PillNav({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = 'hsl(var(--primary))',
  pillColor = 'hsl(var(--background))',
  hoveredPillTextColor = 'hsl(var(--primary-foreground))',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  extraActions = null
}) {
  const resolvedPillTextColor = pillTextColor ?? 'hsl(var(--foreground))';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  const renderLogo = () => {
    if (typeof logo === 'string' && (logo.includes('/') || logo.includes('.'))) {
      return (
        <img 
          src={logo} 
          alt={logoAlt} 
          ref={logoImgRef} 
          className="w-10 h-10 object-contain pointer-events-none" 
        />
      );
    }
    return (
      <div ref={logoImgRef} className="flex items-center justify-center font-serif font-black text-2xl tracking-[-0.05em] uppercase">
        {logo}
      </div>
    );
  };

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;
        
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        // Calculate the radius for the expanding circle to cover the pill
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');
        
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        
        tl.to(circle, { 
          scale: 1.2, 
          xPercent: -50, 
          duration: 0.8, 
          ease, 
          overwrite: 'auto' 
        }, 0);
        
        if (label) {
          tl.to(label, { 
            y: -(h + 8), 
            duration: 0.6, 
            ease, 
            overwrite: 'auto' 
          }, 0);
        }
        
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            ease, 
            overwrite: 'auto' 
          }, 0);
        }
        
        tlRefs.current[index] = tl;
      });
    };

    layout();
    
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    
    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    // Initial load animation
    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItemsEl = navItemsRef.current;
      
      if (logoEl) {
        gsap.set(logoEl, { scale: 0, opacity: 0 });
        gsap.to(logoEl, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        });
      }
      
      if (navItemsEl) {
        const listItems = navItemsEl.querySelectorAll('li');
        gsap.set(listItems, { opacity: 0, x: -20 });
        gsap.to(listItems, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.2
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(img, {
      scale: 1.2,
      duration: 0.6,
      ease: "power2.out",
      overwrite: 'auto',
      onComplete: () => gsap.set(img, { scale: 1 })
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    const menu = mobileMenuRef.current;
    if (menu) {
      if (newState) {
        gsap.set(menu, { display: 'block', opacity: 0, y: -20 });
        gsap.to(menu, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out"
        });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(menu, { display: 'none' });
          }
        });
      }
    }
    if (onMobileMenuClick) onMobileMenuClick();
  };

  const isExternalLink = (href) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor,
    '--nav-h': '56px',
    '--logo-size': '48px',
    '--pill-pad-x': '24px',
    '--pill-gap': '8px'
  };

  return (
    <div className={`relative z-[1000] w-full ${className}`} style={cssVars}>
      <nav
        className="w-full flex items-center justify-between p-4 gap-4"
        aria-label="Primary"
      >
        {/* Logo Section */}
        <div 
          ref={logoRef}
          onMouseEnter={handleLogoEnter}
          className="flex-shrink-0 z-10"
        >
          {items.length > 0 && !isExternalLink(items[0]?.href || '') ? (
            <Link
              href={'/'}
              className="flex items-center justify-center rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-sm"
              style={{
                width: '120px',
                height: 'var(--nav-h)',
                background: 'var(--base)',
                color: 'var(--hover-text)'
              }}
            >
              {renderLogo()}
            </Link>
          ) : (
            <a
              href={'/'}
              className="flex items-center justify-center rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-sm"
              style={{
                width: '120px',
                height: 'var(--nav-h)',
                background: 'var(--base)',
                color: 'var(--hover-text)'
              }}
            >
              {renderLogo()}
            </a>
          )}
        </div>

        {/* Desktop Menu */}
        <div
          ref={navItemsRef}
          className="hidden md:flex items-center rounded-full px-1.5 shadow-sm border border-black/5"
          style={{
            height: 'var(--nav-h)',
            background: 'var(--base)'
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-0 h-full"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;
              
              const pillStyle = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background: 'var(--hover-text)',
                      willChange: 'transform'
                    }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-none z-[2] overflow-hidden py-1">
                    <span
                      className="pill-label relative z-[2] inline-block tracking-[0.2em] text-[10px]"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-1 z-[3] inline-block w-full text-center tracking-[0.2em] text-[10px]"
                      style={{
                        color: 'var(--pill-bg)',
                        willChange: 'transform, opacity'
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1 h-1 rounded-full z-[4]"
                      style={{ background: 'var(--hover-text)' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              const basePillClasses = "relative overflow-hidden inline-flex items-center justify-center h-[calc(var(--nav-h)-12px)] self-center no-underline rounded-full box-border font-bold uppercase cursor-pointer transition-colors duration-200 hover:z-10";

              return (
                <li key={item.href} role="none" className="flex items-center">
                  {!isExternalLink(item.href) ? (
                    <Link
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right side actions and Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {extraActions && (
             <div className="flex items-center rounded-full px-4 h-[var(--nav-h)] bg-[var(--base)] shadow-sm border border-black/5 gap-4 mr-2">
                {extraActions}
             </div>
          )}
          
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex items-center justify-center rounded-full transition-transform active:scale-90"
            style={{
              width: 'var(--nav-h)',
              height: 'var(--nav-h)',
              background: 'var(--base)',
              color: 'var(--pill-bg)'
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl overflow-hidden shadow-2xl z-[999] hidden border border-black/10"
        style={{
          background: 'var(--base)'
        }}
      >
        <ul className="list-none m-0 p-2 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                {!isExternalLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`block py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all ${
                      isActive 
                        ? 'bg-black/10 text-[var(--pill-bg)]' 
                        : 'text-[var(--pill-bg)]/70 hover:bg-black/20 hover:text-[var(--pill-bg)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`block py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all ${
                      isActive 
                        ? 'bg-black/10 text-[var(--pill-bg)]' 
                        : 'text-[var(--pill-bg)]/70 hover:bg-black/20 hover:text-[var(--pill-bg)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
