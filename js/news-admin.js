document.addEventListener('DOMContentLoaded', () => {
    // Theme switcher functionality
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleSwitch.checked = currentTheme === 'dark';

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Initialize SimpleMDE Markdown Editor
    const editor = new SimpleMDE({
        element: document.getElementById('newsContent'),
        spellChecker: false,
        autosave: {
            enabled: true,
            unique_id: 'newsEditor',
            delay: 1000,
        },
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        placeholder: 'Wpisz treść ogłoszenia...',
        status: ['autosave', 'lines', 'words', 'cursor']
    });

    // Handle image upload
    const imageInput = document.getElementById('mainImage');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImage');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.classList.remove('d-none');
                    imagePreview.querySelector('img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            imageInput.value = '';
            imagePreview.classList.add('d-none');
            imagePreview.querySelector('img').src = '';
        });
    }

    // Handle drag and drop for image upload
    const uploadArea = document.querySelector('.image-upload-area');
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            uploadArea.classList.add('highlight');
        }

        function unhighlight(e) {
            uploadArea.classList.remove('highlight');
        }

        uploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length) {
                imageInput.files = files;
                const event = new Event('change');
                imageInput.dispatchEvent(event);
            }
        }
    }

    // Handle preview
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    const previewContent = document.getElementById('previewContent');

    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            const title = document.getElementById('newsTitle').value;
            const content = editor.value();
            const category = document.getElementById('newsCategory').value;

            const preview = `
                <div class="preview-article">
                    <div class="preview-header">
                        <span class="preview-category">${category}</span>
                        <h1>${title}</h1>
                    </div>
                    <div class="preview-content">
                        ${marked(content)}
                    </div>
                </div>
            `;

            previewContent.innerHTML = preview;
            previewModal.show();
        });
    }

    // Handle publish
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async function() {
            // Show loading state
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publikowanie...';

            try {
                // Gather form data
                const formData = new FormData();
                formData.append('title', document.getElementById('newsTitle').value);
                formData.append('content', editor.value());
                formData.append('category', document.getElementById('newsCategory').value);
                formData.append('targetGroup', Array.from(document.getElementById('targetGroup').selectedOptions).map(opt => opt.value));
                formData.append('parish', document.getElementById('parish').value);
                formData.append('publishDate', document.getElementById('publishDate').value);
                formData.append('featured', document.getElementById('featured').checked);
                formData.append('allowComments', document.getElementById('allowComments').checked);

                if (imageInput.files.length) {
                    formData.append('image', imageInput.files[0]);
                }

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Show success message
                this.classList.remove('btn-primary');
                this.classList.add('btn-success');
                this.innerHTML = '<i class="fas fa-check"></i> Opublikowano!';

                // Reset after 2 seconds
                setTimeout(() => {
                    this.disabled = false;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-primary');
                    this.innerHTML = originalText;
                }, 2000);

            } catch (error) {
                console.error('Error publishing:', error);
                this.classList.remove('btn-primary');
                this.classList.add('btn-danger');
                this.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Błąd publikacji';

                setTimeout(() => {
                    this.disabled = false;
                    this.classList.remove('btn-danger');
                    this.classList.add('btn-primary');
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    }

    // Handle form validation
    const newsTitle = document.getElementById('newsTitle');
    if (newsTitle) {
        newsTitle.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 