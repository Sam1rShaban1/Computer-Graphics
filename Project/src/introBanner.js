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
      background: linear-gradient(135deg, #1a304c 0%, #2c5282 50%, #1a304c 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', sans-serif;
      z-index: 1000;
      cursor: default;
    `;

    this.content = document.createElement('div');
    this.content.style.cssText = `
      text-align: center;
      animation: fadeIn 2s ease-out;
    `;

    this.content.innerHTML = `
      <h1 style="font-size: 4rem; margin: 0; font-weight: 300; letter-spacing: 0.1em; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        SEEU
      </h1>
      <p style="font-size: 2rem; margin: 1rem 0 0; opacity: 0.9; font-weight: 200;">
        South East European University
      </p>
      <p style="font-size: 1.5rem; margin: 2rem 0 0; opacity: 0.8; font-weight: 300;">
        Campus Evolution 2001-2026
      </p>
      <div style="margin-top: 3rem; padding: 1rem 2rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; font-size: 1.2rem;">
        Loading...
      </div>
    `;

    this.element.appendChild(this.content);
    document.body.appendChild(this.element);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }

  show(onComplete) {
    // Fade in animation is handled by CSS
    setTimeout(() => {
      this.hide(onComplete);
    }, 3000); // Show for 3 seconds
  }

  hide(onComplete) {
    this.element.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    this.element.style.animation = 'fadeOut 1s ease-out forwards';
    
    setTimeout(() => {
      document.body.removeChild(this.element);
      if (onComplete) onComplete();
    }, 1000);
  }
}