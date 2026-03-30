import type { NextApiRequest, NextApiResponse } from "next";

const KNOWLEDGE: Array<{ keywords: string[]; answer: string }> = [
  // ── RESINA EPÓXICA ──────────────────────────────────────────────
  {
    keywords: ["resina epóxica", "resina epoxi", "epoxi", "epoxica", "resina"],
    answer: "La **resina epóxica** es un polímero de dos componentes: resina base + endurecedor. Al mezclarlos reaccionan y se solidifican formando una pieza dura, transparente y resistente. ✨\n\n**Usos principales:**\n- Joyería y bisutería (aretes, pulseras, dijes)\n- Lapiceros y accesorios decorativos\n- Recubrimientos de madera y mesas\n- Arte y manualidades en general\n\n**Proporciones típicas:** 1:1 o 2:1 (resina:endurecedor). Siempre sigue las instrucciones del fabricante. ¿Te gustaría saber más sobre algún uso específico?"
  },
  {
    keywords: ["mezclar resina", "como mezclar", "proporcion", "proporción", "ratio"],
    answer: "Para mezclar resina epóxica correctamente:\n\n1. **Mide con precisión** — usa vasos graduados o balanza digital\n2. **Mezcla despacio** — revuelve 3-5 minutos raspando las paredes del vaso\n3. **Evita burbujas** — mezcla lento y en círculos\n4. **Temperatura ideal** — entre 22°C y 28°C\n5. **Tiempo de trabajo** — tienes entre 20-40 min antes de que empiece a gelificar\n\n⚠️ Una mala proporción puede resultar en resina pegajosa que nunca cura. ¿Tienes alguna duda sobre el proceso?"
  },
  {
    keywords: ["burbujas", "burbuja", "como quitar burbujas"],
    answer: "Para eliminar burbujas de la resina:\n\n🔥 **Soplete o pistola de calor** — pasa rápidamente a 10 cm de distancia, las burbujas suben y explotan\n💨 **Soplido suave** — con una pajita, sopla suavemente sobre la superficie\n⏳ **Espera** — muchas burbujas suben solas en los primeros 15-20 minutos\n🌡️ **Calienta la resina** — una resina tibia tiene menos viscosidad y menos burbujas\n\nEvita agitar fuerte al mezclar, eso es la causa principal de burbujas. ¿Necesitas más consejos?"
  },
  {
    keywords: ["tiempo de curado", "curado", "secar", "secado", "curar", "desmoldar"],
    answer: "Los tiempos de curado de la resina epóxica:\n\n⏱️ **Desmolde inicial:** 12-24 horas (aún flexible)\n✅ **Curado funcional:** 24-48 horas (puedes manipular)\n💪 **Curado completo:** 7 días (máxima dureza y resistencia)\n\n**Factores que afectan el curado:**\n- Temperatura alta = cura más rápido\n- Temperatura baja = cura más lento o incompleto\n- Capas muy gruesas generan calor excesivo (efecto exotérmico)\n\n¿Tienes algún problema con el curado de tu pieza?"
  },
  {
    keywords: ["resina pegajosa", "no cura", "no seca", "blanda", "suave"],
    answer: "Si tu resina quedó pegajosa, las causas más comunes son:\n\n❌ **Mala proporción** — la causa #1, mide siempre con precisión\n❌ **Mezcla insuficiente** — debes mezclar mínimo 3-5 minutos\n❌ **Temperatura baja** — por debajo de 18°C la resina no cura bien\n❌ **Resina vencida** — verifica la fecha de vencimiento\n\n**Solución:** Si ya está en el molde, puedes intentar calentar el ambiente. Si está muy blanda, deberás retirarla y empezar de nuevo. ¿Cuál crees que fue el problema?"
  },

  // ── ECO RESINA ──────────────────────────────────────────────────
  {
    keywords: ["eco resina", "ecoresina", "resina ecologica", "ecológica", "bio resina"],
    answer: "La **eco resina** es una alternativa más amigable con el medio ambiente a la resina epóxica tradicional. 🌿\n\n**Características:**\n- Base en componentes naturales o reciclados\n- Menor emisión de VOCs (compuestos orgánicos volátiles)\n- Ideal para moldes de jabones, velas y decoración\n- Generalmente más flexible que la epóxica\n\n**Diferencias con la epóxica:**\n- Menos resistente al impacto\n- Más fácil de trabajar para principiantes\n- Perfecta para piezas decorativas, no estructurales\n\n¿Te interesa saber para qué proyectos es mejor la eco resina?"
  },
  {
    keywords: ["resina uv", "uv", "ultravioleta", "lampara uv"],
    answer: "La **resina UV** cura con luz ultravioleta en minutos, sin necesidad de mezclar dos componentes. ⚡\n\n**Ventajas:**\n- Cura en 1-5 minutos bajo lámpara UV\n- No necesita mezcla (viene lista)\n- Ideal para piezas pequeñas y detalles finos\n- Perfecta para joyería y reparaciones\n\n**Desventajas:**\n- No apta para piezas gruesas (la luz no penetra bien)\n- Más costosa por ml que la epóxica\n- Requiere lámpara UV o luz solar directa\n\n¿Quieres saber cómo usarla correctamente?"
  },

  // ── MOLDES DE SILICONA ──────────────────────────────────────────
  {
    keywords: ["molde", "moldes", "silicona", "molde de silicona"],
    answer: "Los **moldes de silicona** son perfectos para trabajar con resina porque:\n\n✅ La resina no se pega (desmolde fácil)\n✅ Flexibles — no se rompen al desmoldar\n✅ Reutilizables — duran cientos de usos\n✅ Capturan detalles muy finos\n✅ Resistentes al calor\n\n**Tipos de moldes disponibles:**\n- Geométricos (cubos, esferas, pirámides)\n- Joyería (aretes, anillos, colgantes)\n- Lapiceros y accesorios\n- Figuras (animales, flores, letras)\n- Bandejas y decoración del hogar\n\n¿Qué tipo de molde estás buscando?"
  },
  {
    keywords: ["cuidar molde", "limpiar molde", "duración molde", "vida util molde"],
    answer: "Para cuidar tus moldes de silicona y que duren más:\n\n🧼 **Limpieza:** Lava con agua tibia y jabón suave después de cada uso\n☀️ **Almacenamiento:** Guárdalos alejados del sol directo y el calor\n🚫 **Evita:** Objetos cortantes que puedan rayar la silicona\n✨ **Desmolde:** Espera el curado completo antes de desmoldar\n🧴 **Agente desmoldante:** No es necesario con resina, pero ayuda con otros materiales\n\nUn molde bien cuidado puede durar más de 50-100 usos. ¿Tienes algún problema con tus moldes?"
  },
  {
    keywords: ["hacer molde", "crear molde", "molde casero", "silicona para moldes"],
    answer: "Para hacer tus propios moldes de silicona necesitas:\n\n**Materiales:**\n- Silicona para moldeo (tipo RTV)\n- Catalizador (viene incluido)\n- El objeto que quieres replicar\n- Un contenedor para verter\n\n**Proceso básico:**\n1. Coloca el objeto en el contenedor\n2. Mezcla silicona + catalizador según instrucciones\n3. Vierte sobre el objeto\n4. Espera 12-24 horas\n5. Desmolda con cuidado\n\n¿Te gustaría más detalles sobre algún paso?"
  },

  // ── PIGMENTOS Y COLORANTES ──────────────────────────────────────
  {
    keywords: ["pigmento", "pigmentos", "colorante", "color", "mica", "tinte"],
    answer: "Para colorear resina puedes usar:\n\n🌈 **Pigmentos en polvo (micas):** Dan efecto metálico y perlado, muy poco va lejos\n💧 **Colorantes líquidos:** Colores vivos y transparentes, ideales para efectos de vidrio\n🎨 **Pigmentos en pasta:** Fáciles de mezclar, colores opacos y sólidos\n✨ **Glitter y purpurina:** Para efectos brillantes y festivos\n🌟 **Pigmentos fluorescentes:** Brillan bajo luz UV\n\n**Consejo:** Usa máximo 5-6% de pigmento respecto al peso de la resina para no afectar el curado. ¿Qué efecto quieres lograr?"
  },
  {
    keywords: ["efecto marmol", "mármol", "marble", "veteado"],
    answer: "Para lograr el **efecto mármol** en resina:\n\n1. Prepara tu resina base (transparente o blanca)\n2. Divide en 2-3 porciones y colorea cada una diferente\n3. Vierte las porciones en el molde sin mezclar completamente\n4. Con un palillo o mondadientes, haz movimientos suaves en espiral\n5. No mezcles demasiado o perderás el efecto\n\n🎨 **Colores clásicos:** Blanco + gris + negro\n🌊 **Efecto océano:** Azul + turquesa + blanco\n🌸 **Efecto floral:** Rosa + blanco + dorado\n\n¿Quieres saber más sobre otros efectos decorativos?"
  },

  // ── ARTESANÍA Y PROYECTOS ───────────────────────────────────────
  {
    keywords: ["lapicero", "lapiceros", "bolígrafo", "boligrafo", "pen"],
    answer: "Los **lapiceros de resina** son uno de los proyectos más populares y rentables. 🖊️\n\n**Tipos de lapiceros:**\n- Shaker (con elementos flotantes dentro)\n- Sólidos con flores o figuras preservadas\n- Con efecto galaxia o mármol\n- Con glitter y pigmentos metálicos\n\n**Materiales necesarios:**\n- Molde de lapicero de silicona\n- Resina epóxica o UV\n- Pigmentos y decoraciones\n- Mecanismo de bolígrafo (refill)\n\n¿Te gustaría saber cómo hacer un lapicero shaker paso a paso?"
  },
  {
    keywords: ["joyeria", "joyería", "aretes", "pulsera", "collar", "anillo", "dije", "bisuteria", "bisutería"],
    answer: "La **joyería de resina** es perfecta para principiantes y profesionales. 💎\n\n**Proyectos populares:**\n- Aretes geométricos (cuadrados, triángulos, círculos)\n- Pulseras con flores preservadas\n- Collares con figuras en 3D\n- Anillos con efecto galaxia\n- Dijes personalizados\n\n**Consejos para joyería:**\n✅ Usa resina de alta claridad (crystal clear)\n✅ Desmolda con cuidado para no rayar\n✅ Lija y pule para acabado profesional\n✅ Aplica barniz UV para proteger el color\n\n¿Qué tipo de joyería quieres hacer?"
  },
  {
    keywords: ["flores", "flores preservadas", "botanico", "botánico", "plantas", "hojas"],
    answer: "Incluir **flores y elementos botánicos** en resina es hermoso pero requiere cuidado:\n\n🌸 **Flores secas:** Las mejores, no tienen humedad que afecte la resina\n🌿 **Proceso de secado:** Prensa las flores 2-4 semanas entre papel absorbente\n⚠️ **Flores frescas:** NUNCA uses flores frescas, la humedad arruina la resina\n\n**Técnica de capas:**\n1. Vierte una capa base, deja curar 12h\n2. Coloca las flores sobre la capa curada\n3. Vierte resina encima con cuidado\n4. Deja curar completamente\n\n¿Quieres saber qué flores funcionan mejor?"
  },
  {
    keywords: ["vela", "velas", "portavela", "candle"],
    answer: "Los **portavelas de resina** son proyectos muy decorativos y vendibles. 🕯️\n\n**Tipos:**\n- Portavelas geométricos (hexagonales, cúbicos)\n- Con flores y elementos naturales\n- Con efecto ámbar o cristal\n- Personalizados con nombres o fechas\n\n**Importante:**\n⚠️ La resina epóxica NO es apta para hacer velas directamente (se derrite con el calor)\n✅ Úsala solo para el contenedor/portavela\n✅ Para velas usa cera de soja o parafina\n\n¿Te interesa aprender a hacer portavelas?"
  },
  {
    keywords: ["mesa", "mesa de resina", "river table", "tabla", "madera y resina"],
    answer: "Las **mesas de resina** (River Tables) son proyectos premium muy cotizados. 🪵\n\n**Proceso básico:**\n1. Prepara la madera (seca y limpia)\n2. Sella la madera con resina diluida primero\n3. Construye un molde alrededor\n4. Vierte la resina en capas (máx 1cm por capa)\n5. Espera 24-48h entre capas\n6. Lija progresivamente (80→120→220→400→800)\n7. Aplica acabado final\n\n**Resina recomendada:** Epóxica de baja viscosidad y alta claridad\n\n¿Tienes alguna pregunta sobre este proyecto?"
  },

  // ── SEGURIDAD ───────────────────────────────────────────────────
  {
    keywords: ["seguridad", "peligro", "tóxico", "toxico", "guantes", "proteccion", "protección"],
    answer: "La **seguridad** al trabajar con resina es muy importante. 🛡️\n\n**Equipo de protección básico:**\n🧤 Guantes de nitrilo (no látex)\n😷 Mascarilla con filtro para vapores orgánicos\n👓 Gafas de protección\n🌬️ Ventilación adecuada del espacio\n\n**Precauciones:**\n- Evita el contacto directo con la piel\n- No inhales los vapores directamente\n- Mantén alejado de niños y mascotas durante el proceso\n- La resina curada es completamente segura\n\n¿Tienes alguna duda sobre seguridad específica?"
  },

  // ── PRECIOS Y TIENDA ────────────────────────────────────────────
  {
    keywords: ["precio", "precios", "costo", "cuanto cuesta", "cuánto cuesta", "valor"],
    answer: "En **Rossy Resina** tenemos productos para todos los presupuestos. 💰\n\nPuedes ver todos nuestros precios actualizados en la tienda. Ofrecemos:\n\n🛍️ **Resinas epóxicas** — desde kits básicos hasta profesionales\n🎨 **Pigmentos y micas** — sets completos o individuales\n🔲 **Moldes de silicona** — gran variedad de diseños\n📦 **Kits completos** — todo lo que necesitas para empezar\n\n¿Quieres que te ayude a encontrar algún producto específico en nuestra tienda?"
  },
  {
    keywords: ["envio", "envío", "despacho", "delivery", "shipping", "llega", "demora"],
    answer: "Sobre nuestros **envíos** 🚚\n\n📦 Enviamos a **todo el Perú**\n🏢 Trabajamos con **Shalom** y **Olva Courier**\n🎁 **Envío gratis** en pedidos desde S/ 120\n⏱️ **Tiempo de entrega:** 2-5 días hábiles según tu ciudad\n\n**Para hacer tu pedido:**\n1. Agrega productos al carrito\n2. Ve a Checkout\n3. Completa tus datos de envío\n4. Confirma tu pago por Yape o transferencia\n\n¿Tienes alguna pregunta sobre el proceso de compra?"
  },
  {
    keywords: ["pago", "yape", "transferencia", "como pagar", "cómo pagar", "metodo de pago", "método de pago"],
    answer: "Aceptamos los siguientes **métodos de pago** 💳\n\n📱 **Yape** — el más rápido y fácil\n🏦 **Transferencia bancaria** — para montos mayores\n\n**Proceso:**\n1. Realiza tu pedido en el Checkout\n2. Recibirás los datos de pago\n3. Envía tu comprobante\n4. Confirmamos y preparamos tu pedido\n\n¿Tienes alguna duda sobre el proceso de pago?"
  },
  {
    keywords: ["principiante", "empezar", "comenzar", "inicio", "novato", "primera vez"],
    answer: "¡Bienvenida al mundo de la resina! 🎉 Para **empezar desde cero** te recomiendo:\n\n**Kit básico para principiantes:**\n1. 🧪 Resina epóxica 1:1 (la más fácil de usar)\n2. 🔲 2-3 moldes de silicona simples\n3. 🎨 Set de pigmentos básicos (5-6 colores)\n4. 🧤 Guantes de nitrilo\n5. 🥄 Palitos mezcladores y vasos\n\n**Proyectos recomendados para empezar:**\n- Aretes geométricos simples\n- Llaveros\n- Imanes decorativos\n\n¿Te gustaría ver nuestros kits para principiantes en la tienda?"
  },
  {
    keywords: ["capacitacion", "capacitación", "curso", "taller", "aprender", "clases"],
    answer: "En **Rossy Resina** ofrecemos **capacitaciones y talleres** 🎓\n\nAprende directamente con nosotros:\n- Técnicas básicas y avanzadas de resina\n- Creación de joyería profesional\n- Proyectos decorativos para el hogar\n- Cómo emprender con resina\n\n📚 Visita nuestra sección de **Capacitaciones** en el menú para ver los cursos disponibles, fechas y precios.\n\n¿Te interesa algún tema en particular?"
  },

  // ── PROBLEMAS COMUNES ───────────────────────────────────────────
  {
    keywords: ["amarilla", "amarillo", "amarillamiento", "se pone amarilla", "amarillea"],
    answer: "El **amarillamiento** de la resina es un problema común. Causas y soluciones:\n\n**Causas:**\n☀️ Exposición prolongada a luz UV solar\n🌡️ Calor excesivo durante el curado\n🧪 Resina de baja calidad\n\n**Cómo prevenirlo:**\n✅ Usa resina con protección UV\n✅ Guarda tus piezas alejadas del sol directo\n✅ Aplica barniz UV protector sobre la pieza terminada\n✅ Invierte en resina de buena calidad\n\n¿Tu pieza ya amarilló o quieres prevenirlo?"
  },
  {
    keywords: ["inclusion", "inclusión", "poner dentro", "encapsular", "preservar"],
    answer: "Puedes **encapsular** muchas cosas en resina. 🌟\n\n**Elementos populares:**\n🌸 Flores y plantas secas\n🦋 Insectos (previamente secos)\n📸 Fotografías (impresas en papel fotográfico)\n✨ Glitter y purpurina\n🐚 Conchas y elementos marinos\n💎 Piedras y cristales\n🍂 Hojas secas\n\n**Importante:**\n⚠️ Todo debe estar completamente SECO\n⚠️ Las fotos deben sellarse antes con resina o barniz\n⚠️ Los elementos orgánicos frescos pueden pudrirse\n\n¿Qué quieres encapsular?"
  },
];

