let juego;
let imagenFinal;
let imgBurbuja;
let imgPino;
let imgFondo;
let musica;

function preload() {
  imagenFinal = loadImage("final.png");
  imgBurbuja = loadImage("burbuja.png");
  imgPino = loadImage("Pino.png");
  imgFondo = loadImage("fondo.jpg");
  musica = loadSound("Gravity Falls Music.mp3");
}

class Jugador {
  constructor() {
    this.tamano = 40;
    this.reiniciar();
  }

  reiniciar() {
    this.x = width / 2;
    this.y = height - this.tamano - 10;
    this.vivo = true;
    this.gano = false;
  }

  mover(tecla) {
    if (!this.vivo || this.gano) return;
    let paso = 40;
    switch (tecla) {
      case 'ArrowUp':
        this.y -= paso;
        break;
      case 'ArrowDown':
        this.y += paso;
        break;
      case 'ArrowLeft':
        this.x -= paso;
        break;
      case 'ArrowRight':
        this.x += paso;
        break;
    }
    this.x = constrain(this.x, 0, width - this.tamano);
    this.y = constrain(this.y, 0, height - this.tamano);
  }

  mostrar() {
    imageMode(CENTER);
    image(imgPino, this.x + this.tamano / 2, this.y + this.tamano / 2, this.tamano, this.tamano);
  }

  actualizar() {
    if (this.y <= 0 && this.vivo) {
      this.gano = true;
      juego.estado = "ganaste";
    }
  }

  obtenerHitbox() {
    let margen = this.tamano * 0.1;
    return {
      x: this.x + margen,
      y: this.y + margen,
      w: this.tamano - margen * 2,
      h: this.tamano - margen * 2
    };
  }
}

class Burbuja {
  constructor(x, y, velocidad, tamano) {
    this.x = x;
    this.y = y;
    this.velocidad = velocidad;
    this.tamano = tamano * 0.8;
  }

  mover() {
    this.x += this.velocidad;
    if (this.velocidad > 0 && this.x > width + this.tamano) {
      this.x = -this.tamano;
    } else if (this.velocidad < 0 && this.x < -this.tamano) {
      this.x = width + this.tamano;
    }
  }

  mostrar() {
    imageMode(CENTER);
    image(imgBurbuja, this.x + this.tamano / 2, this.y + this.tamano / 4, this.tamano, this.tamano);
  }

  obtenerHitbox() {
    let margen = this.tamano * 0.2;
    return {
      x: this.x + margen,
      y: this.y + margen / 2,
      w: this.tamano - margen * 2,
      h: this.tamano - margen * 2
    };
  }

  colision(jugador) {
    let hitJ = jugador.obtenerHitbox();
    let hitB = this.obtenerHitbox();
    return (
      hitJ.x < hitB.x + hitB.w &&
      hitJ.x + hitJ.w > hitB.x &&
      hitJ.y < hitB.y + hitB.h &&
      hitJ.y + hitJ.h > hitB.y
    );
  }
}

class Corriente {
  constructor(y, cantidad, velocidad) {
    this.burbujas = [];
    this.y = y;
    this.crearBurbujas(cantidad, velocidad);
  }

 
  crearBurbujas(cantidad, velocidad) {
    let tamano = 50;
    let distanciaSeguraEntreBurbujas = 100; 
    let margenX = 50; 
    let jugadorX = width / 2;
    let distanciaSeguraJugador = 150; 

    for (let i = 0; i < cantidad; i++) {
      let x;
      let intentos = 0;
      let maxIntentos = 100;
      let posicionValida = false;

      
      while (intentos < maxIntentos && !posicionValida) {
        x = random(margenX, width - tamano - margenX);
        intentos++;
        posicionValida = true;

       
        for (let j = 0; j < this.burbujas.length; j++) {
          if (abs(this.burbujas[j].x - x) < distanciaSeguraEntreBurbujas) {
            posicionValida = false;
            break;
          }
        }

      
        if (posicionValida && this.y > height - 100) {
          if (abs(x - jugadorX) < distanciaSeguraJugador) {
            posicionValida = false;
          }
        }
      }

      
      if (posicionValida) {
          this.burbujas.push(new Burbuja(x, this.y, velocidad, tamano));
      } else {
          this.burbujas.push(new Burbuja(x, this.y, velocidad, tamano));
      }
    }
  }

  moverYMostrar() {
    for (let burbuja of this.burbujas) {
      burbuja.mover();
      burbuja.mostrar();
    }
  }

  verificarColisiones(jugador) {
    for (let burbuja of this.burbujas) {
      if (burbuja.colision(jugador)) {
        jugador.vivo = false;
      }
    }
  }
}

class Juego {
  constructor() {
    this.estado = "inicio";
    this.jugador = new Jugador();
    this.corrientes = [];
    this.crearCorrientes();
  }

  crearCorrientes() {
    this.corrientes.push(new Corriente(350, 3, 2));
    this.corrientes.push(new Corriente(250, 2, -3));
    this.corrientes.push(new Corriente(150, 4, 2.5));
    this.corrientes.push(new Corriente(450, 3, -2));
  }

  reiniciar() {
    this.jugador.reiniciar();
    this.corrientes = [];
    this.crearCorrientes();
    this.estado = "jugando";

    if (!musica.isPlaying()) {
      musica.setVolume(0.3);
      musica.loop();
    }
  }

  volverAlInicio() {
    this.jugador.reiniciar();
    this.estado = "inicio";
    musica.stop();
  }

  actualizar() {
    if (this.estado === "jugando") {
      imageMode(CORNER);
      image(imgFondo, 0, 0, width, height);

      for (let corriente of this.corrientes) {
        corriente.moverYMostrar();
        corriente.verificarColisiones(this.jugador);
      }

      this.jugador.mostrar();
      this.jugador.actualizar();

      if (!this.jugador.vivo) {
        this.estado = "perdiste";
        musica.stop();
      }

    } else if (this.estado === "inicio") {
      this.mostrarInicio();

    } else if (this.estado === "perdiste") {
      this.mostrarPerdiste();

    } else if (this.estado === "ganaste") {
      this.mostrarGanaste();
      musica.stop();
    }
  }

  mostrarInicio() {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(28);
    text("Escapa de Bill", width / 2, height / 2 - 60);
    textSize(16);
    text("Usa las flechas para moverte", width / 2, height / 2 - 20);
    text("Evita las burbujas y llega a la parte superior", width / 2, height / 2 + 10);
    text("Presiona ENTER para comenzar", width / 2, height / 2 + 40);
    text("Hecho por: Catalina Schwerdt", width / 2, height - 30);
  }

  mostrarPerdiste() {
    background(0);
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(32);
    text("¡Te atrapó una burbuja!", width / 2, height / 2);
    textSize(16);
    text("Presiona ENTER para reiniciar", width / 2, height / 2 + 40);
  }

  mostrarGanaste() {
    background(0);
    imageMode(CENTER);
    image(imagenFinal, width / 2, height / 2, width, height);
    fill(255);
    textAlign(CENTER);
    textSize(18);
    text("Presiona R para volver al inicio", width / 2, height - 40);
  }
}

function setup() {
  createCanvas(600, 500);
  juego = new Juego();
}

function draw() {
  juego.actualizar();
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (juego.estado === "inicio" || juego.estado === "perdiste") {
      juego.reiniciar();
    }
  } else if (key === 'r' || key === 'R') {
    if (juego.estado === "ganaste") {
      juego.volverAlInicio();
    }
  } else {
    juego.jugador.mover(key);
  }
}