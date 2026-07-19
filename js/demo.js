// ============================================
// WRENNON — Dedicated Demo Page Logic
// ============================================
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv8XP1e-4GlWjcZpJkj98kvI_Wt9wEnCYeXucLms5ZUYr7cyHa8aCA2w0sUYkgJ_Lf7Q/exec";

document.addEventListener('DOMContentLoaded', () => {
  const optionsView = document.getElementById('demoOptionsView');
  const formView = document.getElementById('demoFormView');
  const backBtn = document.getElementById('demoBackBtn');
  const optData = document.getElementById('optDataUpload');
  const form = document.getElementById('demoDataForm');
  const errorBox = document.getElementById('demoFormError');
  const successView = document.getElementById('demoSuccessView');
  const submitBtn = document.getElementById('demoSubmitBtn');
  const successBackBtn = document.getElementById('demoSuccessBackBtn');

  if (!optionsView || !formView) return;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ['csv', 'txt', 'docx', 'pdf', 'xlsx'];

  function resetForm() {
    form.reset();
    errorBox.hidden = true;
    errorBox.textContent = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Request';
    const clearFileBtn = document.getElementById('clearFileBtn');
    if (clearFileBtn) clearFileBtn.hidden = true;
  }

  function showOptionsView() {
    if (formView) formView.hidden = true;
    if (successView) successView.hidden = true;
    optionsView.hidden = false;
    resetForm();
  }

  function showFormView() {
    optionsView.hidden = true;
    if (successView) successView.hidden = true;
    if (formView) formView.hidden = false;
  }

  // Option 1 — data upload form
  if (optData) optData.addEventListener('click', showFormView);
  if (backBtn) backBtn.addEventListener('click', showOptionsView);
  if (successBackBtn) successBackBtn.addEventListener('click', showOptionsView);

  function getExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  const fileInput = document.getElementById('demoFile');
  const clearFileBtn = document.getElementById('clearFileBtn');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      clearFileBtn.hidden = false;
      errorBox.hidden = true; // Clear any previous errors on new selection
      
      const file = fileInput.files[0];
      if (file.size > MAX_FILE_SIZE) {
        showError('File size must be under 10MB.');
        fileInput.value = ''; // clear it immediately
        clearFileBtn.hidden = true;
      }
    } else {
      clearFileBtn.hidden = true;
    }
  });

  clearFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    clearFileBtn.hidden = true;
    errorBox.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const name = document.getElementById('demoName').value.trim();
    const company = document.getElementById('demoCompany').value.trim();
    const email = document.getElementById('demoEmail').value.trim();
    const file = fileInput.files[0];

    if (!name || !company || !email || !file) {
      showError('Please fill in all required fields.');
      return;
    }

    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showError('Only .csv, .txt, .docx, .pdf, and .xlsx files are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError('File size must be under 10MB.');
      return;
    }

    if (APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      showError('Apps Script URL has not been configured yet.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const base64Data = reader.result.split(',')[1];
        const payload = {
          name,
          company,
          email,
          fileName: file.name,
          mimeType: file.type || '',
          fileData: base64Data
        };

        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Submission failed');

        const data = await res.json().catch(() => ({}));
        if (data && data.success === false) {
          throw new Error(data.error || 'Submission failed');
        }

        if (formView) formView.hidden = true;
        if (successView) successView.hidden = false;
      } catch (err) {
        console.error('Submission error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
        showError('Something went wrong — please try again, or email hello@wrennon.com directly.');
      }
    };
    reader.onerror = function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
      showError('Failed to read file.');
    };
    
    reader.readAsDataURL(file);
  });
});
