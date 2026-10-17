
/* ==========================================
   💜 POKÉDEX DELUXE - JAVASCRIPT
   🌸 Versión corregida
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

  // 🌸 ELEMENTOS DEL HTML
  const listaPokemon = document.getElementById("listaPokemon");
  const contadorPokemon = document.getElementById("contadorPokemon");
  const buscarPokemon = document.getElementById("buscarPokemon");
  const btnBuscar = document.getElementById("btnBuscar");

  const seccionPokemon = document.querySelector(".seccion-pokemon");
  const seccionEvoluciones = document.getElementById("seccionEvoluciones");
  const seccionAdivina = document.getElementById("seccionAdivina");

  if (!listaPokemon || !contadorPokemon) {
    console.error("Faltan listaPokemon o contadorPokemon en el HTML.");
    return;
  }

  const API = "https://pokeapi.co/api/v2/";
  const TAMANO_TANDA = 20;

  let solicitudActual = 0;
  let vistaActual = "todos";
  let totalEspecies = 1025;
  let nombresPokemonBusqueda = [];
  let temporizadorBusqueda;
  let busquedaActual = 0;

  // 🌈 TIPOS EN ESPAÑOL
  const nombresTiposPokemon = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
  };

  const nombresRegionesPokemon = {
    kanto: "Kanto",
    johto: "Johto",
    hoenn: "Hoenn",
    sinnoh: "Sinnoh",
    unova: "Teselia",
    kalos: "Kalos",
    alola: "Alola",
    galar: "Galar",
    paldea: "Paldea",
    hisui: "Hisui"
  };

  const traducirTipo = tipo => nombresTiposPokemon[tipo] || tipo;
  const traducirRegion = region => nombresRegionesPokemon[region] || region;

  function nombreBonito(nombre) {
    const partes = nombre.split("-");
    const regiones = ["alola", "galar", "hisui", "paldea"];
    const region = partes.find(p => regiones.includes(p));

    const capitalizar = texto =>
      texto.charAt(0).toUpperCase() + texto.slice(1);

    if (!region) {
      return capitalizar(nombre.replaceAll("-", " "));
    }

    const extras = partes.slice(1).filter(p => p !== region);

    return `${capitalizar(partes[0])} de ${traducirRegion(region)}${
      extras.length ? ` (${extras.join(" ")})` : ""
    }`;
  }

  function prepararNombrePokemon(texto) {
    let nombre = String(texto || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

    for (const region of ["alola", "galar", "hisui", "paldea"]) {
      for (const sufijo of [` de ${region}`, ` ${region}`]) {
        if (nombre.endsWith(sufijo)) {
          return nombre.slice(0, -sufijo.length)
            .replaceAll(" ", "-") + `-${region}`;
        }
      }
    }

    return nombre.replaceAll(" ", "-");
  }

  function textoSeguro(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caracter]);
  }

  // 💜 CONEXIÓN CON POKÉAPI
  async function obtenerDatos(ruta) {
    const respuesta = await fetch(API + ruta);

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${ruta}`);
    }

    return respuesta.json();
  }

  function obtenerPokemon(id) {
    return obtenerDatos(`pokemon/${encodeURIComponent(id)}`);
  }

  function imagenPokemon(pokemon) {
    return (
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.other?.home?.front_default ||
      pokemon.sprites?.front_default ||
      ""
    );
  }

  // ❤️ FAVORITOS
  let favoritos = [];

  try {
    const guardados = JSON.parse(
      localStorage.getItem("pokemonFavoritos") || "[]"
    );

    favoritos = Array.isArray(guardados) ? guardados : [];
  } catch (error) {
    favoritos = [];
  }

  function guardarFavorito(nombre) {
    if (favoritos.includes(nombre)) {
      favoritos = favoritos.filter(p => p !== nombre);
    } else {
      favoritos.push(nombre);
    }

    try {
      localStorage.setItem(
        "pokemonFavoritos",
        JSON.stringify(favoritos)
      );
    } catch (error) {
      console.warn("No se pudieron guardar los favoritos.");
    }

    if (vistaActual === "favoritos") {
      mostrarFavoritos();
    } else {
      document.querySelectorAll(".btn-favorito").forEach(boton => {
        boton.textContent = favoritos.includes(boton.dataset.id)
          ? "❤️" : "🤍";
      });
    }
  }

  // 🎀 CREAR TARJETAS
  function mostrarPokemon(pokemon) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "pokemon-card";
    tarjeta.dataset.id = pokemon.name;

    const nombre = nombreBonito(pokemon.name);

    const tipos = pokemon.types.map(({ type }) => `
      <span class="pokemon-tipo ${type.name}">
        ${traducirTipo(type.name)}
      </span>
    `).join("");

    tarjeta.innerHTML = `
      <p class="pokemon-numero">
        #${String(pokemon.id).padStart(4, "0")}
      </p>

      <img
        class="pokemon-imagen"
        src="${textoSeguro(imagenPokemon(pokemon))}"
        alt="${textoSeguro(nombre)}"
        loading="lazy"
      >

      <h3 class="pokemon-nombre">${textoSeguro(nombre)}</h3>

      <div class="pokemon-tipos">${tipos}</div>

      <div class="pokemon-acciones">
        <button type="button"
          class="btn-favorito"
          data-id="${textoSeguro(pokemon.name)}">
          ${favoritos.includes(pokemon.name) ? "❤️" : "🤍"}
        </button>

        <button type="button"
          class="btn-sonido"
          data-id="${textoSeguro(pokemon.name)}">
          🔊
        </button>
      </div>
    `;

    listaPokemon.appendChild(tarjeta);
  }

  // 🔊 SONIDOS Y FAVORITOS
  listaPokemon.addEventListener("click", async evento => {
    const favorito = evento.target.closest(".btn-favorito");

    if (favorito) {
      guardarFavorito(favorito.dataset.id);
      return;
    }

    const sonido = evento.target.closest(".btn-sonido");

    if (sonido) {
      try {
        const pokemon = await obtenerPokemon(sonido.dataset.id);
        const archivo = pokemon.cries?.latest || pokemon.cries?.legacy;

        if (!archivo) {
          alert("Este Pokémon no tiene sonido disponible.");
          return;
        }

        await new Audio(archivo).play();
      } catch (error) {
        alert("No se pudo reproducir el sonido.");
      }
      return;
    }

    const tarjeta = evento.target.closest(".pokemon-card");

    if (tarjeta) {
      mostrarInfoPokemon(tarjeta.dataset.id);
    }
  });

  // 🌸 CAMBIAR SECCIONES
  function iniciarVista(nombre, mensaje, seccion = "pokemon") {
    const solicitud = ++solicitudActual;
    vistaActual = nombre;

    listaPokemon.innerHTML = "";
    contadorPokemon.textContent = mensaje;

    if (seccionPokemon) {
      seccionPokemon.hidden = seccion !== "pokemon";
    }

    if (seccionEvoluciones) {
      seccionEvoluciones.hidden = seccion !== "evoluciones";
    }

    if (seccionAdivina) {
      seccionAdivina.hidden = seccion !== "adivina";
    }

    return solicitud;
  }

  // 🌈 CARGAR POR TANDAS
  async function cargarListaPokemon(ids, solicitud, descripcion) {
    if (!ids.length) {
      contadorPokemon.textContent = "No hay Pokémon para mostrar. 🌸";
      return;
    }

    let cargados = 0;

    for (let i = 0; i < ids.length; i += TAMANO_TANDA) {
      if (solicitud !== solicitudActual) return;

      const tanda = ids.slice(i, i + TAMANO_TANDA);

      const resultados = await Promise.allSettled(
        tanda.map(id => obtenerPokemon(id))
      );

      if (solicitud !== solicitudActual) return;

      resultados.forEach(resultado => {
        if (resultado.status === "fulfilled") {
          mostrarPokemon(resultado.value);
          cargados++;
        }
      });

      contadorPokemon.textContent =
        `Mostrando ${cargados} de ${ids.length} ${descripcion} 💜`;

      if (cargados === 0 && i + TAMANO_TANDA >= ids.length) {
        contadorPokemon.textContent =
          "No se pudieron cargar los Pokémon. Revisa tu conexión. 🌸";
      }
    }
  }

  // 💜 POKÉDEX NACIONAL
  async function cargarPokemon() {
    const solicitud = iniciarVista(
      "todos",
      "Preparando la Pokédex... 💜"
    );

    try {
      const datos = await obtenerDatos("pokemon-species?limit=1");
      totalEspecies = datos.count;

      if (solicitud !== solicitudActual) return;

      const ids = Array.from(
        { length: totalEspecies },
        (_, i) => i + 1
      );

      await cargarListaPokemon(ids, solicitud, "Pokémon");
    } catch (error) {
      if (solicitud === solicitudActual) {
        contadorPokemon.textContent =
          "No se pudo cargar la Pokédex. Revisa tu conexión. 🌸";
      }
    }
  }

  // 🔎 BUSCADOR
  async function cargarNombresBusqueda() {
    try {
      const datos = await obtenerDatos("pokemon?limit=2000");
      nombresPokemonBusqueda = datos.results;
    } catch (error) {
      console.warn("No se pudo preparar el buscador.", error);
    }
  }

  async function buscarUnPokemon() {
    if (!buscarPokemon) return;

    const texto = prepararNombrePokemon(buscarPokemon.value);
    const numero = ++busquedaActual;

    const solicitud = iniciarVista(
      "busqueda",
      texto ? "Buscando Pokémon... 🔎" : "Escribe un Pokémon. 🔎"
    );

    if (!texto) return;

    let coincidencias = nombresPokemonBusqueda.filter(p =>
      p.name.includes(texto)
    );

    if (!coincidencias.length) {
      try {
        const pokemon = await obtenerPokemon(texto);

        if (numero === busquedaActual &&
            solicitud === solicitudActual) {
          mostrarPokemon(pokemon);
          contadorPokemon.textContent = "1 Pokémon encontrado 💜";
        }
      } catch (error) {
        if (numero === busquedaActual &&
            solicitud === solicitudActual) {
          contadorPokemon.textContent =
            "No encontramos Pokémon con ese nombre. 🌸";
        }
      }
      return;
    }

    const resultados = await Promise.allSettled(
      coincidencias.slice(0, 30).map(p => obtenerPokemon(p.name))
    );

    if (numero !== busquedaActual ||
        solicitud !== solicitudActual) return;

    resultados.forEach(resultado => {
      if (resultado.status === "fulfilled") {
        mostrarPokemon(resultado.value);
      }
    });

    contadorPokemon.textContent =
      `${coincidencias.length} coincidencias 💜` +
      (coincidencias.length > 30 ? " (primeras 30)" : "");
  }

  if (buscarPokemon) {
    buscarPokemon.addEventListener("input", () => {
      clearTimeout(temporizadorBusqueda);
      busquedaActual++;
      solicitudActual++;

      temporizadorBusqueda = setTimeout(buscarUnPokemon, 300);
    });

    buscarPokemon.addEventListener("keydown", evento => {
      if (evento.key === "Enter") {
        clearTimeout(temporizadorBusqueda);
        buscarUnPokemon();
      }
    });
  }

  btnBuscar?.addEventListener("click", () => {
    clearTimeout(temporizadorBusqueda);
    buscarUnPokemon();
  });

  // 🌈 FILTROS POR TIPO
  async function filtrarPorTipo(tipo) {
    if (tipo === "todos") {
      cargarPokemon();
      return;
    }

    const solicitud = iniciarVista(
      "tipo",
      `Cargando tipo ${traducirTipo(tipo)}... 🌈`
    );

    try {
      const datos = await obtenerDatos(`type/${tipo}`);

      if (solicitud !== solicitudActual) return;

      const nombres = datos.pokemon.map(p => p.pokemon.name);

      await cargarListaPokemon(
        nombres,
        solicitud,
        `Pokémon de tipo ${traducirTipo(tipo)}`
      );
    } catch (error) {
      if (solicitud === solicitudActual) {
        contadorPokemon.textContent = "Error al cargar este tipo. 🌸";
      }
    }
  }

  document.querySelectorAll(".btn-tipo").forEach(boton => {
    boton.addEventListener("click", () => {
      filtrarPorTipo(boton.dataset.tipo);
    });
  });

  // 🗺️ REGIONES
  const regionesPokemon = {
    kanto: [1, 151],
    johto: [152, 251],
    hoenn: [252, 386],
    sinnoh: [387, 493],
    unova: [494, 649],
    kalos: [650, 721],
    alola: [722, 809],
    galar: [810, 905],
    paldea: [906, 1025]
  };

  const formasRegionales = {
    alola: [
      "rattata", "raticate", "raichu", "sandshrew",
      "sandslash", "vulpix", "ninetales", "diglett",
      "dugtrio", "meowth", "persian", "geodude",
      "graveler", "golem", "grimer", "muk",
      "exeggutor", "marowak"
    ].map(p => `${p}-alola`),

    galar: [
      "meowth", "ponyta", "rapidash", "slowpoke",
      "slowbro", "farfetchd", "weezing", "mr-mime",
      "articuno", "zapdos", "moltres", "slowking",
      "corsola", "zigzagoon", "linoone", "darumaka",
      "yamask", "stunfisk"
    ].map(p => `${p}-galar`).concat("darmanitan-galar-standard"),

    hisui: [
      "growlithe", "arcanine", "voltorb", "electrode",
      "typhlosion", "qwilfish", "sneasel", "samurott",
      "lilligant", "zorua", "zoroark", "braviary",
      "sliggoo", "goodra", "avalugg", "decidueye"
    ].map(p => `${p}-hisui`),

    paldea: [
      "tauros-paldea-combat-breed",
      "tauros-paldea-blaze-breed",
      "tauros-paldea-aqua-breed",
      "wooper-paldea"
    ]
  };

  async function filtrarPorRegion(region) {
    if (region === "todas") {
      cargarPokemon();
      return;
    }

    if (!regionesPokemon[region]) return;

    const solicitud = iniciarVista(
      "region",
      `Cargando ${traducirRegion(region)}... 🗺️`
    );

    const [inicio, fin] = regionesPokemon[region];

    const numeros = Array.from(
      { length: fin - inicio + 1 },
      (_, i) => inicio + i
    );

    const variantes = [...(formasRegionales[region] || [])];

    if (region === "sinnoh") {
      variantes.push(...formasRegionales.hisui);
    }

    await cargarListaPokemon(
      [...numeros, ...variantes],
      solicitud,
      `Pokémon de ${traducirRegion(region)}`
    );
  }

  document.querySelectorAll(".btn-region").forEach(boton => {
    boton.addEventListener("click", () => {
      filtrarPorRegion(boton.dataset.region);
    });
  });

  // ❤️ MOSTRAR FAVORITOS
  async function mostrarFavoritos() {
    const solicitud = iniciarVista(
      "favoritos",
      "Cargando favoritos... ❤️"
    );

    if (!favoritos.length) {
      contadorPokemon.textContent =
        "Todavía no tienes Pokémon favoritos. 💜";
      return;
    }

    await cargarListaPokemon(
      [...favoritos],
      solicitud,
      "Pokémon favoritos"
    );
  }

  document.getElementById("btnFavoritos")
    ?.addEventListener("click", mostrarFavoritos);

  // 💎 MEGAEVOLUCIONES
  const nombresMegas = [
    "venusaur-mega",
    "charizard-mega-x",
    "charizard-mega-y",
    "blastoise-mega",
    "beedrill-mega",
    "pidgeot-mega",
    "alakazam-mega",
    "slowbro-mega",
    "gengar-mega",
    "kangaskhan-mega",
    "pinsir-mega",
    "gyarados-mega",
    "aerodactyl-mega",
    "mewtwo-mega-x",
    "mewtwo-mega-y",
    "ampharos-mega",
    "steelix-mega",
    "scizor-mega",
    "heracross-mega",
    "houndoom-mega",
    "tyranitar-mega",
    "sceptile-mega",
    "blaziken-mega",
    "swampert-mega",
    "gardevoir-mega",
    "sableye-mega",
    "mawile-mega",
    "aggron-mega",
    "medicham-mega",
    "manectric-mega",
    "sharpedo-mega",
    "camerupt-mega",
    "altaria-mega",
    "banette-mega",
    "absol-mega",
    "glalie-mega",
    "salamence-mega",
    "metagross-mega",
    "latias-mega",
    "latios-mega",
    "rayquaza-mega",
    "lopunny-mega",
    "garchomp-mega",
    "lucario-mega",
    "abomasnow-mega",
    "gallade-mega",
    "audino-mega",
    "diancie-mega"
  ];

  function mostrarMegas() {
    const solicitud = iniciarVista(
      "megas",
      "Cargando megaevoluciones... 💎"
    );

    cargarListaPokemon(
      nombresMegas,
      solicitud,
      "megaevoluciones"
    );
  }

  document.getElementById("btnMegas")
    ?.addEventListener("click", mostrarMegas);

  // 🌱 EVOLUCIONES
  const buscarEvolucion = document.getElementById("buscarEvolucion");
  const resultadoEvoluciones = document.getElementById("resultadoEvoluciones");

  let busquedaEvolucionActual = 0;

  function extraerEtapasEvolucion(raiz) {
    const etapas = [];
    let nivel = [raiz];

    while (nivel.length) {
      etapas.push(nivel.map(nodo => nodo.species.name));
      nivel = nivel.flatMap(nodo => nodo.evolves_to);
    }

    return etapas;
  }

  async function buscarArbolEvoluciones() {
    if (!buscarEvolucion || !resultadoEvoluciones) return;

    const nombre = prepararNombrePokemon(buscarEvolucion.value);
    const consulta = ++busquedaEvolucionActual;

    if (!nombre) {
      resultadoEvoluciones.textContent =
        "Escribe el nombre de un Pokémon. 🌸";
      return;
    }

    resultadoEvoluciones.textContent =
      "Buscando evoluciones... 🌱";

    try {
      const pokemon = await obtenerPokemon(nombre);
      const especie = await obtenerDatos(
        `pokemon-species/${pokemon.species.name}`
      );

      const respuesta = await fetch(especie.evolution_chain.url);

      if (!respuesta.ok) {
        throw new Error("Cadena no disponible");
      }

      const cadena = await respuesta.json();
      const etapas = extraerEtapasEvolucion(cadena.chain);
      const nombres = [...new Set(etapas.flat())];

      const resultados = await Promise.allSettled(
        nombres.map(p => obtenerPokemon(p))
      );

      if (consulta !== busquedaEvolucionActual ||
          vistaActual !== "evoluciones") return;

      const datos = new Map();

      resultados.forEach((resultado, i) => {
        if (resultado.status === "fulfilled") {
          datos.set(nombres[i], resultado.value);
        }
      });

      resultadoEvoluciones.innerHTML = "";

      const arbol = document.createElement("div");
      arbol.className = "arbol-evoluciones";

      etapas.forEach((etapa, i) => {
        if (i > 0) {
          const flecha = document.createElement("span");
          flecha.textContent = "➡️";
          arbol.appendChild(flecha);
        }

        const grupo = document.createElement("div");
        grupo.style.cssText =
          "display:flex;flex-wrap:wrap;gap:12px;justify-content:center";

        etapa.forEach(nombreEtapa => {
          const pokemon = datos.get(nombreEtapa);
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta-evolucion";

          if (pokemon) {
            const imagen = document.createElement("img");
            imagen.src = imagenPokemon(pokemon);
            imagen.alt = nombreBonito(nombreEtapa);
            tarjeta.appendChild(imagen);
          }

          const titulo = document.createElement("h3");
          titulo.textContent = nombreBonito(nombreEtapa);
          tarjeta.appendChild(titulo);
          grupo.appendChild(tarjeta);
        });

        arbol.appendChild(grupo);
      });

      resultadoEvoluciones.appendChild(arbol);

    } catch (error) {
      if (consulta === busquedaEvolucionActual) {
        resultadoEvoluciones.textContent =
          "No encontramos esa evolución. 🌸";
      }
    }
  }

  document.getElementById("btnEvoluciones")
    ?.addEventListener("click", () => {
      iniciarVista("evoluciones", "Árbol de evoluciones", "evoluciones");
      busquedaEvolucionActual++;

      if (resultadoEvoluciones) {
        resultadoEvoluciones.textContent =
          "Busca un Pokémon para conocer sus evoluciones. 💜";
      }
    });

    /* 🌸 BUSCADOR DE EVOLUCIONES EN TIEMPO REAL */

