/* ============================================
   CONFIGURACIÓN (se activará luego con n8n)
============================================ */
const N8N_WEBHOOK_URL = "https://ingdayvis-n8n-private.hf.space/webhook-test/hvdocente"; 

/* ============================================
   ELEMENTOS
============================================ */
const form = document.getElementById("cvForm");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

const fotoInput = document.getElementById("foto");
const previewWrap = document.getElementById("previewWrap");
const previewImg = document.getElementById("previewImg");
const previewMeta = document.getElementById("previewMeta");

/* ============================================
   PREVIEW DE FOTO + VALIDACIÓN BÁSICA
============================================ */
fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    alert("Solo se permiten imágenes JPG o PNG.");
    fotoInput.value = "";
    return;
  }

  const maxMB = 2;
  if (file.size / (1024 * 1024) > maxMB) {
    alert("La imagen no debe superar 2 MB.");
    fotoInput.value = "";
    return;
  }

  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewWrap.style.display = "flex";

  const img = new Image();
  img.onload = () => {
    previewMeta.textContent = `${file.name} — ${(file.size / 1024).toFixed(0)} KB — ${img.width}×${img.height}px`;
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

/* ============================================
   ENVÍO DEL FORMULARIO
============================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  sendBtn.disabled = true;

  // Declaración jurada obligatoria
  if (!document.getElementById("declaracionJurada").checked) {
    alert("Debe aceptar la Declaración Jurada para continuar.");
    sendBtn.disabled = false;
    return;
  }

  try {
    const fd = new FormData();

    // DATOS GENERALES
    //fd.append("nombreCompleto", document.getElementById("nombreCompleto").value.trim());
    fd.append("nombres", document.getElementById("nombres").value.trim());
    fd.append("apellido_paterno", document.getElementById("apellidoPaterno").value.trim());
    fd.append("apellido_materno", document.getElementById("apellidoMaterno").value.trim());
    fd.append("cargo", document.getElementById("cargo").value.trim());
    fd.append("condicionLaboral", document.getElementById("condicionLaboral").value);
    fd.append("programa", document.getElementById("programaS").value);
    fd.append("celular", document.getElementById("celular").value.trim());

    // FORMACIÓN ACADÉMICA
    fd.append("gradoTitulo", document.getElementById("gradoTitulo").value.trim());
    fd.append("especialidad", document.getElementById("especialidad").value.trim());
    fd.append("institucionOtorgante", document.getElementById("institucionOtorgante").value.trim());

    // EXPERIENCIA DOCENTE
    fd.append("aniosExperiencia", document.getElementById("aniosExperiencia").value);
    fd.append("institucionesDocencia", document.getElementById("institucionesDocencia").value.trim());

    // EMPLEABILIDAD
    fd.append("empleabilidad", document.getElementById("empleabilidad").value);
    fd.append("detalleEmpleabilidad", document.getElementById("detalleEmpleabilidad").value.trim());

    // DECLARACIÓN JURADA
    fd.append("declaracionJurada", "true");

    // METADATOS
    fd.append("submittedAt", new Date().toISOString());
    fd.append("source", "github-form-cv-docente");

    // FOTO
    const foto = fotoInput.files[0];
    if (foto) fd.append("foto", foto, foto.name);

    // ENVÍO (se activará cuando pongamos el webhook real)
    if (N8N_WEBHOOK_URL.includes("REEMPLAZAR")) {
      statusEl.textContent = "Formulario listo (aún no conectado a servidor).";
      sendBtn.disabled = false;
      return;
    }

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: fd
    });

    if (!res.ok) throw new Error("Error al enviar datos");

    statusEl.textContent = "Datos enviados correctamente.";
    form.reset();
    previewWrap.style.display = "none";

  } catch (err) {
    statusEl.textContent = "No se pudo enviar. Intente nuevamente.";
  } finally {
    sendBtn.disabled = false;
  }
});



