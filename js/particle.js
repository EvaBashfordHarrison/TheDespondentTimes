class Particle {
  constructor(x, y, size, c, a) { 
    this.x = x; 
    this.y = y
    this.sizeVar = random(5); // animation 
    this.size = size; // pull in different size, to map the score index 
    this.alpha = a; // different alpha for 'all' and 'single' - too much alpha in 'all' and it's too chaotic 
    this.c = c; // red or green 
  }

    show() {
      noStroke();
      this.c.setAlpha(this.alpha); 
      fill(this.c); 
      ellipse(this.x,this.y,this.size * this.sizeVar,this.size * this.sizeVar); 
    }
  
    update() {
      this.size += 1; // grow 
      this.alpha -= 5; // fade 
    }
}