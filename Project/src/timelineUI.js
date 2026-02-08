import * as THREE from 'three';
import { BUILDING_TIMELINE, TIMELINE_YEARS } from './buildingData.js';

export class TimelineUI {
  constructor(onYearChange, onPlayPause) {
    this.currentYear = 2001;
    this.isPlaying = false;
    this.onYearChange = onYearChange;
    this.onPlayPause = onPlayPause;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(12, 16, 24, 0.9);
      padding: 16px 24px;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 100;
      font-family: 'Segoe UI', sans-serif;
    `;

    // Play/Pause button
    this.playButton = document.createElement('button');
    this.playButton.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `;
    this.playButton.textContent = '▶ Play';
    this.playButton.addEventListener('click', () => this.togglePlayPause());

    // Timeline container
    this.timelineContainer = document.createElement('div');
    this.timelineContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    `;

    // Create timeline line and dots
    this.createTimeline();

    // Current year display
    this.yearDisplay = document.createElement('div');
    this.yearDisplay.style.cssText = `
      color: white;
      font-size: 16px;
      font-weight: 600;
      min-width: 50px;
    `;
    this.yearDisplay.textContent = this.currentYear;

    // Assemble
    this.container.appendChild(this.playButton);
    this.container.appendChild(this.timelineContainer);
    this.container.appendChild(this.yearDisplay);

    document.body.appendChild(this.container);

    // Auto-play timer
    this.autoPlayInterval = null;
    this.ANIMATION_DURATION = 20000; // 20 seconds per year
  }

  createTimeline() {
    // Timeline line
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%);
    `;
    this.timelineContainer.appendChild(line);

    // Year dots
    this.dots = {};
    TIMELINE_YEARS.forEach((year, index) => {
      const dot = document.createElement('button');
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s;
        z-index: 2;
        position: relative;
      `;

      // Position dots along timeline
      const spacing = 40; // pixels between dots
      dot.style.position = 'absolute';
      dot.style.left = `${index * spacing}px`;
      dot.style.transform = 'translateX(-50%) translateY(-50%)';

      // Year label
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
      `;
      label.textContent = year;
      dot.appendChild(label);

      // Hover effects
      dot.addEventListener('mouseenter', () => {
        if (year !== this.currentYear) {
          dot.style.background = 'rgba(255, 255, 255, 0.6)';
          dot.style.transform = 'translateX(-50%) translateY(-50%) scale(1.3)';
        }
      });

      dot.addEventListener('mouseleave', () => {
        if (year !== this.currentYear) {
          dot.style.background = 'rgba(255, 255, 255, 0.3)';
          dot.style.transform = 'translateX(-50%) translateY(-50%)';
        }
      });

      // Click handlers
      dot.addEventListener('click', (e) => {
        if (e.shiftKey || e.ctrlKey) {
          // Shift/Ctrl + Click = animate to year
          this.animateToYear(year);
        } else {
          // Regular click = jump to year
          this.setYear(year, true);
        }
      });

      this.timelineContainer.appendChild(dot);
      this.dots[year] = dot;
    });

    // Set container width based on number of dots
    const totalWidth = (TIMELINE_YEARS.length - 1) * 40;
    this.timelineContainer.style.width = `${totalWidth}px`;
    this.timelineContainer.style.position = 'relative';
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      this.startAutoPlay();
      this.playButton.textContent = '⏸ Pause';
      this.playButton.style.background = '#dc2626';
    } else {
      this.stopAutoPlay();
      this.playButton.textContent = '▶ Play';
      this.playButton.style.background = '#2563eb';
    }

    if (this.onPlayPause) this.onPlayPause(this.isPlaying);
  }

  startAutoPlay() {
    this.stopAutoPlay(); // Clear any existing interval
    
    this.autoPlayInterval = setInterval(() => {
      const currentIndex = TIMELINE_YEARS.indexOf(this.currentYear);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < TIMELINE_YEARS.length) {
        this.setYear(TIMELINE_YEARS[nextIndex], true);
      } else {
        // End of timeline
        this.togglePlayPause();
      }
    }, this.ANIMATION_DURATION);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  setYear(year, triggerAnimation = true) {
    if (year === this.currentYear) return;

    this.currentYear = year;
    this.yearDisplay.textContent = year;
    
    // Update dot styles
    Object.entries(this.dots).forEach(([dotYear, dot]) => {
      if (parseInt(dotYear) <= year) {
        dot.style.background = '#2563eb';
        dot.style.borderColor = '#2563eb';
      } else {
        dot.style.background = 'rgba(255, 255, 255, 0.3)';
        dot.style.borderColor = 'rgba(255, 255, 255, 0.5)';
      }
    });

    if (this.onYearChange) {
      this.onYearChange(year, triggerAnimation);
    }
  }

  async   animateToYear(targetYear) {
    const currentIndex = TIMELINE_YEARS.indexOf(this.currentYear);
    const targetIndex = TIMELINE_YEARS.indexOf(targetYear);
    
    if (targetIndex > currentIndex) {
      // Animate through years
      this.isPlaying = true;
      this.playButton.textContent = '⏸ Pause';
      this.playButton.style.background = '#dc2626';

      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        this.setYear(TIMELINE_YEARS[i], true);
        await new Promise(resolve => setTimeout(resolve, this.ANIMATION_DURATION));
      }
      
      this.isPlaying = false;
      this.playButton.textContent = '▶ Play';
      this.playButton.style.background = '#2563eb';
    }
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'flex';
  }
}