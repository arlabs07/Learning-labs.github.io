
        // --- Injected Data for Hosted Site (These will be populated dynamically on download) ---
        // These variables are placeholders. Their values will be set by the generator
        // when the HTML file is downloaded, ensuring the downloaded site has its content.
        let initialWebsiteName = "";
        let initialWebsiteLogoUrl = "";
        let initialPagesData = [];
        let initialUsedUrlsData = [];
        let initialIsGeneratorMode = true; // Default for the generator itself
        let initialIsEditModeActive = false;
        // --- End Injected Data ---

        // DOM Elements
        const menuButton = document.getElementById('menuButton');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const websiteNameInput = document.getElementById('websiteNameInput');
        const headerLogo = document.getElementById('headerLogo');
        const sidebarLogo = document.getElementById('sidebarLogo');
        const addNewPageButton = document.getElementById('addNewPageButton');
        const pagesContainer = document.getElementById('pagesContainer');
        const currentPageNameInput = document.getElementById('currentPageNameInput');
        const contentEditorContainer = document.getElementById('contentEditorContainer');
        const contentEditor = document.getElementById('contentEditor');
        const addContentFloatingButton = document.getElementById('addContentFloatingButton');

        // Header Buttons
        const hostSiteButton = document.getElementById('hostSiteButton');
        const toggleEditModeButton = document.getElementById('toggleEditModeButton');

        // Modals
        const contentTypeModal = document.getElementById('contentTypeModal');
        const closeContentTypeModalButton = document.getElementById('closeContentTypeModalButton');
        const contentTypeOptions = document.querySelectorAll('.content-type-option');

        const inputModal = document.getElementById('inputModal');
        const closeInputModalButton = document.getElementById('closeInputModalButton');
        const inputModalTitle = document.getElementById('inputModalTitle');
        const inputModalFields = document.getElementById('inputModalFields');
        const inputModalSubmitButton = document.getElementById('inputModalSubmitButton');

        const logoModal = document.getElementById('logoModal');
        const closeLogoModalButton = document.getElementById('closeLogoModalButton');
        const newLogoUrlInput = document.getElementById('newLogoUrlInput');
        const saveLogoButton = document.getElementById('saveLogoButton');

        const prevPageButton = document.getElementById('prevPageButton');
        const nextPageButton = document.getElementById('nextPageButton');

        // Global state (will be overridden by injected data if downloaded site)
        let pages = [];
        let currentPageId = 'home'; // Default to 'home' page
        let isGeneratorMode = localStorage.getItem('isGeneratorMode') !== 'false'; // Default to true if not set
        let isEditModeActive = localStorage.getItem('isEditModeActive') === 'true';

        // Helper to generate unique IDs
        const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

        // --- Local Storage Functions (for the generator itself) ---
        const savePages = () => {
            localStorage.setItem('websitePages', JSON.stringify(pages));
        };

        const loadPages = () => {
            const storedPages = localStorage.getItem('websitePages');
            if (storedPages) {
                pages = JSON.parse(storedPages);
            } else {
                // Initialize with a default 'Home' page
                pages = [
                    { id: 'home', name: 'Home', content: '<p>Welcome to your new page! Click the \'Edit\' button in the header to start customizing.</p>' },
                ];
            }
            // Ensure 'home' page exists if pages array is empty after loading (e.g., all pages were deleted)
            if (pages.length === 0) {
                 pages.unshift({ id: 'home', name: 'Home', content: '<p>Welcome to your new page! Click the \'Edit\' button in the header to start customizing.</p>' });
            }
        };

        const saveWebsiteSettings = () => {
            localStorage.setItem('websiteName', websiteNameInput.value);
        };

        const loadWebsiteSettings = () => {
            const savedName = localStorage.getItem('websiteName');
            if (savedName) {
                websiteNameInput.value = savedName;
            }
        };

        const saveLogoUrl = (url) => {
            localStorage.setItem('websiteLogoUrl', url);
        };

        const loadLogoUrl = () => {
            const savedLogoUrl = localStorage.getItem('websiteLogoUrl');
            if (savedLogoUrl) {
                headerLogo.src = savedLogoUrl;
                sidebarLogo.src = savedLogoUrl;
            } else {
                // Set default logo if none saved
                headerLogo.src = "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp";
                sidebarLogo.src = "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp";
            }
        };


        // --- UI Update Functions ---
        const renderPageList = () => {
            pagesContainer.innerHTML = ''; // Clear existing list

            pages.forEach(page => {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `
                    <div class="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-md p-2 cursor-pointer page-item transition-all duration-200 ease-in-out hover:scale-[1.02]" data-page-id="${page.id}">
                        <span class="flex-grow text-lg font-medium page-name-display truncate">${page.name}</span>
                        <button class="delete-page-button text-gray-400 hover:text-red-400 ml-2 p-1 rounded-full hover:bg-gray-500 transition-all duration-200 ease-in-out transform hover:scale-110">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                pagesContainer.appendChild(li);
            });

            // Add active class to current page
            document.querySelectorAll('.page-item').forEach(item => {
                if (item.dataset.pageId === currentPageId) {
                    item.classList.add('bg-purple-700', 'hover:bg-purple-700');
                    item.classList.remove('bg-gray-700', 'hover:bg-gray-600');
                } else {
                    item.classList.remove('bg-purple-700', 'hover:bg-purple-700');
                    item.classList.add('bg-gray-700', 'hover:bg-gray-600');
                }
            });
        };

        const loadPageContent = (pageId) => {
            let page;
            const isCopyrightPage = pageId === 'copyright-terms';

            if (isCopyrightPage) {
                page = {
                    id: 'copyright-terms',
                    name: 'Terms & Copyright',
                    content: generateCopyrightContent()
                };
                // Copyright page is never editable
                currentPageNameInput.setAttribute('readonly', true);
                contentEditor.setAttribute('contenteditable', false);
            } else {
                page = pages.find(p => p.id === pageId);
                // If page is not found (e.g., deleted), default to the first available page
                if (!page) {
                    page = pages[0];
                    pageId = pages[0].id;
                }
            }

            if (page) {
                currentPageId = page.id;
                currentPageNameInput.value = page.name;
                contentEditor.innerHTML = page.content;
                renderPageList(); // Update active state in sidebar
                highlightCodeBlocks(); // Re-highlight code
                renderMathFormulas(); // Re-render math
                updateNavigationButtons(); // Update prev/next buttons
            } else {
                console.error('Page not found:', pageId);
                if (pages.length === 0) {
                    pages.push({ id: 'home', name: 'Home', content: '<p>Welcome to your new page! Click the \'Edit\' button in the header to start customizing.</p>' });
                    savePages();
                }
                loadPageContent('home'); // Load home page if selected page is not found
            }

            // Apply the current mode and edit state after loading page content
            applyModeAndEditState();
        };

        const updateNavigationButtons = () => {
            const allNavigablePages = [...pages, { id: 'copyright-terms', name: 'Terms & Copyright' }];
            const currentIndex = allNavigablePages.findIndex(p => p.id === currentPageId);

            prevPageButton.disabled = currentIndex <= 0;
            nextPageButton.disabled = currentIndex >= allNavigablePages.length - 1;
        };

        // --- Content Editor Functions ---
        const saveCurrentPageContent = () => {
            const pageIndex = pages.findIndex(p => p.id === currentPageId);
            if (pageIndex !== -1) {
                pages[pageIndex].name = currentPageNameInput.value;
                pages[pageIndex].content = contentEditor.innerHTML;
                savePages();
            }
        };

        const insertContentAtCursor = (html) => {
            contentEditor.focus();
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const div = document.createElement('div');
                div.innerHTML = html;
                const fragment = document.createDocumentFragment();
                let lastNode;
                while (div.firstChild) {
                    lastNode = div.firstChild;
                    fragment.appendChild(lastNode);
                }
                range.insertNode(fragment);
                if (lastNode) {
                    range.setStartAfter(lastNode);
                    range.setEndAfter(lastNode);
                }
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                contentEditor.innerHTML += html; // Fallback if no selection
            }
            // Re-highlight and re-render math after content insertion
            highlightCodeBlocks();
            renderMathFormulas();
        };

        const highlightCodeBlocks = () => {
            document.querySelectorAll('.code-block pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        };

        const renderMathFormulas = () => {
            // Remove existing KaTeX renderings to prevent duplicates
            document.querySelectorAll('.katex-display, .katex').forEach(el => el.remove());
            // Re-render all math elements
            renderMathInElement(contentEditor, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                ],
                throwOnError : false
            });
        };

        // --- Input Modal Logic ---
        let currentContentType = null; // To keep track of which content type is being added

        const openInputModal = (type) => {
            currentContentType = type;
            inputModalFields.innerHTML = ''; // Clear previous fields
            inputModalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`; // Set modal title

            let fieldsHtml = '';
            switch (type) {
                case 'header':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="headerText">Header Text:</label>
                        <input type="text" id="headerText" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="My Section Title" value="New Header">
                        <label class="block text-gray-300 text-sm font-bold mb-2 mt-4" for="headerLevel">Header Level (1-6):</label>
                        <input type="number" id="headerLevel" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" min="1" max="6" value="2">
                    `;
                    break;
                case 'paragraph':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="paragraphText">Paragraph Text:</label>
                        <textarea id="paragraphText" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder="This is a new paragraph."></textarea>
                    `;
                    break;
                case 'list':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="listItems">List Items (one per line):</label>
                        <textarea id="listItems" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder="Item 1\nItem 2\nItem 3"></textarea>
                        <div class="flex items-center mt-4">
                            <input type="checkbox" id="orderedList" class="mr-2 leading-tight">
                            <label class="text-gray-300" for="orderedList">Numbered List</label>
                        </div>
                    `;
                    break;
                case 'bold':
                case 'italic':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="textInput">Text to make ${type}:</label>
                        <input type="text" id="textInput" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter text here" value="${type.charAt(0).toUpperCase() + type.slice(1)} Text">
                    `;
                    break;
                case 'image':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="imageUrl">Image URL:</label>
                        <input type="url" id="imageUrl" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="https://example.com/image.jpg" value="https://placehold.co/400x200/cccccc/000000?text=Image">
                        <label class="block text-gray-300 text-sm font-bold mb-2 mt-4" for="imageAlt">Alt Text (for accessibility):</label>
                        <input type="text" id="imageAlt" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Description of image">
                    `;
                    break;
                case 'video':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="videoUrl">Video URL (MP4 or YouTube embed link):</label>
                        <input type="url" id="videoUrl" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="https://example.com/video.mp4 or YouTube URL" value="https://www.w3schools.com/html/mov_bbb.mp4">
                    `;
                    break;
                case 'pdf':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="pdfUrl">PDF URL:</label>
                        <input type="url" id="pdfUrl" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="https://example.com/document.pdf" value="https://www.africau.edu/images/default/sample.pdf">
                    `;
                    break;
                case 'iframe':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="iframeUrl">Website URL for IFrame:</label>
                        <input type="url" id="iframeUrl" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="https://example.com" value="https://www.google.com/webhp?igu=1">
                    `;
                    break;
                case 'table':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="tableRows">Number of Rows:</label>
                        <input type="number" id="tableRows" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" min="1" value="3">
                        <label class="block text-gray-300 text-sm font-bold mb-2 mt-4" for="tableCols">Number of Columns:</label>
                        <input type="number" id="tableCols" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" min="1" value="2">
                    `;
                    break;
                case 'code':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="codeLanguage">Code Language (e.g., javascript, python, html):</label>
                        <input type="text" id="codeLanguage" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="javascript" value="javascript">
                        <label class="block text-gray-300 text-sm font-bold mb-2 mt-4" for="codeFileName">File Name with Extension (e.g., script.js):</label>
                        <input type="text" id="codeFileName" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="example.js" value="example.js">
                        <label class="block text-gray-300 text-sm font-bold mb-2 mt-4" for="codeContent">Code Content:</label>
                        <textarea id="codeContent" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline h-48" placeholder="// Your code goes here"></textarea>
                    `;
                    break;
                case 'formula':
                    fieldsHtml = `
                        <label class="block text-gray-300 text-sm font-bold mb-2" for="formulaText">LaTeX Formula (use $$ for display, $ for inline):</label>
                        <textarea id="formulaText" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder="$$E=mc^2$$"></textarea>
                    `;
                    break;
            }
            inputModalFields.innerHTML = fieldsHtml;
            inputModal.style.display = 'flex'; // Show the input modal
        };

        const handleInputModalSubmit = () => {
            let contentHtml = '';

            switch (currentContentType) {
                case 'header':
                    const headerText = document.getElementById('headerText').value;
                    const headerLevel = parseInt(document.getElementById('headerLevel').value) || 2;
                    if (headerText) {
                        const hTag = `h${Math.min(6, Math.max(1, headerLevel))}`;
                        contentHtml = `<${hTag}>${escapeHtml(headerText)}</${hTag}>`;
                    }
                    break;
                case 'paragraph':
                    const paragraphText = document.getElementById('paragraphText').value;
                    if (paragraphText) {
                        contentHtml = `<p>${escapeHtml(paragraphText).replace(/\n/g, '<br>')}</p>`; // Allow new lines
                    }
                    break;
                case 'list':
                    const listItems = document.getElementById('listItems').value;
                    const orderedList = document.getElementById('orderedList').checked;
                    if (listItems) {
                        const itemsArray = listItems.split('\n').map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
                        const listTag = orderedList ? 'ol' : 'ul';
                        contentHtml = `<${listTag}>${itemsArray}</${listTag}>`;
                    }
                    break;
                case 'bold':
                    const boldText = document.getElementById('textInput').value;
                    if (boldText) {
                        contentHtml = `<strong>${escapeHtml(boldText)}</strong>`;
                    }
                    break;
                case 'italic':
                    const italicText = document.getElementById('textInput').value;
                    if (italicText) {
                        contentHtml = `<em>${escapeHtml(italicText)}</em>`;
                    }
                    break;
                case 'image':
                    const imageUrl = document.getElementById('imageUrl').value;
                    const imageAlt = document.getElementById('imageAlt').value;
                    if (imageUrl) {
                        contentHtml = `<img src="${imageUrl}" alt="${escapeHtml(imageAlt)}" class="max-w-full h-auto rounded-md shadow-sm my-2" onerror="this.onerror=null;this.src='https://placehold.co/400x200/cccccc/000000?text=Image+Load+Error';">`;
                        addUrlToCopyright(imageUrl, 'Image');
                    }
                    break;
                case 'video':
                    const videoUrl = document.getElementById('videoUrl').value;
                    if (videoUrl) {
                        if (videoUrl.includes('youtube.com/watch?v=')) {
                            const youtubeId = videoUrl.split('v=')[1].split('&')[0];
                            contentHtml = `<div class="relative" style="padding-bottom: 56.25%; height: 0; overflow: hidden;">
                                <iframe class="absolute top-0 left-0 w-full h-full rounded-md shadow-sm my-2" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>`;
                        } else {
                            contentHtml = `<video controls class="w-full h-auto rounded-md shadow-sm my-2"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
                        }
                        addUrlToCopyright(videoUrl, 'Video');
                    }
                    break;
                case 'pdf':
                    const pdfUrl = document.getElementById('pdfUrl').value;
                    if (pdfUrl) {
                        contentHtml = `<div class="w-full h-96 my-2 rounded-md shadow-sm overflow-hidden"><iframe src="${pdfUrl}" class="w-full h-full border-none"></iframe></div>`;
                        addUrlToCopyright(pdfUrl, 'PDF');
                    }
                    break;
                case 'iframe':
                    const iframeUrl = document.getElementById('iframeUrl').value;
                    if (iframeUrl) {
                        contentHtml = `<div class="w-full h-96 my-2 rounded-md shadow-sm overflow-hidden"><iframe src="${iframeUrl}" class="w-full h-full border-none" sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"></iframe></div>`;
                        addUrlToCopyright(iframeUrl, 'IFrame Website');
                    }
                    break;
                case 'table':
                    const rows = parseInt(document.getElementById('tableRows').value) || 0;
                    const cols = parseInt(document.getElementById('tableCols').value) || 0;
                    if (rows > 0 && cols > 0) {
                        let tableHtml = '<div class="table-container"><table class="generated-table">';
                        tableHtml += '<thead><tr>';
                        for (let c = 0; c < cols; c++) {
                            tableHtml += `<th>Header ${c + 1}</th>`;
                        }
                        tableHtml += '</tr></thead>';
                        tableHtml += '<tbody>';
                        for (let r = 0; r < rows; r++) {
                            tableHtml += '<tr>';
                            for (let c = 0; c < cols; c++) {
                                tableHtml += `<td>Row ${r + 1}, Col ${c + 1}</td>`;
                            }
                            tableHtml += '</tr>';
                        }
                        tableHtml += '</tbody></table></div>';
                        contentHtml = tableHtml;
                    }
                    break;
                case 'code':
                    const codeLanguage = document.getElementById('codeLanguage').value;
                    const codeFileName = document.getElementById('codeFileName').value;
                    const codeContent = document.getElementById('codeContent').value;
                    if (codeContent) {
                        contentHtml = `
                            <div class="code-block">
                                <div class="code-header">
                                    <span>${escapeHtml(codeFileName)}</span>
                                    <button class="copy-button" onclick="copyCode(this)"><i class="fas fa-copy"></i></button>
                                </div>
                                <pre><code class="language-${escapeHtml(codeLanguage)}">${escapeHtml(codeContent)}</code></pre>
                            </div>
                        `;
                    }
                    break;
                case 'formula':
                    const formulaText = document.getElementById('formulaText').value;
                    if (formulaText) {
                        contentHtml = `<div class="formula-block">${escapeHtml(formulaText)}</div>`;
                    }
                    break;
            }
            if (contentHtml) {
                insertContentAtCursor(contentHtml);
                saveCurrentPageContent(); // Save page after adding content
            }
            inputModal.style.display = 'none'; // Hide the input modal
        };

        // Utility to escape HTML for code blocks
        const escapeHtml = (unsafe) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        // Function to copy code to clipboard (for generator UI)
        window.copyCode = (button) => {
            const codeBlock = button.closest('.code-block');
            const codeElement = codeBlock.querySelector('pre code');
            const textToCopy = codeElement.innerText;

            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 1500);
        };

        // --- Copyright Page Logic ---
        let usedUrls = []; // Stores URLs for copyright page

        const addUrlToCopyright = (url, type) => {
            // Check if URL already exists to avoid duplicates
            if (!usedUrls.some(item => item.url === url && item.type === type)) {
                usedUrls.push({ url, type, timestamp: new Date().toLocaleString() });
                localStorage.setItem('usedUrls', JSON.stringify(usedUrls));
            }
        };

        const loadUsedUrls = () => {
            const storedUrls = localStorage.getItem('usedUrls');
            if (storedUrls) {
                usedUrls = JSON.parse(storedUrls);
            }
        };

        const generateCopyrightContent = () => {
            let content = `
                <h1 class="text-3xl font-bold mb-4 text-purple-400">Terms & Copyright</h1>
                <p class="mb-4">This page outlines the terms of use and copyright information for the content generated on this website.</p>
                <h2 class="text-2xl font-semibold mb-3 text-purple-300">Terms of Use</h2>
                <p class="mb-4">All content created using this website generator is owned by the user who generated it. This tool is provided "as is" without warranty of any kind, express or implied. The creator of this tool is not responsible for any content generated by users.</p>
                <h2 class="text-2xl font-semibold mb-3 text-purple-300">Copyright Information for External Resources</h2>
                <p class="mb-4">Below is a list of external URLs that have been embedded or referenced in the pages generated by this tool. Users are responsible for ensuring they have the necessary rights and permissions to use any external content.</p>
                <ul class="list-disc pl-5 mb-6">
            `;

            if (usedUrls.length > 0) {
                usedUrls.forEach(item => {
                    content += `<li><strong>${item.type}:</strong> <a href="${item.url}" target="_blank" class="text-purple-600 hover:underline break-all">${item.url}</a> (Added: ${item.timestamp})</li>`;
                });
            } else {
                content += `<li>No external URLs have been added yet.</li>`;
            }

            content += `
                </ul>
                <p class="text-sm text-gray-500 mt-8">© ${new Date().getFullYear()} Website Generator. All rights reserved.</p>
            `;
            return content;
        };

        // --- Mode and Edit State Application ---
        const applyModeAndEditState = () => {
            // Adjust body class based on mode
            if (isGeneratorMode) {
                document.body.classList.remove('hosted-mode');
                document.body.classList.remove('edit-active'); // Ensure hosted-mode edit-active is off
            } else {
                document.body.classList.add('hosted-mode');
                if (isEditModeActive) {
                    document.body.classList.add('edit-active');
                } else {
                    document.body.classList.remove('edit-active');
                }
            }

            // Handle header button visibility
            hostSiteButton.style.display = isGeneratorMode ? 'flex' : 'none';
            toggleEditModeButton.style.display = isGeneratorMode ? 'none' : 'flex';

            // Handle editability for website name input
            if (isGeneratorMode || isEditModeActive) {
                websiteNameInput.removeAttribute('readonly');
            } else {
                websiteNameInput.setAttribute('readonly', true);
            }

            // Handle editability and floating button for current page
            const isCopyrightPage = currentPageId === 'copyright-terms';

            if (isGeneratorMode) {
                // In Generator Mode, content is always editable for the builder
                currentPageNameInput.removeAttribute('readonly');
                contentEditor.setAttribute('contenteditable', true);
                contentEditorContainer.classList.add('editable');
                addContentFloatingButton.style.opacity = '1';
                addContentFloatingButton.style.display = 'flex';
            } else { // Hosted Mode
                if (isCopyrightPage) {
                    currentPageNameInput.setAttribute('readonly', true);
                    contentEditor.setAttribute('contenteditable', false);
                    contentEditorContainer.classList.remove('editable');
                    addContentFloatingButton.style.opacity = '0';
                    addContentFloatingButton.style.display = 'none';
                } else if (isEditModeActive) { // Hosted Mode, Edit State
                    currentPageNameInput.removeAttribute('readonly');
                    contentEditor.setAttribute('contenteditable', true);
                    contentEditorContainer.classList.add('editable');
                    addContentFloatingButton.style.opacity = '1';
                    addContentFloatingButton.style.display = 'flex';
                    toggleEditModeButton.innerHTML = '<i class="fas fa-check mr-2"></i> Save';
                } else { // Hosted Mode, View State
                    currentPageNameInput.setAttribute('readonly', true);
                    contentEditor.setAttribute('contenteditable', false);
                    contentEditorContainer.classList.remove('editable');
                    addContentFloatingButton.style.opacity = '0';
                    addContentFloatingButton.style.display = 'none';
                    toggleEditModeButton.innerHTML = '<i class="fas fa-edit mr-2"></i> Edit';
                }
            }

            // Handle sidebar visibility for mobile
            if (window.innerWidth < 1024) { // Mobile
                // Sidebar is hidden by default, toggled by menu button
                // Its 'open' class is managed by the menu button click listener
            } else { // Desktop
                // On desktop, sidebar is always visible unless it's the copyright page in hosted view mode
                if (isGeneratorMode || !isCopyrightPage) {
                    sidebar.classList.add('open'); // Ensure it's not collapsed by mobile logic
                } else {
                    sidebar.classList.remove('open'); // Collapse if not in generator or hosted-edit mode
                }
            }
        };


        // --- Event Listeners ---
        menuButton.addEventListener('click', () => {
            // On mobile, the sidebar should always be toggleable for navigation
            // The content within the sidebar (add page, delete buttons) will be hidden/shown by applyModeAndEditState.
            if (window.innerWidth < 1024) { // Only for mobile
                sidebar.classList.toggle('open');
            }
        });

        websiteNameInput.addEventListener('input', (e) => {
            saveWebsiteSettings();
        });

        // Event listener for clicking header logo to change it
        headerLogo.addEventListener('click', () => {
            if (isGeneratorMode || isEditModeActive) { // Only allow changing logo in editable modes
                newLogoUrlInput.value = headerLogo.src === "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp" || headerLogo.src.includes("placehold.co") ? "" : headerLogo.src; // Pre-fill if not default
                logoModal.style.display = 'flex';
            }
        });

        // Event listener for clicking sidebar logo to change it
        sidebarLogo.addEventListener('click', () => {
            if (isGeneratorMode || isEditModeActive) { // Only allow changing logo in editable modes
                newLogoUrlInput.value = sidebarLogo.src === "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp" || sidebarLogo.src.includes("placehold.co") ? "" : sidebarLogo.src; // Pre-fill if not default
                logoModal.style.display = 'flex';
            }
        });

        closeLogoModalButton.addEventListener('click', () => {
            logoModal.style.display = 'none';
        });

        saveLogoButton.addEventListener('click', () => {
            const newUrl = newLogoUrlInput.value.trim();
            if (newUrl) {
                headerLogo.src = newUrl;
                sidebarLogo.src = newUrl;
                saveLogoUrl(newUrl);
            } else {
                // If empty, revert to default or a placeholder
                headerLogo.src = "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp"; // Revert to original default
                sidebarLogo.src = "https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp"; // Revert to original default
                saveLogoUrl("https://arlabs07.github.io/Arhub07.github.io/Images/llabs.webp"); // Save default URL
            }
            logoModal.style.display = 'none';
        });


        addNewPageButton.addEventListener('click', () => {
            const newPageId = generateUniqueId();
            const newPageName = `New Page ${pages.length + 1}`;
            const newPage = {
                id: newPageId,
                name: newPageName,
                content: `<p>This is the content for ${newPageName}.</p>`
            };
            pages.push(newPage);
            savePages();
            renderPageList();
            loadPageContent(newPageId); // Load the newly created page
        });

        pagesContainer.addEventListener('click', (e) => {
            const pageItem = e.target.closest('.page-item');
            if (pageItem) {
                const pageId = pageItem.dataset.pageId;
                // If clicking delete button (only visible in generator mode or hosted edit mode)
                if ((isGeneratorMode || isEditModeActive) && e.target.closest('.delete-page-button')) {
                    if (pageId === 'copyright-terms') {
                        return; // Cannot delete copyright page
                    }
                    if (confirm('Are you sure you want to delete this page?')) {
                        pages = pages.filter(p => p.id !== pageId);
                        savePages();
                        renderPageList();

                        if (currentPageId === pageId) {
                            if (pages.length > 0) {
                                loadPageContent(pages[0].id);
                            } else {
                                pages.push({ id: 'home', name: 'Home', content: '<p>Welcome to your new page! Click the \'Edit\' button in the header to start customizing.</p>' });
                                savePages();
                                loadPageContent('home');
                            }
                        }
                    }
                } else if (!e.target.closest('.delete-page-button')) {
                    // If not clicking delete button, load the page
                    loadPageContent(pageId);
                }
            }
        });

        // Host Site Button (only visible in Generator Mode)
        hostSiteButton.addEventListener('click', () => {
            // First, trigger the download of the current HTML content
            generateAndDownloadCurrentHTML();

            // After download, switch to hosted mode and reload
            localStorage.setItem('isGeneratorMode', 'false');
            localStorage.setItem('isEditModeActive', 'false'); // Default hosted site to view mode
            // Use a slight delay to ensure download starts before reload, though Blob download is fast
            setTimeout(() => {
                location.reload(); // Reload the page to apply hosted mode
            }, 100);
        });

        // Function to generate and download the current HTML file
        const generateAndDownloadCurrentHTML = () => {
            const siteName = websiteNameInput.value || 'My Generated Website';
            let htmlContent = document.documentElement.outerHTML; // Get the entire current HTML

            // Inject current state into the downloaded HTML
            const injectedDataScript = `
        <script>
            // --- Injected Data for Hosted Site ---
            // This data is dynamically inserted when the site is downloaded.
            let initialWebsiteName = ${JSON.stringify(websiteNameInput.value)};
            let initialWebsiteLogoUrl = ${JSON.stringify(headerLogo.src)};
            let initialPagesData = ${JSON.stringify(pages)};
            let initialUsedUrlsData = ${JSON.stringify(usedUrls)};
            let initialIsGeneratorMode = false; // Always false for downloaded site
            let initialIsEditModeActive = false; // Always false for downloaded site (starts in view mode)
            // --- End Injected Data ---
        </script>`;

            // Find the existing script block to replace its content
            // We'll look for the comment `// --- Injected Data for Hosted Site ---`
            const scriptRegex = /(<script>\s*\/\/ --- Injected Data for Hosted Site ---[\s\S]*?\/\/ --- End Injected Data ---\s*<\/script>)/;
            htmlContent = htmlContent.replace(scriptRegex, injectedDataScript);

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${siteName.replace(/\s+/g, '-')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the object URL
        };

        // Toggle Edit Mode Button (only visible in Hosted Mode)
        toggleEditModeButton.addEventListener('click', () => {
            if (currentPageId === 'copyright-terms') {
                return; // Cannot edit copyright page
            }
            // Save content before toggling out of edit mode
            if (isEditModeActive) { // If currently in edit mode, save changes
                saveCurrentPageContent();
            }
            isEditModeActive = !isEditModeActive;
            localStorage.setItem('isEditModeActive', isEditModeActive);
            applyModeAndEditState();
        });

        addContentFloatingButton.addEventListener('click', () => {
            contentTypeModal.style.display = 'flex'; // Show content type selection modal
        });

        closeContentTypeModalButton.addEventListener('click', () => {
            contentTypeModal.style.display = 'none'; // Hide content type selection modal
        });

        closeInputModalButton.addEventListener('click', () => {
            inputModal.style.display = 'none'; // Hide input modal
        });

        inputModalSubmitButton.addEventListener('click', handleInputModalSubmit);

        // Close modals if clicked outside
        window.addEventListener('click', (event) => {
            if (event.target === contentTypeModal) {
                contentTypeModal.style.display = 'none';
            }
            if (event.target === inputModal) {
                inputModal.style.display = 'none';
            }
            if (event.target === logoModal) {
                logoModal.style.display = 'none';
            }
        });

        contentTypeOptions.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.dataset.type;
                contentTypeModal.style.display = 'none'; // Hide content type selection modal
                openInputModal(type); // Open the specific input modal for all types
            });
        });

        prevPageButton.addEventListener('click', () => {
            const allNavigablePages = [...pages, { id: 'copyright-terms', name: 'Terms & Copyright' }];
            const currentIndex = allNavigablePages.findIndex(p => p.id === currentPageId);
            if (currentIndex > 0) {
                loadPageContent(allNavigablePages[currentIndex - 1].id);
            }
        });

        nextPageButton.addEventListener('click', () => {
            const allNavigablePages = [...pages, { id: 'copyright-terms', name: 'Terms & Copyright' }];
            const currentIndex = allNavigablePages.findIndex(p => p.id === currentPageId);
            if (currentIndex < allNavigablePages.length - 1) {
                loadPageContent(allNavigablePages[currentIndex + 1].id);
            }
        });

        // --- Initialization ---
        document.addEventListener('DOMContentLoaded', () => {
            // Check if running as a downloaded site (initialIsGeneratorMode will be false)
            if (!initialIsGeneratorMode) {
                // If this is a downloaded site, use the injected data
                websiteNameInput.value = initialWebsiteName;
                headerLogo.src = initialWebsiteLogoUrl;
                sidebarLogo.src = initialWebsiteLogoUrl;
                pages = initialPagesData;
                usedUrls = initialUsedUrlsData;
                isGeneratorMode = initialIsGeneratorMode;
                isEditModeActive = initialIsEditModeActive;
            } else {
                // Otherwise, load from localStorage (for the generator itself)
                loadWebsiteSettings();
                loadPages();
                loadUsedUrls();
                loadLogoUrl(); // Load custom logo on startup
            }

            loadPageContent(currentPageId); // Load the initial page (default to 'home')
            highlightCodeBlocks(); // Initial highlight
            renderMathFormulas(); // Initial math render
            applyModeAndEditState(); // Apply the stored mode and edit state on load
        });

        // Ensure sidebar is hidden/shown correctly on resize for mobile/desktop
        window.addEventListener('resize', () => {
            applyModeAndEditState(); // Re-apply state to handle sidebar visibility and main content margin
        });