const GREETINGS = ["hola", "buenos días", "buenas tardes", "buenas noches", "buenas", "hey", "hi", "saludos"];
const FAREWELLS = ["gracias", "adios", "adiós", "hasta luego", "bye", "chau", "ok gracias", "muchas gracias"];

function findAnswer(message: string): string {
  const msg = message.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (GREETINGS.some((g) => msg.includes(g.normalize("NFD").replace(/\p{Diacritic}/gu, "")))) {
    return "¡Hola! 👋 Soy **Asistente Rossy**, tu guía experta en resina y artesanía. Puedo ayudarte con:\n\n🧪 Resina epóxica y eco resina\n🔲 Moldes de silicona\n🎨 Pigmentos y colorantes\n💎 Joyería y proyectos\n🛍️ Productos y envíos\n\n¿Sobre qué tema tienes dudas?";
  }

  if (FAREWELLS.some((f) => msg.includes(f.normalize("NFD").replace(/\p{Diacritic}/gu, "")))) {
    return "¡Con gusto! 😊 Si tienes más preguntas sobre resina o artesanía, aquí estaré. ¡Mucho éxito con tus creaciones! ✨";
  }

  // Buscar por keywords
  let bestMatch: { score: number; answer: string } = { score: 0, answer: "" };

  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwNorm = kw.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (msg.includes(kwNorm)) score += kwNorm.split(" ").length;
    }
    if (score > bestMatch.score) bestMatch = { score, answer: item.answer };
  }

  if (bestMatch.score > 0) return bestMatch.answer;

  return "Hmm, no estoy segura sobre eso. 🤔 Puedo ayudarte con temas como:\n\n• Resina epóxica y eco resina\n• Moldes de silicona\n• Pigmentos y colorantes\n• Joyería y proyectos artesanales\n• Envíos y pagos\n\n¿Puedes reformular tu pregunta o elegir un tema?";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  const answer = findAnswer(message);
  return res.status(200).json({ answer });
}
