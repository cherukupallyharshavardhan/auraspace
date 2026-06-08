const header = document.querySelector(".site-header");
const form = document.querySelector(".lead-form");
const toast = document.querySelector(".toast");
const projectGallery = document.querySelector("[data-project-gallery]");
const storageKey = "auraSpaceLeads";
const projectStorageKey = "auraSpaceProjects";
const whatsappNumber = "918121454316";

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const getLeads = () => JSON.parse(localStorage.getItem(storageKey) || "[]");

const saveLeads = (leads) => {
  localStorage.setItem(storageKey, JSON.stringify(leads));
};

const makeWhatsAppMessage = (lead) => [
  "New AURA SPACE quote request",
  `Name: ${lead.name}`,
  `Mobile: ${lead.phone}`,
  `Location: ${lead.location}`,
  `Home type: ${lead.homeType}`,
  `Budget: ${lead.budget}`,
  `Submitted: ${lead.submittedAt}`
].join("\n");

const getProjects = () => JSON.parse(localStorage.getItem(projectStorageKey) || "[]");

const renderProjects = () => {
  const projects = getProjects();
  if (!projects.length) {
    return;
  }

  projectGallery.innerHTML = projects.map((project) => `
    <article class="project-card">
      <img src="${project.image}" alt="${project.title}">
      <div>
        <strong>${project.title}</strong>
        <span>${project.description || project.category || "AURA SPACE project"}</span>
      </div>
    </article>
  `).join("");
};

renderProjects();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const lead = {
    submittedAt: new Date().toLocaleString("en-IN"),
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    location: formData.get("location").trim(),
    homeType: formData.get("home-type"),
    budget: formData.get("budget")
  };
  const leads = getLeads();
  leads.unshift(lead);
  saveLeads(leads);

  const message = encodeURIComponent(makeWhatsAppMessage(lead));
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");

  toast.textContent = "Your quote request is ready in WhatsApp.";
  toast.classList.add("show");
  form.reset();

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 4200);
});
