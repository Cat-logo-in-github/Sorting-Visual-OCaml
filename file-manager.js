/**
 * File Manager for OCaml files
 */

class FileManager {
    constructor(app) {
        this.app = app;
        this.files = new Map();
        this.setupFileInput();
    }

    setupFileInput() {
        const fileInput = document.getElementById('file-input');
        const addFileBtn = document.getElementById('add-file-btn');

        if (fileInput && addFileBtn) {
            addFileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });

            fileInput.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);

                for (const file of files) {
                    if (file.name.endsWith('.ml')) {
                        try {
                            const content = await this.readFile(file);
                            this.addFile(file.name, content);
                        } catch (error) {
                            console.error('Error reading file:', error);
                        }
                    }
                }

                fileInput.value = '';
            });
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    addFile(name, content) {
        this.files.set(name, content);
        this.updateFileList();
    }

    saveFile(name, content) {
        this.files.set(name, content);
    }

    updateFileList() {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;

        fileList.innerHTML = '';

        this.files.forEach((content, name) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${name}</span>
                <button onclick="window.sortingVisualizer.fileManager.loadFile('${name}')">Load</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    loadFile(name) {
        const content = this.files.get(name);
        if (content) {
            document.getElementById('code-editor').value = content;
            this.app.currentFile = name;
        }
    }
}

window.FileManager = FileManager;