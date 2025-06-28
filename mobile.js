let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  touchEndX = 0;
  touchEndY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  multiTouch = false;

  init(paper) {
    // Prevenir comportamientos por defecto
    paper.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      // Detectar multi-touch para rotación
      if (e.touches.length > 1) {
        this.multiTouch = true;
        this.rotating = true;
        
        // Calcular rotación basada en dos dedos
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const deltaX = touch2.clientX - touch1.clientX;
        const deltaY = touch2.clientY - touch1.clientY;
        const angle = Math.atan2(deltaY, deltaX);
        this.rotation = (angle * 180 / Math.PI) + 45;
      } else if (e.touches.length === 1 && !this.multiTouch) {
        this.touchMoveX = e.touches[0].clientX;
        this.touchMoveY = e.touches[0].clientY;
        
        this.velX = this.touchMoveX - this.prevTouchX;
        this.velY = this.touchMoveY - this.prevTouchY;
      }

      if(this.holdingPaper && e.touches.length === 1 && !this.rotating) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
        
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      } else if (this.rotating) {
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    }, { passive: false });

    paper.addEventListener('touchstart', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;
      this.multiTouch = false;
    });

    paper.addEventListener('touchend', (e) => {
      this.holdingPaper = false;
      this.rotating = false;
      this.multiTouch = false;
      
      // Si quedan dedos en la pantalla, continuar la interacción
      if (e.touches.length > 0) {
        this.holdingPaper = true;
        this.prevTouchX = e.touches[0].clientX;
        this.prevTouchY = e.touches[0].clientY;
      }
    });

    // Doble tap para rotar
    let lastTap = 0;
    paper.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        // Doble tap detectado - rotar 45 grados
        this.rotation += 45;
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
      lastTap = currentTime;
    });

    // Gestión de eventos de gestos (iOS Safari)
    paper.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      this.rotating = true;
    }, { passive: false });
    
    paper.addEventListener('gesturechange', (e) => {
      e.preventDefault();
      this.rotation += e.rotation * 0.5;
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    }, { passive: false });
    
    paper.addEventListener('gestureend', () => {
      this.rotating = false;
    });

    // Prevenir zoom en móviles
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Configuración adicional para móviles
document.addEventListener('DOMContentLoaded', () => {
  // Prevenir zoom con doble tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Optimizar para dispositivos móviles
  if ('ontouchstart' in window) {
    document.body.style.touchAction = 'none';
  }
});
