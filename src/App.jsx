import { useState, useEffect } from "react";

const STORAGE_KEY = "recetario_v1";
const AUTH_KEY = "recetario_auth";
const USUARIO = "thalia";
const PASSWORD = "7332thalia";
const CATEGORIAS = ["Desayuno", "Entrante", "Principal", "Postre", "Snack", "Bebida", "Monsieur Cuisine", "Otro"];

const T = {
  bg: "#faf7f0",
  surface: "#fff",
  card: "#f3ede0",
  olive: "#4a5c2f",
  oliveLight: "#e8f0d8",
  oliveMid: "#3a4a22",
  gold: "#c9a96e",
  goldLight: "#f5ead0",
  goldDark: "#7a5c20",
  text: "#2d2416",
  muted: "#5a5240",
  border: "#e0d8c8",
  ff: { title: "Georgia, 'Times New Roman', serif", body: "system-ui, -apple-system, sans-serif" },
};

const s = {
  app: { fontFamily: T.ff.body, maxWidth: 600, margin: "0 auto", padding: 16, minHeight: "100vh", background: T.bg, color: T.text },
  header: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  h1: { fontFamily: T.ff.title, fontSize: 24, fontWeight: 700, color: T.olive, margin: 0, letterSpacing: "-.3px" },
  btn: { background: T.olive, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: T.ff.body },
  btnSec: { background: "transparent", color: T.olive, border: `1px solid ${T.olive}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 14, fontFamily: T.ff.body },
  btnGhost: { background: "transparent", color: T.muted, border: "none", cursor: "pointer", fontSize: 13, padding: "4px 8px", fontFamily: T.ff.body },
  card: { background: T.surface, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px #0001", cursor: "pointer", borderLeft: `4px solid ${T.olive}` },
  tagOlive: { background: T.oliveLight, color: T.oliveMid, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  tagGold: { background: T.goldLight, color: T.goldDark, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  input: { width: "100%", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 14, boxSizing: "border-box", background: "#fdfaf4", fontFamily: T.ff.body, color: T.text },
  label: { fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 4, display: "block", fontFamily: T.ff.body },
  section: { marginBottom: 20 },
  counter: { display: "flex", alignItems: "center", gap: 10 },
  counterBtn: { width: 32, height: 32, borderRadius: "50%", border: `1px solid ${T.olive}`, background: "transparent", color: T.olive, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  paso: { background: T.surface, borderRadius: 12, padding: 28, textAlign: "center", border: `1px solid ${T.border}`, minHeight: 140, display: "flex", flexDirection: "column", justifyContent: "center" },
  divider: { borderBottom: `1px solid ${T.border}`, margin: "0 0 12px" },
};

const emptyReceta = () => ({ id: Date.now(), nombre: "", categoria: "Principal", tiempo: "", porciones_base: 2, ingredientes: [{ nombre: "", cantidad: "", unidad: "" }], pasos: [""], notas: "" });

function scale(val, base, cur) {
  const n = parseFloat(val);
  const b = parseFloat(base);
  if (isNaN(n) || isNaN(b) || b === 0) return val;
  const r = (n * cur) / b;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(/\.0$/, "");
}

export default function App() {
  const [auth, setAuth] = useState(() => localStorage.getItem(AUTH_KEY) === "1");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "", error: false });

  const login = () => {
    if (loginForm.user === USUARIO && loginForm.pass === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setAuth(true);
    } else {
      setLoginForm(f => ({ ...f, error: true }));
    }
  };

  if (!auth) return (
    <div style={{ ...s.app, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 48 }}>🌿</span>
        <h1 style={{ ...s.h1, fontSize: 28, marginTop: 8 }}>Mi Recetario</h1>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${T.border}` }}>
        <div style={s.section}>
          <label style={s.label}>Usuario</label>
          <input style={s.input} value={loginForm.user} onChange={e => setLoginForm(f => ({ ...f, user: e.target.value, error: false }))} placeholder="Usuario" autoCapitalize="none" />
        </div>
        <div style={s.section}>
          <label style={s.label}>Contraseña</label>
          <input style={s.input} type="password" value={loginForm.pass} onChange={e => setLoginForm(f => ({ ...f, pass: e.target.value, error: false }))} placeholder="Contraseña" onKeyDown={e => e.key === "Enter" && login()} />
        </div>
        {loginForm.error && <p style={{ color: "#b04040", fontSize: 13, margin: "-8px 0 12px", textAlign: "center" }}>Usuario o contraseña incorrectos.</p>}
        <button style={{ ...s.btn, width: "100%", padding: 14, fontSize: 16 }} onClick={login}>Entrar</button>
      </div>
    </div>
  );

  const logout = () => { localStorage.removeItem(AUTH_KEY); setAuth(false); };
  const [vista, setVista] = useState("lista");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [porciones, setPorciones] = useState(2);
  const [busqueda, setBusqueda] = useState("");
  const [filtrocat, setFiltrocat] = useState("Todas");
  const [parsando, setParsando] = useState(false);
  const [textoReceta, setTextoReceta] = useState("");
  const [vistaImport, setVistaImport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    try { const d = localStorage.getItem(STORAGE_KEY); if (d) setRecetas(JSON.parse(d)); } catch {}
  }, []);

  const saveR = (rs) => { setRecetas(rs); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rs)); } catch {} };
  const abrirDetalle = (r) => { setSelected(r); setPorciones(r.porciones_base); setVista("detalle"); };
  const abrirCocinar = () => { setPasoActual(0); setVista("cocinar"); };
  const abrirForm = (r = null) => { setForm(r ? { ...r, ingredientes: r.ingredientes.map(i => ({ ...i })), pasos: [...r.pasos] } : emptyReceta()); setVistaImport(false); setVista("form"); };

  const guardarForm = () => {
    if (!form.nombre.trim()) return alert("Ponle un nombre a la receta.");
    const upd = form.id && recetas.find(r => r.id === form.id) ? recetas.map(r => r.id === form.id ? form : r) : [...recetas, { ...form, id: Date.now() }];
    saveR(upd); setSelected(form); setPorciones(form.porciones_base); setVista("detalle");
  };
  const eliminar = (id) => setConfirmDelete(id);
  const confirmarEliminar = () => { saveR(recetas.filter(r => r.id !== confirmDelete)); setConfirmDelete(null); setSelected(null); setVista("lista"); };
  const updIng = (i, k, v) => { const a = [...form.ingredientes]; a[i] = { ...a[i], [k]: v }; setForm({ ...form, ingredientes: a }); };
  const addIng = () => setForm({ ...form, ingredientes: [...form.ingredientes, { nombre: "", cantidad: "", unidad: "" }] });
  const removeIng = (i) => setForm({ ...form, ingredientes: form.ingredientes.filter((_, x) => x !== i) });
  const updPaso = (i, v) => { const p = [...form.pasos]; p[i] = v; setForm({ ...form, pasos: p }); };
  const addPaso = () => setForm({ ...form, pasos: [...form.pasos, ""] });
  const removePaso = (i) => setForm({ ...form, pasos: form.pasos.filter((_, x) => x !== i) });

  const parsarReceta = async () => {
    if (!textoReceta.trim()) return;
    setParsando(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Extrae la información de esta receta y devuelve SOLO un JSON válido, sin texto adicional ni backticks, con esta estructura exacta:\n{"nombre":"string","categoria":"uno de: Desayuno, Entrante, Principal, Postre, Snack, Bebida, Otro","tiempo":"número en minutos o cadena vacía","porciones_base":número,"ingredientes":[{"nombre":"string","cantidad":"string numérica","unidad":"string"}],"pasos":["string"],"notas":"string"}\n\nReceta:\n${textoReceta}` }]
        })
      });
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("");
      const parsed = JSON.parse(text.trim());
      setForm({ ...emptyReceta(), ...parsed, id: Date.now() });
      setVistaImport(false); setVista("form");
    } catch { alert("No se pudo interpretar la receta. Prueba con un texto más completo."); }
    finally { setParsando(false); }
  };

  const filtradas = recetas.filter(r => (filtrocat === "Todas" || r.categoria === filtrocat) && r.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  // CONFIRMACIÓN BORRAR
  if (confirmDelete) return (
    <div style={s.app}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, textAlign: "center", marginTop: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
        <h3 style={{ fontFamily: T.ff.title, margin: "0 0 8px", color: T.text }}>¿Eliminar receta?</h3>
        <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>Esta acción no se puede deshacer.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ ...s.btnSec, minWidth: 100 }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
          <button style={{ ...s.btn, minWidth: 100, background: "#b04040" }} onClick={confirmarEliminar}>Eliminar</button>
        </div>
      </div>
    </div>
  );

  // MODO COCINA
  if (vista === "cocinar" && selected) {
    const pasos = selected.pasos.filter(p => p.trim());
    return (
      <div style={s.app}>
        <div style={s.header}>
          <button style={s.btnGhost} onClick={() => setVista("detalle")}>← Volver</button>
          <span style={{ fontSize: 13, color: T.muted }}>Modo cocina · {selected.nombre}</span>
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: T.muted, marginBottom: 8 }}>Paso {pasoActual + 1} de {pasos.length}</div>
        <div style={{ background: T.border, borderRadius: 20, height: 6, marginBottom: 20 }}>
          <div style={{ background: T.olive, borderRadius: 20, height: 6, width: `${((pasoActual + 1) / pasos.length) * 100}%`, transition: "width .3s" }} />
        </div>
        <div style={s.paso}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🍳</div>
          <p style={{ fontFamily: T.ff.title, fontSize: 18, lineHeight: 1.7, margin: 0, color: T.text }}>{pasos[pasoActual]}</p>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{ ...s.btnSec, flex: 1 }} onClick={() => setPasoActual(p => Math.max(0, p - 1))} disabled={pasoActual === 0}>← Anterior</button>
          {pasoActual < pasos.length - 1
            ? <button style={{ ...s.btn, flex: 1 }} onClick={() => setPasoActual(p => p + 1)}>Siguiente →</button>
            : <button style={{ ...s.btn, flex: 1, background: T.gold }} onClick={() => setVista("detalle")}>¡Listo! 🎉</button>}
        </div>
      </div>
    );
  }

  // DETALLE
  if (vista === "detalle" && selected) {
    const r = selected;
    return (
      <div style={s.app}>
        <div style={s.header}>
          <button style={s.btnGhost} onClick={() => setVista("lista")}>← Recetas</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: T.ff.title, margin: "0 0 6px", fontSize: 24, color: T.text }}>{r.nombre}</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={s.tagOlive}>{r.categoria}</span>
              {r.tiempo && <span style={s.tagGold}>⏱ {r.tiempo} min</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={s.btnSec} onClick={() => abrirForm(r)}>Editar</button>
            <button style={s.btnGhost} onClick={() => eliminar(r.id)}>🗑</button>
          </div>
        </div>

        <div style={{ ...s.section, background: T.oliveLight, borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.oliveMid, marginBottom: 8 }}>Ajustar porciones</div>
          <div style={s.counter}>
            <button style={s.counterBtn} onClick={() => setPorciones(p => Math.max(1, p - 1))}>−</button>
            <span style={{ fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: "center", color: T.olive }}>{porciones}</span>
            <button style={s.counterBtn} onClick={() => setPorciones(p => p + 1)}>+</button>
            <span style={{ fontSize: 13, color: T.muted }}>comensales (base: {r.porciones_base})</span>
          </div>
        </div>

        <div style={s.section}>
          <h3 style={{ fontFamily: T.ff.title, fontSize: 16, color: T.olive, marginBottom: 10, fontWeight: 700 }}>Ingredientes</h3>
          {r.ingredientes.filter(i => i.nombre).map((ing, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
              <span>{ing.nombre}</span>
              <span style={{ fontWeight: 600, color: T.olive }}>{scale(ing.cantidad, r.porciones_base, porciones)} {ing.unidad}</span>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ fontFamily: T.ff.title, fontSize: 16, color: T.olive, margin: 0, fontWeight: 700 }}>Preparación</h3>
            <button style={s.btn} onClick={abrirCocinar}>▶ Modo cocina</button>
          </div>
          {r.pasos.filter(p => p.trim()).map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ minWidth: 28, height: 28, background: T.olive, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: 0, lineHeight: 1.7, paddingTop: 4 }}>{p}</p>
            </div>
          ))}
        </div>

        {r.notas && (
          <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontFamily: T.ff.title, fontSize: 14, fontWeight: 700, color: T.goldDark, marginBottom: 6 }}>📝 Notas</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{r.notas}</p>
          </div>
        )}
      </div>
    );
  }

  // FORMULARIO
  if (vista === "form" && form) {
    return (
      <div style={s.app}>
        <div style={s.header}>
          <button style={s.btnGhost} onClick={() => setVista(selected ? "detalle" : "lista")}>← Cancelar</button>
          <span style={{ fontFamily: T.ff.title, fontWeight: 700, fontSize: 17, color: T.text }}>{form.id && recetas.find(r => r.id === form.id) ? "Editar receta" : "Nueva receta"}</span>
        </div>

        <div style={s.section}>
          <label style={s.label}>Nombre</label>
          <input style={s.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tortilla de patatas" />
        </div>
        <div style={{ display: "flex", gap: 8, ...s.section }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Categoría</label>
            <select style={s.input} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ width: 110 }}>
            <label style={s.label}>Tiempo (min)</label>
            <input style={s.input} value={form.tiempo} onChange={e => setForm({ ...form, tiempo: e.target.value })} placeholder="30" type="number" />
          </div>
        </div>

        <div style={s.section}>
          <label style={s.label}>Porciones base</label>
          <div style={s.counter}>
            <button style={s.counterBtn} onClick={() => setForm({ ...form, porciones_base: Math.max(1, form.porciones_base - 1) })}>−</button>
            <span style={{ fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: "center", color: T.olive }}>{form.porciones_base}</span>
            <button style={s.counterBtn} onClick={() => setForm({ ...form, porciones_base: form.porciones_base + 1 })}>+</button>
            <span style={{ fontSize: 13, color: T.muted }}>comensales</span>
          </div>
        </div>

        <div style={s.section}>
          <label style={s.label}>Ingredientes</label>
          {form.ingredientes.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input style={{ ...s.input, flex: 2 }} placeholder="Ingrediente" value={ing.nombre} onChange={e => updIng(i, "nombre", e.target.value)} />
              <input style={{ ...s.input, flex: 1 }} placeholder="Cant." value={ing.cantidad} onChange={e => updIng(i, "cantidad", e.target.value)} />
              <input style={{ ...s.input, flex: 1 }} placeholder="Unidad" value={ing.unidad} onChange={e => updIng(i, "unidad", e.target.value)} />
              <button style={s.btnGhost} onClick={() => removeIng(i)}>✕</button>
            </div>
          ))}
          <button style={s.btnSec} onClick={addIng}>+ Ingrediente</button>
        </div>

        <div style={s.section}>
          <label style={s.label}>Pasos</label>
          {form.pasos.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ minWidth: 26, height: 26, background: T.olive, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginTop: 8, flexShrink: 0 }}>{i + 1}</div>
              <textarea style={{ ...s.input, flex: 1, resize: "vertical", minHeight: 60 }} placeholder={`Paso ${i + 1}...`} value={p} onChange={e => updPaso(i, e.target.value)} />
              <button style={s.btnGhost} onClick={() => removePaso(i)}>✕</button>
            </div>
          ))}
          <button style={s.btnSec} onClick={addPaso}>+ Paso</button>
        </div>

        <div style={s.section}>
          <label style={s.label}>Notas y trucos</label>
          <textarea style={{ ...s.input, minHeight: 80, resize: "vertical" }} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Trucos, variaciones, errores a evitar..." />
        </div>

        <button style={{ ...s.btn, width: "100%", padding: 14, fontSize: 16 }} onClick={guardarForm}>Guardar receta</button>
      </div>
    );
  }

  // IMPORTAR
  if (vistaImport) return (
    <div style={s.app}>
      <div style={s.header}>
        <button style={s.btnGhost} onClick={() => setVistaImport(false)}>← Cancelar</button>
        <span style={{ fontFamily: T.ff.title, fontWeight: 700, fontSize: 17, color: T.text }}>Pegar receta</span>
      </div>
      <p style={{ fontSize: 14, color: T.muted, marginBottom: 12 }}>Pega el texto de la receta tal como lo tienes (de una web, un libro, un mensaje...) y la app detectará los ingredientes, pasos y demás automáticamente.</p>
      <textarea style={{ ...s.input, minHeight: 220, resize: "vertical", marginBottom: 16 }} placeholder="Pega aquí el texto de la receta..." value={textoReceta} onChange={e => setTextoReceta(e.target.value)} />
      <button style={{ ...s.btn, width: "100%", padding: 14, fontSize: 16, opacity: parsando ? 0.7 : 1 }} onClick={parsarReceta} disabled={parsando}>
        {parsando ? "Analizando receta..." : "✨ Rellenar automáticamente"}
      </button>
    </div>
  );

  // LISTA
  return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 26 }}>🌿</span>
        <h1 style={s.h1}>Mi Recetario</h1>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button style={s.btnSec} onClick={() => { setTextoReceta(""); setVistaImport(true); }}>📋 Pegar</button>
          <button style={s.btn} onClick={() => abrirForm()}>+ Nueva</button>
        </div>
      </div>

      <input style={{ ...s.input, marginBottom: 12 }} placeholder="Buscar receta..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {["Todas", ...CATEGORIAS].map(c => (
          <button key={c} onClick={() => setFiltrocat(c)} style={{ fontFamily: T.ff.body, background: filtrocat === c ? T.olive : T.oliveLight, color: filtrocat === c ? "#fff" : T.oliveMid, border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{c}</button>
        ))}
      </div>

      {filtradas.length === 0
        ? <div style={{ textAlign: "center", color: T.muted, padding: 40, fontFamily: T.ff.title, fontSize: 15 }}>
            {recetas.length === 0 ? "Aún no tienes recetas. ¡Añade la primera!" : "No hay resultados."}
          </div>
        : filtradas.map(r => (
          <div key={r.id} style={s.card} onClick={() => abrirDetalle(r)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: T.ff.title, fontWeight: 700, fontSize: 16, color: T.text }}>{r.nombre}</span>
              <span style={s.tagOlive}>{r.categoria}</span>
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 6, display: "flex", gap: 12 }}>
              {r.tiempo && <span>⏱ {r.tiempo} min</span>}
              <span>👥 {r.porciones_base} porciones</span>
              <span>📋 {r.pasos.filter(p => p.trim()).length} pasos</span>
            </div>
          </div>
        ))}
    </div>
  );
}