buscarEvolucion?.addEventListener("input", () => {
    clearTimeout(temporizadorEvolucion);

    // Cancela los resultados de búsquedas anteriores
    busquedaEvolucionActual++;

    if (!buscarEvolucion.value.trim()) {
        if (resultadoEvoluciones) {
            resultadoEvoluciones.textContent =
                "Escribe un Pokémon para ver sus evoluciones. 💜";
        }
        return;
    }

    // Espera 400 milisegundos antes de buscar
    temporizadorEvolucion = setTimeout(() => {
        buscarArbolEvoluciones();
    }, 400);
});

  document.getElementById("btnBuscarEvolucion")
    ?.addEventListener("click", buscarArbolEvoluciones);

  buscarEvolucion?.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
      buscarArbolEvoluciones();
    }
  });

  
  /* ==========================================
     🎮 MINIJUEGO CON TRES DIFICULTADES
     ========================================== */

  const imagenAdivina = document.getElementById("imagenAdivina");
  const opcionesAdivina = document.getElementById("opcionesAdivina");
  const mensajeAdivina = document.getElementById("mensajeAdivina");
  const btnSiguienteAdivina = document.getElementById("btnSiguienteAdivina");
  const resultadoFinalAdivina = document.getElementById("resultadoFinalAdivina");
  const zonaJuegoAdivina = document.getElementById("zonaJuegoAdivina");
  const seleccionDificultad = document.getElementById("seleccionDificultad");

  /* 🌸 POKÉMON FÁCILES */
  const faciles = [
    1, 4, 7, 25, 26, 37, 39, 52, 54, 58,
    94, 104, 129, 130, 133, 134, 135, 136,
    143, 149, 150, 151, 172, 175, 196, 197,
    212, 248, 249, 250, 251, 282, 384, 448,
    470, 471, 700, 778
  ];

  /* 💜 POKÉMON DE DIFICULTAD MEDIA */
  const medios = [
    17, 22, 28, 33, 42, 49, 55, 67, 75, 82,
    93, 97, 101, 112, 117, 119, 126, 141,
    148, 153, 156, 159, 168, 178, 181, 189,
    193, 203, 210, 214, 224, 229, 232, 237,
    254, 259, 272, 279, 291, 297, 306, 317,
    330, 342, 346, 354, 359, 362, 365, 373,
    389, 395, 400, 407, 416, 423, 426, 430,
    437, 442, 450, 452, 454, 461, 464, 469,
    472, 475, 477, 479, 497, 503, 508, 512,
    514, 516, 521, 526, 530, 537, 542, 549,
    553, 560, 567, 571, 579, 584, 589, 596,
    601, 609, 612, 620, 623, 628, 635, 637,
    652, 655, 658, 663, 668, 671, 675, 681,
    687, 689, 693, 697, 701, 706, 707, 711,
    715, 724, 727, 730, 733, 738, 745, 748,
    758, 763, 768, 773, 780, 784, 795, 804,
    812, 815, 818, 823, 826, 830, 834, 839,
    842, 845, 849, 855, 858, 861, 865, 869,
    873, 877, 881, 884, 897, 900, 903, 908,
    911, 914, 923, 927, 930, 934, 937, 941,
    945, 949, 952, 956, 959, 963, 967, 970,
    974, 977, 980, 984, 987, 990, 994, 997,
    1001, 1005, 1009, 1013, 1017, 1021, 1025
  ];

  /* 🔥 POKÉMON DIFÍCILES */
  const dificiles = [
    11, 14, 24, 36, 44, 47, 51, 56, 61, 64,
    70, 78, 84, 87, 90, 96, 99, 102, 105,
    108, 113, 114, 121, 124, 127, 132, 137,
    139, 144, 146, 161, 164, 166, 170, 173,
    176, 179, 182, 185, 188, 192, 195, 198,
    201, 204, 207, 211, 213, 216, 219, 222,
    225, 227, 230, 233, 235, 238, 241, 244,
    247, 252, 255, 258, 261, 264, 267, 270,
    273, 276, 281, 284, 287, 290, 293, 296,
    299, 302, 305, 308, 311, 314, 318, 321,
    324, 327, 331, 334, 337, 340, 343, 347,
    350, 353, 356, 360, 363, 366, 369, 372,
    375, 378, 381, 385, 388, 391, 394, 397,
    401, 404, 408, 411, 414, 417, 420, 424,
    427, 431, 434, 438, 441, 444, 447, 451,
    455, 458, 462, 465, 468, 473, 476, 480,
    484, 488, 491, 494, 498, 501, 504, 507,
    510, 513, 517, 520, 523, 527, 529, 532,
    535, 538, 541, 544, 547, 550, 554, 557,
    561, 564, 568, 570, 573, 576, 580, 583,
    586, 590, 593, 597, 600, 603, 606, 610,
    613, 616, 619, 622, 625, 629, 632, 636,
    639, 642, 645, 648, 651, 654, 657, 660,
    664, 667, 670, 673, 676, 679, 682, 685,
    688, 691, 694, 698, 702, 705, 709, 712,
    716, 719, 722, 725, 728, 731, 734, 737,
    740, 743, 746, 749, 752, 755, 759, 762,
    765, 769, 772, 775, 779, 782, 785, 788,
    792, 796, 799, 802, 805, 809, 813, 816,
    819, 822, 825, 829, 832, 835, 838, 841,
    844, 847, 850, 853, 856, 859, 862, 866,
    870, 874, 878, 882, 885, 888, 891, 894,
    898, 901, 904, 907, 910, 913, 916, 919,
    922, 925, 928, 931, 935, 938, 942, 946,
    950, 953, 957, 960, 964, 968, 971, 975,
    978, 981, 985, 988, 991, 995, 998, 1002,
    1006, 1010, 1014, 1018, 1022, 1024
  ];

  /* 🏆 CONFIGURACIÓN DE LOS NIVELES */
  const nivelesAdivina = {
    facil: {
      nombre: "Fácil",
      rondas: 10,
      opciones: 3,
      maxPuntos: 100,
      ids: faciles
    },

    medio: {
      nombre: "Medio",
      rondas: 30,
      opciones: 4,
      maxPuntos: 500,
      ids: medios
    },

    dificil: {
      nombre: "Difícil",
      rondas: 60,
      opciones: 5,
      maxPuntos: 1000,
      ids: dificiles
    }
  };

  /* 💜 VARIABLES DEL JUEGO */
  let dificultadAdivina = "facil";
  let rondaAdivina = 1;
  let puntosAdivina = 0;
  let aciertosAdivina = 0;
  let respuestaAdivina = "";
  let juegoActual = 0;
  let errorRondaAdivina = false;
  let pokemonUsadosAdivina = new Set();

  /* 🎀 MEZCLAR POKÉMON */
  function mezclarAdivina(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }

  /* 🌸 ACTUALIZAR RONDAS Y PUNTOS */
  function actualizarMarcador() {
    const nivel = nivelesAdivina[dificultadAdivina];

    const ronda = document.getElementById("rondaAdivina");
    const puntos = document.getElementById("puntosAdivina");

    if (ronda) {
      ronda.textContent =
        `🌸 Ronda: ${rondaAdivina} de ${nivel.rondas}`;
    }

    if (puntos) {
      puntos.textContent =
        `🏆 Puntos: ${puntosAdivina} de ${nivel.maxPuntos}`;
    }
  }

  /* 🎮 ELEGIR DIFICULTAD */
  function elegirDificultad(nivel) {
    if (!nivelesAdivina[nivel]) return;

    dificultadAdivina = nivel;
    rondaAdivina = 1;
    puntosAdivina = 0;
    aciertosAdivina = 0;
    respuestaAdivina = "";

    pokemonUsadosAdivina.clear();

    if (seleccionDificultad) {
      seleccionDificultad.hidden = true;
    }

    if (zonaJuegoAdivina) {
      zonaJuegoAdivina.hidden = false;
    }

    const marcador = document.getElementById("marcadorAdivina");

if (marcador) {
    marcador.hidden = false;
}

    if (resultadoFinalAdivina) {
      resultadoFinalAdivina.hidden = true;
    }

    nuevaRondaAdivina();
  }

  /* CONECTAR LOS BOTONES DEL HTML */
  window.elegirDificultad = elegirDificultad;

  /* 👀 NUEVA RONDA */
  async function nuevaRondaAdivina() {
    if (
      !imagenAdivina ||
      !opcionesAdivina ||
      !mensajeAdivina ||
      !btnSiguienteAdivina
    ) return;

    const juego = ++juegoActual;
    const nivel = nivelesAdivina[dificultadAdivina];

    errorRondaAdivina = false;
    respuestaAdivina = "";

    mensajeAdivina.textContent =
      "Preparando Pokémon misterioso... 💜";

    imagenAdivina.hidden = true;
    btnSiguienteAdivina.hidden = true;
    opcionesAdivina.innerHTML = "";

    actualizarMarcador();

    try {
      const disponibles = nivel.ids.filter(
        id => !pokemonUsadosAdivina.has(id)
      );

      if (!disponibles.length) {
        throw new Error("No quedan Pokémon disponibles");
      }

      const idCorrecto = mezclarAdivina(disponibles)[0];

      const idsOpciones = mezclarAdivina([
        idCorrecto,
        ...mezclarAdivina(
          nivel.ids.filter(id => id !== idCorrecto)
        ).slice(0, nivel.opciones - 1)
      ]);

      const pokemones = await Promise.all(
        idsOpciones.map(id => obtenerPokemon(id))
      );

      if (
        juego !== juegoActual ||
        vistaActual !== "adivina"
      ) return;

      const pokemonCorrecto = pokemones.find(
        pokemon => pokemon.id === idCorrecto
      );

      if (!pokemonCorrecto) {
        throw new Error("Pokémon no encontrado");
      }

      pokemonUsadosAdivina.add(idCorrecto);

      respuestaAdivina = pokemonCorrecto.name;

      imagenAdivina.src = imagenPokemon(pokemonCorrecto);
      imagenAdivina.alt = "Pokémon misterioso";

      /* 💜 SILUETA NEGRA */
      imagenAdivina.style.filter = "brightness(0)";
      imagenAdivina.style.background = "transparent";
      imagenAdivina.hidden = false;

      mensajeAdivina.textContent =
        "¡Adivina el Pokémon! 🌸";

      pokemones.forEach(pokemon => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "opcion-pokemon";
        boton.textContent = nombreBonito(pokemon.name);

        boton.addEventListener("click", () => {
          responderAdivina(pokemon.name);
        });

        opcionesAdivina.appendChild(boton);
      });

    } catch (error) {
      if (
        juego !== juegoActual ||
        vistaActual !== "adivina"
      ) return;

      console.warn("Error al preparar la ronda:", error);

      errorRondaAdivina = true;

      mensajeAdivina.textContent =
        "No se pudo cargar. Intenta nuevamente. 🌸";

      btnSiguienteAdivina.textContent = "🔄 Reintentar";
      btnSiguienteAdivina.hidden = false;
    }
  }

  /* 🏆 COMPROBAR RESPUESTA */
  function responderAdivina(nombre) {
    if (!respuestaAdivina) return;

    const acierto = nombre === respuestaAdivina;
    const nivel = nivelesAdivina[dificultadAdivina];

    if (acierto) {
      aciertosAdivina++;
    }

    puntosAdivina = Math.round(
      (aciertosAdivina / nivel.rondas) * nivel.maxPuntos
    );

    mensajeAdivina.textContent = acierto
      ? "¡Correcto! Ganaste puntos. 🎉"
      : `Era ${nombreBonito(respuestaAdivina)}. 💜`;

    respuestaAdivina = "";

    imagenAdivina.style.filter = "brightness(1)";

    opcionesAdivina.querySelectorAll("button").forEach(boton => {
      boton.disabled = true;
    });

    actualizarMarcador();

    btnSiguienteAdivina.textContent =
      rondaAdivina === nivel.rondas
        ? "🏆 Ver resultados"
        : "🎲 Siguiente Pokémon";

    btnSiguienteAdivina.hidden = false;
  }

  /* 🎀 RESULTADOS FINALES */
  function terminarJuegoAdivina() {
    if (!zonaJuegoAdivina || !resultadoFinalAdivina) return;

    const nivel = nivelesAdivina[dificultadAdivina];

    zonaJuegoAdivina.hidden = true;
    resultadoFinalAdivina.hidden = false;

    const puntuacion = document.getElementById(
      "puntuacionFinalAdivina"
    );

    const rango = document.getElementById(
      "rangoFinalAdivina"
    );

    const frase = document.getElementById(
      "fraseFinalAdivina"
    );

    const porcentaje = Math.round(
      (aciertosAdivina / nivel.rondas) * 100
    );

    const rangos = [
      [100, "👑 Maestro Pokémon"],
      [80, "🏆 Campeón Pokémon"],
      [60, "🌟 Entrenador experto"],
      [40, "🎀 Gran entrenador"],
      [20, "🌱 Entrenador en progreso"],
      [10, "🐣 Entrenador principiante"],
      [0, "💤 Magikarp despistado"]
    ];

    if (puntuacion) {
      puntuacion.textContent =
        `${puntosAdivina} de ${nivel.maxPuntos} puntos · Nivel ${nivel.nombre}`;
    }

    if (rango) {
      rango.textContent = rangos.find(
        ([minimo]) => porcentaje >= minimo
      )[1];
    }

    if (frase) {
      frase.textContent =
        `¡Acertaste ${aciertosAdivina} de ${nivel.rondas} Pokémon! 💜`;
    }

    /* 🏆 ACTUALIZAR TABLA DE RANGOS */
    const tabla = resultadoFinalAdivina.querySelector("table");

    if (tabla) {
      const filas = [...tabla.querySelectorAll("tr")].filter(
        fila => fila.querySelectorAll("td").length >= 2
      );

      const limites = [100, 80, 60, 40, 20, 10, 0];

      if (filas.length === limites.length) {
        filas.forEach((fila, i) => {
          const celda = fila.querySelector("td");

          const superior = i === 0
            ? 100
            : (i === 1 ? 99 : limites[i - 1] - 1);

          const inferior = limites[i];

          const minimoPuntos = Math.ceil(
            inferior * nivel.maxPuntos / 100
          );

          const maximoPuntos = Math.floor(
            superior * nivel.maxPuntos / 100
          );

          celda.textContent = i === 0
            ? String(nivel.maxPuntos)
            : `${minimoPuntos} - ${maximoPuntos}`;
        });
      }
    }
  }

  /* 🌷 VOLVER A ELEGIR DIFICULTAD */
  function iniciarJuegoAdivina() {
    ++juegoActual;

    iniciarVista(
      "adivina",
      "Minijuego Pokémon",
      "adivina"
    );

    respuestaAdivina = "";

    const marcador = document.getElementById("marcadorAdivina");

if (marcador) {
    marcador.hidden = true;
}

    if (seleccionDificultad) {
      seleccionDificultad.hidden = false;
    }

    if (zonaJuegoAdivina) {
      zonaJuegoAdivina.hidden = true;
    }

    if (resultadoFinalAdivina) {
      resultadoFinalAdivina.hidden = true;
    }
  }

  /* 🎮 BOTÓN PARA ABRIR EL MINIJUEGO */
  document.getElementById("btnAdivina")
    ?.addEventListener("click", iniciarJuegoAdivina);

  /* 🔄 BOTÓN PARA VOLVER A JUGAR */
  document.getElementById("btnReiniciarAdivina")
    ?.addEventListener("click", iniciarJuegoAdivina);

  /* 🎲 SIGUIENTE POKÉMON */
  btnSiguienteAdivina?.addEventListener("click", () => {
    if (errorRondaAdivina) {
      nuevaRondaAdivina();
      return;
    }

    if (respuestaAdivina) return;

    const nivel = nivelesAdivina[dificultadAdivina];

    if (rondaAdivina >= nivel.rondas) {
      terminarJuegoAdivina();
    } else {
      rondaAdivina++;
      nuevaRondaAdivina();
    }
  });

  // 🌸 VENTANITA DE INFORMACIÓN
  const modalInfoPokemon = document.createElement("div");
  modalInfoPokemon.id = "modalInfoPokemon";
  modalInfoPokemon.hidden = true;

  modalInfoPokemon.innerHTML = `
    <div class="modal-info-contenido"
         role="dialog"
         aria-modal="true"
         aria-label="Detalles del Pokémon">

      <button type="button" id="cerrarInfoPokemon">✕</button>

      <div id="datosInfoPokemon"></div>
    </div>
  `;

  document.body.appendChild(modalInfoPokemon);

  const nombresStatsInfo = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque especial",
    "special-defense": "Defensa especial",
    speed: "Velocidad"
  };

  let consultaInfoActual = 0;

  function cerrarInfoPokemon() {
    consultaInfoActual++;
    modalInfoPokemon.hidden = true;
    document.body.style.overflow = "";
  }

  async function mostrarInfoPokemon(nombre) {
    const consulta = ++consultaInfoActual;
    const contenedor = document.getElementById("datosInfoPokemon");

    modalInfoPokemon.hidden = false;
    document.body.style.overflow = "hidden";
    contenedor.textContent = "Cargando información Pokémon... 💜";

    try {
      const pokemon = await obtenerPokemon(nombre);
      const especie = await obtenerDatos(
        `pokemon-species/${pokemon.species.name}`
      );

      if (consulta !== consultaInfoActual) return;

      const descripcion = especie.flavor_text_entries.find(
        entrada => entrada.language.name === "es"
      )?.flavor_text.replace(/[\n\f\r]+/g, " ") ||
        "No hay descripción disponible.";

      const nombreEsp = especie.names.find(
        entrada => entrada.language.name === "es"
      )?.name || nombreBonito(pokemon.name);

      const tiposHTML = pokemon.types.map(({ type }) => `
        <span class="pokemon-tipo ${type.name}">
          ${traducirTipo(type.name)}
        </span>
      `).join("");

      const habilidadesHTML = pokemon.abilities.map(
        ({ ability, is_hidden }) => `
          <span class="info-habilidad">
            ${textoSeguro(ability.name.replaceAll("-", " "))}
            ${is_hidden ? "✨ Oculta" : ""}
          </span>
        `
      ).join("");

      const statsHTML = pokemon.stats.map(
        ({ stat, base_stat }) => `
          <div class="info-stat-fila">
            <span>${nombresStatsInfo[stat.name] || stat.name}</span>

            <div class="info-stat-barra">
              <div style="width:${Math.min(base_stat / 255 * 100, 100)}%"></div>
            </div>

            <strong>${base_stat}</strong>
          </div>
        `
      ).join("");

      contenedor.innerHTML = `
        <p class="info-numero">
          #${String(pokemon.id).padStart(4, "0")}
        </p>

        <img class="info-imagen"
             src="${textoSeguro(imagenPokemon(pokemon))}"
             alt="${textoSeguro(nombreEsp)}">

        <h2 class="info-nombre">${textoSeguro(nombreEsp)}</h2>

        <div class="pokemon-tipos">${tiposHTML}</div>

        <p class="info-descripcion">
          ${textoSeguro(descripcion)}
        </p>

        <div class="info-datos">
          <div>
            <span>📏 Altura</span>
            <strong>${(pokemon.height / 10).toFixed(1)} m</strong>
          </div>

          <div>
            <span>⚖️ Peso</span>
            <strong>${(pokemon.weight / 10).toFixed(1)} kg</strong>
          </div>

          <div>
            <span>⭐ Experiencia base</span>
            <strong>${pokemon.base_experience ?? "No disponible"}</strong>
          </div>

          <div>
            <span>🌈 Tipos</span>
            <strong>
              ${pokemon.types.map(
                ({ type }) => traducirTipo(type.name)
              ).join(" / ")}
            </strong>
          </div>
        </div>

        <h3>✨ Habilidades</h3>
        <div class="info-habilidades">${habilidadesHTML}</div>

        <h3>📊 Estadísticas</h3>
        <div class="info-estadisticas">${statsHTML}</div>
      `;

    } catch (error) {
      if (consulta !== consultaInfoActual) return;

      console.error("Error al cargar información:", error);
      contenedor.textContent =
        "No se pudo cargar la información. 🌸";
    }
  }

  document.getElementById("cerrarInfoPokemon")
    ?.addEventListener("click", cerrarInfoPokemon);

  modalInfoPokemon.addEventListener("click", evento => {
    if (evento.target === modalInfoPokemon) {
      cerrarInfoPokemon();
    }
  });

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modalInfoPokemon.hidden) {
      cerrarInfoPokemon();
    }
  });

  // 💜 INICIAR POKÉDEX
  cargarNombresBusqueda();
  cargarPokemon();

  console.log("💜 Pokédex Deluxe iniciada correctamente.");

});
