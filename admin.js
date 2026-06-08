const ownerPassword = "Aura@8121";
const leadStorageKey = "auraSpaceLeads";
const projectStorageKey = "auraSpaceProjects";

const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const leadsTable = document.querySelector("[data-leads-table]");
const exportLeadsButton = document.querySelector("[data-export-leads]");
const projectForm = document.querySelector("[data-project-form]");
const projectList = document.querySelector("[data-project-list]");
const lockButton = document.querySelector("[data-lock]");
const toast = document.querySelector("[data-toast]");

const readItems = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const writeItems = (key, items) => localStorage.setItem(key, JSON.stringify(items));

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3000);
};

const escapeCsv = (value) => `"${String(value || "").replaceAll('"', '""')}"`;

const exportCsv = () => {
  const leads = readItems(leadStorageKey);
  if (!leads.length) {
    showToast("No enquiries to export yet.");
    return;
  }

  const headers = ["submittedAt", "name", "phone", "location", "homeType", "budget"];
  const rows = leads.map((lead) => headers.map((key) => escapeCsv(lead[key])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aura-space-enquiries.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const renderLeads = () => {
  const leads = readItems(leadStorageKey);
  leadsTable.innerHTML = leads.length ? "" : `<tr><td colspan="7">No quote enquiries saved yet.</td></tr>`;

  leads.forEach((lead, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input value="${lead.submittedAt || ""}" data-field="submittedAt"></td>
      <td><input value="${lead.name || ""}" data-field="name"></td>
      <td><input value="${lead.phone || ""}" data-field="phone"></td>
      <td><input value="${lead.location || ""}" data-field="location"></td>
      <td><input value="${lead.homeType || ""}" data-field="homeType"></td>
      <td><input value="${lead.budget || ""}" data-field="budget"></td>
      <td>
        <div class="row-actions">
          <button type="button" data-save>Save</button>
          <button class="delete-btn" type="button" data-delete>Delete</button>
        </div>
      </td>
    `;

    row.querySelector("[data-save]").addEventListener("click", () => {
      const nextLeads = readItems(leadStorageKey);
      row.querySelectorAll("[data-field]").forEach((input) => {
        nextLeads[index][input.dataset.field] = input.value.trim();
      });
      writeItems(leadStorageKey, nextLeads);
      showToast("Enquiry updated.");
      renderLeads();
    });

    row.querySelector("[data-delete]").addEventListener("click", () => {
      const nextLeads = readItems(leadStorageKey);
      nextLeads.splice(index, 1);
      writeItems(leadStorageKey, nextLeads);
      showToast("Enquiry deleted.");
      renderLeads();
    });

    leadsTable.appendChild(row);
  });
};

const renderProjects = () => {
  const projects = readItems(projectStorageKey);
  projectList.innerHTML = projects.length ? "" : "<p>No project photos added yet.</p>";

  projects.forEach((project, index) => {
    const item = document.createElement("article");
    item.className = "project-item";
    item.innerHTML = `
      <img src="${project.image}" alt="${project.title}">
      <div>
        <h3>${project.title}</h3>
        <p>${project.description || project.category || "Project photo"}</p>
        <button class="delete-btn" type="button">Delete photo</button>
      </div>
    `;
    item.querySelector("button").addEventListener("click", () => {
      const nextProjects = readItems(projectStorageKey);
      nextProjects.splice(index, 1);
      writeItems(projectStorageKey, nextProjects);
      showToast("Project photo deleted.");
      renderProjects();
    });
    projectList.appendChild(item);
  });
};

const openDashboard = () => {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderLeads();
  renderProjects();
};

const imageFileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve("");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");
  if (password !== ownerPassword) {
    showToast("Incorrect password.");
    return;
  }
  sessionStorage.setItem("auraSpaceOwner", "true");
  openDashboard();
});

lockButton.addEventListener("click", () => {
  sessionStorage.removeItem("auraSpaceOwner");
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
});

exportLeadsButton.addEventListener("click", exportCsv);

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const uploadedImage = await imageFileToDataUrl(formData.get("imageFile"));
  const image = uploadedImage || formData.get("imageUrl").trim();

  if (!image) {
    showToast("Add a photo URL or upload an image.");
    return;
  }

  const projects = readItems(projectStorageKey);
  projects.unshift({
    title: formData.get("title").trim(),
    category: formData.get("category").trim(),
    description: formData.get("description").trim(),
    image
  });
  writeItems(projectStorageKey, projects);
  projectForm.reset();
  showToast("Project photo added.");
  renderProjects();
});

if (sessionStorage.getItem("auraSpaceOwner") === "true") {
  openDashboard();
}
