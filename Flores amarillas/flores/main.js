(() => {
  const garden = document.getElementById("garden");
  const base = garden.querySelector(".flowers");

  /* ------------------------------------------------------------
     1) JARDÍN
     Cada ramo se define con:
       x    posición horizontal (%)
       y    altura desde el suelo (vh). Más alto = más lejos
       s    tamaño
       o    opacidad (los lejanos se ven más tenues)
       flip 1 normal, -1 espejo (para que no se vean idénticos)
       duo  true = solo 2 flores en ese ramo (más liviano)
     El ramo del centro (hero) es el que ya estaba en el HTML.
     ------------------------------------------------------------ */

  // Pantalla horizontal (computador)
  const HORIZONTAL = {
    hero: { x: 50, y: 0, s: 0.95 },
    copias: [
      { x: 8, y: 12, s: 0.42, o: 0.75, flip: -1, duo: true },
      { x: 30, y: 15, s: 0.38, o: 0.7, flip: 1, duo: true },
      { x: 70, y: 14, s: 0.4, o: 0.72, flip: -1, duo: true },
      { x: 92, y: 11, s: 0.44, o: 0.75, flip: 1, duo: true },
      { x: 19, y: 4, s: 0.62, o: 0.92, flip: -1, duo: false },
      { x: 82, y: 3, s: 0.66, o: 0.92, flip: 1, duo: false },
      { x: 3, y: -3, s: 0.8, o: 1, flip: 1, duo: false },
      { x: 97, y: -4, s: 0.78, o: 1, flip: -1, duo: false },
    ],
  };

  // Pantalla vertical (celular): los ramos lejanos suben para llenar la altura
  const VERTICAL = {
    hero: { x: 50, y: 6, s: 1.05 },
    copias: [
      { x: 24, y: 46, s: 0.45, o: 0.7, flip: 1, duo: true },
      { x: 78, y: 44, s: 0.42, o: 0.7, flip: -1, duo: true },
      { x: 72, y: 27, s: 0.62, o: 0.88, flip: -1, duo: true },
      { x: 18, y: 25, s: 0.66, o: 0.88, flip: 1, duo: true },
      { x: 90, y: 2, s: 0.75, o: 1, flip: 1, duo: false },
    ],
  };

  function colocar(el, cfg) {
    el.style.setProperty("--x", cfg.x + "%");
    el.style.setProperty("--y", cfg.y + "vh");
    el.style.setProperty("--s", cfg.s);
    el.style.setProperty("--o", cfg.o ?? 1);
    el.style.setProperty("--flip", cfg.flip ?? 1);
    // más lejos (y más alto) = más atrás
    el.style.zIndex = Math.round(50 - cfg.y);
  }

  const esVertical = window.innerHeight > window.innerWidth * 1.1;
  const layout = esVertical ? VERTICAL : HORIZONTAL;

  // Ramo central (ya existe en el HTML)
  colocar(base, layout.hero);

  // Las copias van apareciendo una tras otra, y cada una florece desde cero
  function sembrar() {
    layout.copias.forEach((cfg, i) => {
      setTimeout(() => {
        const copia = base.cloneNode(true);
        copia.classList.add("flowers--clone");
        if (cfg.duo) copia.classList.add("flowers--duo");
        colocar(copia, cfg);
        garden.appendChild(copia);
      }, 600 + i * 550);
    });
  }

  // Se reanudan las animaciones y empiezan a brotar las copias.
  // Antes esto dependía SOLO del evento "load": si una fuente, el audio o la red
  // tardaban en responder, "load" no llegaba y las flores nunca aparecían.
  // Ahora arranca con "load" o, como máximo, a los 1.5 s (lo que ocurra primero).
  let iniciado = false;
  function iniciar() {
    if (iniciado) return;
    iniciado = true;
    document.body.classList.remove("is-loading");
    sembrar();
  }
  if (document.readyState === "complete") {
    iniciar();
  } else {
    window.addEventListener("load", iniciar);
    setTimeout(iniciar, 1500);
  }

  /* ------------------------------------------------------------
     2) CARTA
     Pon tu imagen en la carpeta img/ con el nombre carta.jpg
     (también prueba carta.jpeg, carta.png y carta.webp).
     ------------------------------------------------------------ */
  const dialogo = document.getElementById("carta");
  const abrir = document.getElementById("abrir-carta");
  const cerrar = document.getElementById("cerrar-carta");
  const img = document.getElementById("carta-img");
  const vacio = document.getElementById("carta-vacio");
  const EXTENSIONES = ["jpg", "jpeg", "png", "webp"];

  function cargarCarta() {
    if (img.dataset.lista) return;
    let i = 0;
    const probarSiguiente = () => {
      if (i >= EXTENSIONES.length) {
        img.hidden = true;
        vacio.hidden = false;
        return;
      }
      img.src = "img/carta." + EXTENSIONES[i++];
    };
    img.onload = () => {
      img.dataset.lista = "1";
      img.hidden = false;
      vacio.hidden = true;
    };
    img.onerror = probarSiguiente;
    probarSiguiente();
  }

  abrir.addEventListener("click", () => {
    cargarCarta();
    document.body.classList.add("carta-abierta");
    dialogo.showModal();
  });

  cerrar.addEventListener("click", () => dialogo.close());

  // Clic fuera de la hoja también cierra
  dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo || e.target.classList.contains("carta__marco")) {
      dialogo.close();
    }
  });

  // Se dispara con el botón, con Esc y con clic fuera
  dialogo.addEventListener("close", () => {
    document.body.classList.remove("carta-abierta");
  });

  /* ------------------------------------------------------------
     3) SONIDO
     Silenciar con "muted" (no con pause) para que la letra de la
     canción siga sincronizada. Hay un botón en la escena y otro
     dentro de la carta; los dos se mantienen iguales.
     Si el navegador bloquea el autoplay, el botón aparece como
     "sin sonido" y el primer toque/tecla (o el botón) inicia la música.
     ------------------------------------------------------------ */
  const musica = document.getElementById("musica");
  const botonesSonido = document.querySelectorAll(".btn-sonido");

  function actualizarSonido() {
    const sinSonido = musica.muted || musica.paused;
    const texto = sinSonido ? "Activar sonido" : "Silenciar música";
    botonesSonido.forEach((b) => {
      b.classList.toggle("is-muted", sinSonido);
      b.setAttribute("aria-label", texto);
      b.title = texto;
    });
  }

  botonesSonido.forEach((b) =>
    b.addEventListener("click", () => {
      if (musica.paused) {
        // Autoplay bloqueado (o la canción terminó): iniciar con sonido
        musica.muted = false;
        musica.play().catch(() => {});
      } else {
        musica.muted = !musica.muted;
      }
      actualizarSonido();
    })
  );

  ["play", "pause", "ended", "volumechange"].forEach((ev) =>
    musica.addEventListener(ev, actualizarSonido)
  );

  // Reintento del autoplay en el primer gesto del usuario (celulares, Safari, etc.)
  const GESTOS = ["pointerdown", "pointerup", "keydown"];
  function desbloquear(e) {
    if (e.target.closest && e.target.closest(".btn-sonido")) return; // ese botón lo maneja solo
    musica
      .play()
      .then(() => GESTOS.forEach((g) => document.removeEventListener(g, desbloquear)))
      .catch(() => {});
  }
  const intento = musica.play();
  if (intento && intento.catch) {
    intento.catch(() => GESTOS.forEach((g) => document.addEventListener(g, desbloquear)));
  }

  actualizarSonido();
})();
