import * as THREE from 'three';

export class IntroBanner {
  constructor() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      z-index: 1000;
      cursor: default;
      overflow: hidden;
    `;

    // Add decorative circles
    this.element.innerHTML = `
      <div class="banner-circle c1"></div>
      <div class="banner-circle c2"></div>
      <div class="banner-circle c3"></div>
      <div class="banner-content">
        <h1 class="title">
          <span class="title-main">SEEU</span>
        </h1>
        <p class="subtitle">South East European University</p>
        <p class="timeline">Campus Evolution <span class="year-range">2001 — 2026</span></p>
        <div class="enter-btn">
          <span>Enter Campus</span>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .banner-circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.06;
        animation: float 20s ease-in-out infinite;
      }
      .banner-circle.c1 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, #94a3b8 0%, transparent 70%);
        top: -150px;
        left: -100px;
        animation-delay: 0s;
      }
      .banner-circle.c2 {
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, #94a3b8 0%, transparent 70%);
        bottom: -80px;
        right: -50px;
        animation-delay: -5s;
      }
      .banner-circle.c3 {
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, #94a3b8 0%, transparent 70%);
        top: 40%;
        left: 60%;
        transform: translate(-50%, -50%);
        animation-delay: -10s;
      }
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(20px, -20px) scale(1.05); }
        50% { transform: translate(-10px, 20px) scale(0.95); }
        75% { transform: translate(-20px, -10px) scale(1.02); }
      }
      .banner-content {
        position: relative;
        z-index: 1;
        text-align: center;
        animation: slideUp 1s ease-out;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .title {
        margin: 0;
        line-height: 1.1;
      }
      .title-main {
        display: block;
        font-size: 5rem;
        font-weight: 200;
        letter-spacing: 0.25em;
        color: #f8fafc;
      }
      .subtitle {
        font-size: 1rem;
        color: #cbd5e1;
        margin: 1rem 0 0;
        font-weight: 300;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      .timeline {
        font-size: 0.9rem;
        color: #94a3b8;
        margin: 0.75rem 0 0;
        font-weight: 300;
      }
      .year-range {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        color: #cbd5e1;
        font-weight: 400;
        margin-left: 0.5rem;
        font-size: 0.9rem;
      }
      .enter-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 3rem;
        padding: 1rem 2.5rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 4px;
        color: #f8fafc;
        font-size: 0.875rem;
        font-weight: 400;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .enter-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.5);
      }
      .enter-btn svg {
        transition: transform 0.3s ease;
      }
      .enter-btn:hover svg {
        transform: translateX(4px);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.element);

    // Click handler
    this.element.querySelector('.enter-btn').addEventListener('click', () => {
      this.hide(() => {
        if (this.onComplete) this.onComplete();
      });
    });
  }

  show(onComplete) {
    this.onComplete = onComplete;
  }

  hide(onComplete) {
    this.element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    this.element.style.opacity = '0';
    this.element.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      if (this.element.parentNode) {
        document.body.removeChild(this.element);
      }
      if (onComplete) onComplete();
    }, 800);
  }
}
