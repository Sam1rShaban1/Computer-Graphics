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
      background: rgba(12, 16, 24, 0.95);
      padding: 8px 16px;
      border-radius: 10px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 100;
      font-family: 'Segoe UI', sans-serif;
    `;

    // Play/Pause button
    this.playButton = document.createElement('button');
    this.playButton.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    `;
    this.playButton.textContent = '▶ Play';
    this.playButton.addEventListener('click', () => this.togglePlayPause());
    this.playButton.addEventListener('mouseenter', () => {
      this.playButton.style.transform = 'scale(1.05)';
      this.playButton.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
    });
    this.playButton.addEventListener('mouseleave', () => {
      this.playButton.style.transform = 'scale(1)';
      this.playButton.style.boxShadow = 'none';
    });

    // Timeline container - vertical style
    this.timelineContainer = document.createElement('div');
    this.timelineContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0;
      position: relative;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.3) transparent;
      padding: 4px 0;
      z-index: 2;
    `;

    // Create timeline
    this.createTimeline();

    // Current year display
    this.yearDisplay = document.createElement('div');
    this.yearDisplay.style.cssText = `
      color: white;
      font-size: 14px;
      font-weight: 700;
      min-width: 40px;
      text-align: center;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    `;
    this.yearDisplay.textContent = this.currentYear;

    this.container.appendChild(this.playButton);
    this.container.appendChild(this.timelineContainer);
    this.container.appendChild(this.yearDisplay);

    document.body.appendChild(this.container);

    // Initialize with 2001 as active
    this.setYear(2001, false);

    this.autoPlayInterval = null;
    this.ANIMATION_DURATION = 20000;
  }

  createTimeline() {
    // Vertical timeline line in the middle
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.6), transparent);
      transform: translateY(-50%);
      z-index: 1;
    `;
    this.timelineContainer.appendChild(line);

    this.dots = {};
    const spacing = 40;

    TIMELINE_YEARS.forEach((year, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        min-width: 40px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        padding: 2px;
        border-radius: 4px;
      `;

      // Year label (top)
      const yearLabel = document.createElement('div');
      yearLabel.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;
      yearLabel.textContent = year;

      // Middle dot
      const dotWrapper = document.createElement('div');
      dotWrapper.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        margin: 2px 0;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-radius: 50%;
      `;

      const dotOuter = document.createElement('div');
      dotOuter.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.8);
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;

      const dotInner = document.createElement('div');
      dotInner.style.cssText = `
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;

      dotOuter.appendChild(dotInner);
      dotWrapper.appendChild(dotOuter);

      // Hover effect on entire item
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.15)';
        yearLabel.style.transform = 'scale(1.1)';
        yearLabel.style.color = 'white';
        dotOuter.style.transform = 'scale(1.2)';
        dotOuter.style.borderColor = '#60a5fa';
        dotOuter.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.6)';
        dotInner.style.background = '#60a5fa';
      });

      item.addEventListener('mouseleave', () => {
        const isActive = parseInt(year) <= this.currentYear;
        const isCurrent = parseInt(year) === this.currentYear;
        
        item.style.transform = isCurrent ? 'scale(1.1)' : 'scale(1)';
        yearLabel.style.transform = isCurrent ? 'scale(1.1)' : 'scale(1)';
        yearLabel.style.color = isActive ? 'white' : 'rgba(255, 255, 255, 0.7)';
        
        if (!isActive) {
          dotOuter.style.transform = 'scale(1)';
          dotOuter.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          dotOuter.style.boxShadow = 'none';
          dotInner.style.background = 'rgba(255, 255, 255, 0.9)';
        }
      });

      // Click handler
      item.addEventListener('click', (e) => {
        if (e.shiftKey || e.ctrlKey) {
          this.animateToYear(year);
        } else {
          this.setYear(year, true);
        }
      });

      item.appendChild(yearLabel);
      item.appendChild(dotWrapper);

      this.timelineContainer.appendChild(item);
      this.dots[year] = { item, yearLabel, dotOuter, dotInner };
    });

    const totalWidth = TIMELINE_YEARS.length * spacing;
    this.timelineContainer.style.width = `${Math.min(totalWidth, 500)}px`;
    this.timelineContainer.style.minHeight = '70px';
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
    this.stopAutoPlay();
    
    this.autoPlayInterval = setInterval(() => {
      const currentIndex = TIMELINE_YEARS.indexOf(this.currentYear);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < TIMELINE_YEARS.length) {
        this.setYear(TIMELINE_YEARS[nextIndex], true);
      } else {
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

    const prevYear = this.currentYear;
    this.currentYear = year;
    this.yearDisplay.textContent = year;
    
    // Animate year display
    this.yearDisplay.style.transform = 'scale(1.3)';
    setTimeout(() => {
      this.yearDisplay.style.transform = 'scale(1)';
    }, 150);
    
    // Update all dot styles
    Object.entries(this.dots).forEach(([dotYear, elements]) => {
      const { item, yearLabel, dotOuter, dotInner } = elements;
      const yearNum = parseInt(dotYear);
      const isActive = yearNum <= year;
      const isCurrent = yearNum === year;
      
        if (isActive) {
        dotOuter.style.background = '#2563eb';
        dotOuter.style.borderColor = '#2563eb';
        dotInner.style.background = 'white';
        dotOuter.style.boxShadow = isCurrent ? '0 0 12px rgba(37, 99, 235, 0.7)' : '0 0 8px rgba(37, 99, 235, 0.4)';
        yearLabel.style.color = 'white';
        
        if (isCurrent) {
          item.style.transform = 'scale(1.1)';
        } else {
          item.style.transform = 'scale(1)';
        }
      } else {
        dotOuter.style.background = 'rgba(255, 255, 255, 0.7)';
        dotOuter.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        dotInner.style.background = 'rgba(255, 255, 255, 0.9)';
        yearLabel.style.color = 'rgba(255, 255, 255, 0.6)';
        item.style.transform = 'scale(1)';
      }
    });

    if (this.onYearChange) {
      this.onYearChange(year, triggerAnimation);
    }
  }

  async animateToYear(targetYear) {
    const currentIndex = TIMELINE_YEARS.indexOf(this.currentYear);
    const targetIndex = TIMELINE_YEARS.indexOf(targetYear);
    
    if (targetIndex > currentIndex) {
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
    this.container.style.opacity = '0';
    this.container.style.transform = 'translateX(-50%) translateY(20px)';
    this.container.style.pointerEvents = 'none';
  }

  show() {
    this.container.style.opacity = '1';
    this.container.style.transform = 'translateX(-50%) translateY(0)';
    this.container.style.pointerEvents = 'auto';
  }
}
