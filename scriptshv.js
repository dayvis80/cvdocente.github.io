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
    fd.append("dni", document.getElementById("dni").value.trim());
    fd.append("nombres", document.getElementById("nombres").value.trim().toUpperCase());
    fd.append("apellido_paterno", document.getElementById("apellidoPaterno").value.trim().toUpperCase());
    fd.append("apellido_materno", document.getElementById("apellidoMaterno").value.trim().toUpperCase());
    fd.append("celular", document.getElementById("celular").value.trim());
    fd.append("email", document.getElementById("email").value.trim().toLowerCase());

     // DATOS DOCENTE
    fd.append("cargo", document.getElementById("cargo").value.trim());
    fd.append("condicionLaboral", document.getElementById("condicionLaboral").value);
    fd.append("programa", document.getElementById("programas").value);
    fd.append("perfil", document.getElementById("perfilprofesional").value);


    // FORMACIÓN ACADÉMICA
    fd.append("gradoTitulo", document.getElementById("gradoTitulo").value.trim());
    fd.append("especialidad", document.getElementById("especialidad").value.trim());
    fd.append("institucionOtorgante", document.getElementById("institucionOtorgante").value.trim());
    fd.append("maestria", document.getElementById("maestria").value.trim());
    fd.append("doctorado", document.getElementById("doctorado").value.trim());

     
    // EXPERIENCIA DOCENTE
    fd.append("aniosExperiencia", document.getElementById("aniosExperiencia").value);
    fd.append("institucionesDocencia", document.getElementById("institucionesDocencia").value.trim());

    // CAPACITACIÓN DOCENTE
    fd.append("capacitacion", document.getElementById("capacitacion").value.trim());

     
    // DECLARACIÓN JURADA
    fd.append("declaracionJurada", "true");

    // METADATOS
    fd.append("submittedAt", new Date().toISOString());
    fd.append("source", "github-form-cv-docente");

    // FOTO
    const foto = fotoInput.files[0];
    if (foto) fd.append("foto", foto, foto.name);

    // ENVÍO (se activará cuando pongamos el webhook real)
//    if (N8N_WEBHOOK_URL.includes("REEMPLAZAR")) {
//      statusEl.textContent = "Formulario listo (aún no conectado a servidor).";
//      sendBtn.disabled = false;
//      return;
//    }

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: fd
    });

   const payload = await res.json().catch(() => ({}));

   if (!res.ok) {
     throw new Error(payload?.message || "Error al enviar datos");
   }

   // Construir parámetros para success.html
   const qp = new URLSearchParams({
     dni: document.getElementById("dni").value.trim(),
     nombres: document.getElementById("nombres").value.trim(),
     ap: document.getElementById("apellidoPaterno").value.trim(),
     am: document.getElementById("apellidoMaterno").value.trim(),
     celular: document.getElementById("celular").value.trim(),
     email: document.getElementById("email").value.trim(),    
     cargo: document.getElementById("cargo").value.trim(),
     cond: document.getElementById("condicionLaboral").value,
     programa: document.getElementById("programas").value,
     perfil: document.getElementById("perfilprofesional").value,      
     grado: document.getElementById("gradoTitulo").value.trim(),
     esp: document.getElementById("especialidad").value.trim(),
     inst: document.getElementById("institucionOtorgante").value.trim(),
     maestria: document.getElementById("maestria").value.trim(),
     doctorado: document.getElementById("doctorado").value.trim(),      
     anios: document.getElementById("aniosExperiencia").value,
     expdocentia: document.getElementById("institucionesDocencia").value.trim(),
     capacitacion: document.getElementById("capacitacion").value.trim(),      
     foto_url: payload?.data?.foto_url || ""
   });

   // Limpiar formulario (opcional)
   form.reset();
   previewWrap.style.display = "none";

   // Redireccionar a página de éxito
   //window.location.href = 'success.html';
   window.location.href = `success.html?${qp.toString()}`;

  } catch (err) {
    statusEl.textContent = "No se pudo enviar. Intente nuevamente.";
  } finally {
    sendBtn.disabled = false;
  }
});


