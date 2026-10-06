/*
 * PLOTO concept scenes
 * --------------------------------------------------------------------------
 * Hand-drawn SVG elevations for each space. They are the base layer of every
 * media frame: when a Seedance 2.0 still (assets/media/<id>.jpg) or clip
 * (assets/media/<id>.mp4) exists it fades in on top of the drawing.
 *
 * Each <g data-depth="n"> moves sideways by n pixels across the scroll range
 * of its panel, which gives the flat drawing a parallax feel.
 */
(function () {
  "use strict";

  const svg = (bg, body) =>
    `<svg class="scene" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="450" fill="${bg}"/>${body}</svg>`;

  // Repeating vertical bottles for the nail studio shelf
  const bottles = (x0, y, colors) =>
    colors
      .map((c, i) => {
        const x = x0 + i * 22;
        return `<rect x="${x}" y="${y}" width="14" height="22" rx="3" fill="${c}"/>
                <rect x="${x + 4}" y="${y - 9}" width="6" height="10" rx="1" fill="#3b2f2f"/>`;
      })
      .join("");

  // Terrazzo speckles inside a rect area (deterministic so it never flickers)
  const speckles = (x, y, w, h, n, colors) => {
    let out = "";
    for (let i = 0; i < n; i++) {
      const px = x + ((i * 73) % w);
      const py = y + ((i * 37) % h);
      const r = 1.4 + (i % 3) * 0.8;
      out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${colors[i % colors.length]}"/>`;
    }
    return out;
  };

  const scenes = {
    /* ---------------------------------------------------------------- CAFE */
    cafe: svg(
      "#EADFCF",
      `
      <defs>
        <linearGradient id="cafe-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFF7E6" stop-opacity=".85"/>
          <stop offset="1" stop-color="#FFF7E6" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g data-depth="-14">
        <rect x="470" y="50" width="260" height="250" fill="#FBF4E8"/>
        <path d="M470 50h260v250H470zM600 50v250M470 175h260" fill="none" stroke="#B89A7A" stroke-width="6"/>
        <rect x="70" y="120" width="250" height="8" fill="#B48A62"/>
        <rect x="90" y="88" width="24" height="32" rx="4" fill="#D8C3A5"/>
        <rect x="126" y="96" width="22" height="24" rx="4" fill="#8A5A3B"/>
        <rect x="160" y="84" width="26" height="36" rx="5" fill="#E9E1D2"/>
        <circle cx="260" cy="104" r="16" fill="#7E8C6A"/>
        <rect x="252" y="104" width="16" height="16" fill="#C9A27E"/>
      </g>
      <polygon class="glow" points="480,300 730,300 800,450 520,450" fill="url(#cafe-beam)"/>
      <rect y="340" width="800" height="110" fill="#D9C8B1"/>
      <g data-depth="10">
        <line x1="260" y1="0" x2="260" y2="150" stroke="#3A3330" stroke-width="2"/>
        <path d="M232 170a28 22 0 0 1 56 0z" fill="#3A3330"/>
        <circle class="glow" cx="260" cy="176" r="10" fill="#FFE3B0"/>
        <rect x="60" y="250" width="380" height="16" fill="#E8E1D6"/>
        <rect x="70" y="266" width="360" height="90" fill="#B48A62"/>
        <path d="M110 266v90M170 266v90M230 266v90M290 266v90M350 266v90" stroke="#A47A54" stroke-width="2"/>
        <rect x="140" y="196" width="100" height="54" rx="4" fill="#3A3330"/>
        <rect x="152" y="208" width="76" height="10" rx="2" fill="#8F8780"/>
        <rect x="170" y="232" width="14" height="14" rx="2" fill="#E8E1D6"/>
        <rect x="200" y="232" width="14" height="14" rx="2" fill="#E8E1D6"/>
        <g class="steam" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round">
          <path d="M177 228c-6-10 6-14 0-24"/>
          <path d="M207 228c-6-10 6-14 0-24"/>
          <path d="M192 196c-6-10 6-14 0-24"/>
        </g>
        <path d="M300 236h22v14h-22z" fill="#FFFFFF"/>
        <path d="M322 240h6a4 4 0 0 1 0 8h-6" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M350 238h20v12h-20z" fill="#E9E1D2"/>
      </g>
      <g data-depth="26">
        <rect x="610" y="330" width="44" height="40" rx="4" fill="#C9A27E"/>
        <path d="M632 330c-30-40-10-70 0-90c10 20 30 50 0 90z" fill="#6F7F5C"/>
        <path d="M632 330c-50-20-40-50-30-70c6 30 20 46 30 70z" fill="#82936E"/>
        <rect x="520" y="300" width="70" height="8" rx="4" fill="#8A5A3B"/>
        <rect x="552" y="308" width="6" height="62" fill="#8A5A3B"/>
        <circle cx="555" cy="380" r="22" fill="#E8E1D6"/>
      </g>`
    ),

    /* --------------------------------------------------------------- SALON */
    salon: svg(
      "#E3E6DA",
      `
      <defs>
        <linearGradient id="salon-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#CFD8CB"/>
        </linearGradient>
      </defs>
      <rect y="350" width="800" height="100" fill="#CDD3C2"/>
      <g data-depth="-12">
        ${[110, 330, 550]
          .map(
            (x) => `
          <path class="glow" d="M${x - 8} 300V120a78 78 0 0 1 156 0v180z" fill="#FFF6DD"/>
          <path d="M${x} 300V124a70 70 0 0 1 140 0v176z" fill="url(#salon-mirror)" stroke="#B8935A" stroke-width="3"/>
          <path d="M${x + 30} 150l40-40M${x + 30} 190l70-70" stroke="#FFFFFF" stroke-width="4" opacity=".7"/>`
          )
          .join("")}
        <rect x="80" y="300" width="640" height="14" fill="#B8935A"/>
      </g>
      <g data-depth="12">
        ${[180, 400, 620]
          .map(
            (x) => `
          <rect x="${x - 46}" y="282" width="92" height="74" rx="30" fill="#5F7358"/>
          <rect x="${x - 56}" y="336" width="112" height="30" rx="14" fill="#7F9478"/>
          <rect x="${x - 4}" y="366" width="8" height="34" fill="#B8935A"/>
          <ellipse cx="${x}" cy="404" rx="34" ry="6" fill="#B8935A"/>`
          )
          .join("")}
      </g>
      <g data-depth="28">
        <rect x="726" y="352" width="50" height="50" rx="6" fill="#EDE8DD"/>
        <path d="M751 352V250" stroke="#6B5B47" stroke-width="4"/>
        <g fill="#7C8F6A">
          <ellipse cx="740" cy="250" rx="34" ry="22"/>
          <ellipse cx="770" cy="226" rx="28" ry="18"/>
          <ellipse cx="736" cy="214" rx="24" ry="16"/>
          <ellipse cx="764" cy="280" rx="22" ry="14"/>
        </g>
        <rect x="20" y="320" width="48" height="80" rx="4" fill="#EDE8DD"/>
        <rect x="26" y="300" width="10" height="20" rx="2" fill="#B8935A"/>
        <rect x="42" y="296" width="10" height="24" rx="2" fill="#5F7358"/>
      </g>`
    ),

    /* ---------------------------------------------------------------- NAIL */
    nail: svg(
      "#F4E3DE",
      `
      <rect y="350" width="800" height="100" fill="#E8CFC8"/>
      <g data-depth="-14">
        <path d="M250 350V170a150 150 0 0 1 300 0v180z" fill="#FBEFEA"/>
        <rect x="290" y="170" width="220" height="6" rx="3" fill="#E2B9B2"/>
        <rect x="290" y="230" width="220" height="6" rx="3" fill="#E2B9B2"/>
        <rect x="290" y="290" width="220" height="6" rx="3" fill="#E2B9B2"/>
        ${bottles(298, 148, ["#E9BFC0", "#B9727A", "#F6D7C3", "#D98C8C", "#FFFFFF", "#C9A0B4", "#F2C6B4", "#B9727A", "#E9BFC0", "#EFD9D2"])}
        ${bottles(298, 208, ["#F6D7C3", "#C9A0B4", "#E9BFC0", "#FFFFFF", "#B9727A", "#D98C8C", "#EFD9D2", "#F2C6B4", "#C9A0B4", "#E9BFC0"])}
        ${bottles(298, 268, ["#B9727A", "#EFD9D2", "#F2C6B4", "#E9BFC0", "#C9A0B4", "#FFFFFF", "#D98C8C", "#F6D7C3", "#E9BFC0", "#B9727A"])}
      </g>
      <g data-depth="-6">
        <path class="sway" d="M40 0h120v330c-20 8-40 8-60 0s-40-8-60 0z" fill="#FFFFFF" opacity=".7"/>
        <path class="sway" d="M640 0h120v330c-20 8-40 8-60 0s-40-8-60 0z" fill="#FFFFFF" opacity=".7"/>
      </g>
      <g data-depth="16">
        <rect x="180" y="300" width="440" height="30" rx="15" fill="#EBC3C0"/>
        ${speckles(196, 306, 408, 18, 46, ["#FFFFFF", "#B9727A", "#D9A3A0", "#F7E2DC"])}
        <path d="M230 330c0 40 20 60 40 60M570 330c0 40-20 60-40 60" stroke="#D9A3A0" stroke-width="10" fill="none"/>
        <rect x="380" y="280" width="40" height="20" rx="4" fill="#FFF8F2"/>
        <circle class="glow" cx="400" cy="278" r="5" fill="#FFFFFF"/>
      </g>
      <g data-depth="30">
        <rect x="200" y="370" width="110" height="46" rx="23" fill="#F6D7C3"/>
        <rect x="490" y="370" width="110" height="46" rx="23" fill="#F6D7C3"/>
      </g>`
    ),

    /* -------------------------------------------------------------- OFFICE */
    office: svg(
      "#E6E8EA",
      `
      <rect width="800" height="40" fill="#CFD3D6"/>
      <g data-depth="-18">
        <rect x="60" y="70" width="680" height="250" fill="#DCE6EC"/>
        <g fill="#B9C6CF">
          <rect x="80" y="200" width="60" height="120"/><rect x="150" y="160" width="46" height="160"/>
          <rect x="210" y="220" width="70" height="100"/><rect x="300" y="140" width="54" height="180"/>
          <rect x="370" y="190" width="80" height="130"/><rect x="470" y="120" width="50" height="200"/>
          <rect x="540" y="210" width="66" height="110"/><rect x="620" y="170" width="56" height="150"/>
          <rect x="690" y="230" width="40" height="90"/>
        </g>
        <path d="M60 70h680v250H60zM230 70v250M400 70v250M570 70v250" fill="none" stroke="#3E5560" stroke-width="5"/>
      </g>
      <rect y="320" width="800" height="130" fill="#C9CCCE"/>
      <g data-depth="8">
        ${[200, 400, 600]
          .map(
            (x) => `
          <line x1="${x}" y1="40" x2="${x}" y2="96" stroke="#3E5560" stroke-width="2"/>
          <rect x="${x - 60}" y="96" width="120" height="6" rx="3" fill="#3E5560"/>
          <rect class="glow" x="${x - 56}" y="102" width="112" height="3" fill="#FFF3D1"/>`
          )
          .join("")}
      </g>
      <g data-depth="16">
        <rect x="110" y="300" width="580" height="14" fill="#D8BF9A"/>
        <rect x="130" y="314" width="8" height="70" fill="#3E5560"/>
        <rect x="662" y="314" width="8" height="70" fill="#3E5560"/>
        <rect x="200" y="270" width="54" height="30" rx="2" fill="#2E3A40"/>
        <rect x="196" y="298" width="62" height="4" fill="#9AA3A8"/>
        <rect x="430" y="270" width="54" height="30" rx="2" fill="#2E3A40"/>
        <rect x="426" y="298" width="62" height="4" fill="#9AA3A8"/>
        <rect x="320" y="284" width="16" height="16" rx="3" fill="#FFFFFF"/>
        <rect x="570" y="282" width="30" height="18" rx="2" fill="#F4F1EA"/>
        ${[180, 320, 460, 600]
          .map(
            (x) => `
          <rect x="${x - 26}" y="334" width="52" height="12" rx="6" fill="#F4F1EA"/>
          <rect x="${x - 22}" y="294" width="44" height="40" rx="10" fill="#F4F1EA" opacity=".9"/>
          <path d="M${x - 18} 346l-6 50M${x + 18} 346l6 50" stroke="#D8BF9A" stroke-width="4"/>`
          )
          .join("")}
      </g>
      <g data-depth="30">
        <rect x="24" y="360" width="56" height="54" rx="6" fill="#F4F1EA"/>
        <g fill="#4F7A55">
          <path d="M52 360c-40-30-30-90 0-120c30 30 40 90 0 120z"/>
          <path d="M52 360c-60-10-60-60-50-80c20 20 40 50 50 80z" opacity=".85"/>
          <path d="M52 360c60-10 60-60 50-80c-20 20-40 50-50 80z" opacity=".85"/>
        </g>
        <rect x="720" y="370" width="50" height="44" rx="6" fill="#F4F1EA"/>
        <circle cx="745" cy="340" r="34" fill="#5E8B63"/>
      </g>`
    ),

    /* ---------------------------------------------------------- RESTAURANT */
    restaurant: svg(
      "#5A2A20",
      `
      <defs>
        <radialGradient id="rest-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#FFD59A" stop-opacity=".9"/>
          <stop offset="1" stop-color="#FFD59A" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="rest-kitchen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#F2A65A"/>
          <stop offset="1" stop-color="#C8693E"/>
        </linearGradient>
      </defs>
      <g data-depth="-16">
        <path d="M290 330V160a110 110 0 0 1 220 0v170z" fill="url(#rest-kitchen)" class="glow"/>
        <rect x="320" y="230" width="160" height="10" fill="#2B201C"/>
        <rect x="340" y="200" width="20" height="30" rx="3" fill="#2B201C"/>
        <rect x="380" y="210" width="34" height="20" rx="3" fill="#2B201C"/>
        <rect x="430" y="196" width="18" height="34" rx="3" fill="#2B201C"/>
        <rect x="300" y="290" width="200" height="40" fill="#3A2A24"/>
      </g>
      <rect y="330" width="800" height="120" fill="#2B201C"/>
      <g data-depth="8">
        ${[130, 400, 670]
          .map(
            (x) => `
          <circle cx="${x}" cy="200" r="90" fill="url(#rest-glow)" class="glow"/>
          <line x1="${x}" y1="0" x2="${x}" y2="170" stroke="#1A1311" stroke-width="2"/>
          <path d="M${x - 26} 194a26 26 0 0 1 52 0z" fill="#C8693E"/>
          <ellipse cx="${x}" cy="196" rx="12" ry="4" fill="#FFE2B0"/>`
          )
          .join("")}
      </g>
      <g data-depth="20">
        ${[150, 650]
          .map(
            (x) => `
          <rect x="${x - 100}" y="300" width="200" height="14" fill="#F4ECE0"/>
          <path d="M${x - 100} 314h200l-10 30H${x - 90}z" fill="#E9DED0"/>
          <rect x="${x - 84}" y="344" width="8" height="60" fill="#3B2A22"/>
          <rect x="${x + 76}" y="344" width="8" height="60" fill="#3B2A22"/>
          <path d="M${x - 50} 284h12l-2 16h-8zM${x + 40} 284h12l-2 16h-8z" fill="#FFFFFF" opacity=".75"/>
          <rect x="${x - 6}" y="282" width="12" height="18" rx="2" fill="#F4ECE0"/>
          <path class="flicker" d="M${x} 266c6 8 4 14 0 16c-4-2-6-8 0-16z" fill="#FFC86B"/>
          <circle cx="${x}" cy="278" r="20" fill="url(#rest-glow)"/>`
          )
          .join("")}
      </g>
      <g data-depth="34">
        <rect x="360" y="360" width="80" height="60" rx="10" fill="#3B2A22"/>
        <rect x="350" y="350" width="100" height="14" rx="7" fill="#4A352C"/>
      </g>`
    ),
  };

  window.PLOTO_SCENES = scenes;
})();
