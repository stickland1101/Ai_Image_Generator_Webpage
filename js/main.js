// Main JavaScript file for AI Image Generator

// Utility function to encrypt API key
function encryptApiKey(apiKey) {
    // Simple encryption for demo purposes
    // In a real app, use a more secure encryption method
    return btoa(apiKey.split('').reverse().join(''));
}

// Utility function to decrypt API key
function decryptApiKey(encryptedKey) {
    // Simple decryption for demo purposes
    return atob(encryptedKey).split('').reverse().join('');
}

// Configuration variables
let encryptedApiKey = '';
let API_CONFIG = {
    url: '',
    defaultModel: '',
    defaultSize: '',
    defaultSteps: 20,
    defaultGuidance: 7.5
};

// Default settings
let DEFAULT_SETTINGS = {
    guidanceScale: 7.5,
    steps: 20
};

// Load configuration using XMLHttpRequest (more compatible with local files)
function loadConfigXHR(path) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', path, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const config = JSON.parse(xhr.responseText);
                    resolve(config);
                } catch (e) {
                    reject(new Error('Invalid JSON in config file'));
                }
            } else {
                reject(new Error(`Failed to load config with status: ${xhr.status}`));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('XHR error when loading config'));
        };
        
        xhr.send();
    });
}

// Load configuration from config.json
async function loadConfig() {
    try {
        // Try different possible paths to find the config file
        const possiblePaths = ['./config.json', '../config.json', 'config.json', '/config.json'];
        
        // First try XMLHttpRequest which often works better with local files
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load config with XHR from: ${path}`);
                const config = await loadConfigXHR(path);
                console.log(`Successfully loaded config from: ${path} using XHR`);
                
                // Set API key
                encryptedApiKey = encryptApiKey(config.api.key);
                
                // Set API configuration
                API_CONFIG = {
                    url: config.api.url,
                    defaultModel: config.defaults.model,
                    defaultSize: config.defaults.size,
                    defaultSteps: config.defaults.steps,
                    defaultGuidance: config.defaults.guidanceScale
                };
                
                // Set default settings
                DEFAULT_SETTINGS = {
                    guidanceScale: config.defaults.guidanceScale,
                    steps: config.defaults.steps
                };
                
                console.log('Configuration loaded successfully via XHR');
                return true;
            } catch (e) {
                console.log(`XHR path ${path} failed: ${e.message}`);
            }
        }
        
        // If XHR failed, try fetch as a backup
        let response;
        for (const path of possiblePaths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    console.log(`Successfully loaded config from: ${path} using fetch`);
                    break; // Found a working path
                }
            } catch (e) {
                console.log(`Fetch path ${path} failed, trying another...`);
            }
        }
        
        let config;
        
        if (!response || !response.ok) {
            console.warn('Could not load config.json from any path, using fallback configuration');
            
            // Use the window.FALLBACK_CONFIG if available
            if (window.FALLBACK_CONFIG) {
                console.log('Using window.FALLBACK_CONFIG');
                config = window.FALLBACK_CONFIG;
            } else {
                // Hardcoded fallback if window.FALLBACK_CONFIG is not available
                config = {
                    "api": {
                        "key": "you-api-key",
                        "url": "https://api.siliconflow.cn/v1/images/generations"
                    },
                    "defaults": {
                        "model": "Kwai-Kolors/Kolors",
                        "size": "1024x1024",
                        "steps": 20,
                        "guidanceScale": 7.5
                    }
                };
            }
        } else {
            config = await response.json();
        }
        
        // Set API key
        encryptedApiKey = encryptApiKey(config.api.key);
        
        // Set API configuration
        API_CONFIG = {
            url: config.api.url,
            defaultModel: config.defaults.model,
            defaultSize: config.defaults.size,
            defaultSteps: config.defaults.steps,
            defaultGuidance: config.defaults.guidanceScale
        };
        
        // Set default settings
        DEFAULT_SETTINGS = {
            guidanceScale: config.defaults.guidanceScale,
            steps: config.defaults.steps
        };
        
        console.log('Configuration loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading configuration:', error);
        
        // Use window.FALLBACK_CONFIG as last resort
        try {
            let config;
            
            if (window.FALLBACK_CONFIG) {
                console.log('Using window.FALLBACK_CONFIG as last resort');
                config = window.FALLBACK_CONFIG;
            } else {
                // Hardcoded fallback if window.FALLBACK_CONFIG is not available
                console.log('Using hardcoded fallback configuration');
                config = {
                    "api": {
                        "key": "sk-dpnfshwocohzguprveptececcpahmpaahqlcwfiibhcvkrmw",
                        "url": "https://api.siliconflow.cn/v1/images/generations"
                    },
                    "defaults": {
                        "model": "Kwai-Kolors/Kolors",
                        "size": "1024x1024",
                        "steps": 20,
                        "guidanceScale": 7.5
                    }
                };
            }
            
            // Set API key
            encryptedApiKey = encryptApiKey(config.api.key);
            
            // Set API configuration
            API_CONFIG = {
                url: config.api.url,
                defaultModel: config.defaults.model,
                defaultSize: config.defaults.size,
                defaultSteps: config.defaults.steps,
                defaultGuidance: config.defaults.guidanceScale
            };
            
            // Set default settings
            DEFAULT_SETTINGS = {
                guidanceScale: config.defaults.guidanceScale,
                steps: config.defaults.steps
            };
            
            return true;
        } catch (e) {
            console.error('Even fallback configuration failed:', e);
            return false;
        }
    }
}

// Sample prompts for random button
const SAMPLE_PROMPTS = [
    "A surreal landscape with floating islands and waterfalls",
    "Cyberpunk city at night with neon lights and flying cars",
    "Fantasy forest with magical creatures and glowing plants",
    "Abstract digital art with vibrant colors and geometric shapes",
    "Underwater city with futuristic architecture and sea creatures",
    "Space station orbiting a colorful nebula with distant planets",
    "Medieval castle on a mountain with dragons flying overhead",
    "Steampunk airship flying through clouds at sunset",
    "Crystal cave with glowing minerals and underground lake",
    "Futuristic cityscape with holographic billboards and flying vehicles"
];

// DOM Elements
document.addEventListener('DOMContentLoaded', async function() {
    // Load configuration first
    await loadConfig();
    
    // Check which page we're on
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const isGeneratePage = window.location.pathname.includes('generate.html');
    
    // Update counters on both pages
    updateCounters();
    
    if (isIndexPage) {
        // Increment visit counter on index page
        incrementVisitCounter();
        initIndexPage();
    } else if (isGeneratePage) {
        initGeneratePage();
    }
});

// Initialize Index Page
function initIndexPage() {
    const promptForm = document.getElementById('promptForm');
    const promptInput = document.getElementById('promptInput');
    
    if (promptForm) {
        promptForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const prompt = promptInput.value.trim();
            if (prompt) {
                // Store the prompt in localStorage to use it on the generate page
                localStorage.setItem('initialPrompt', prompt);
                
                // Redirect to generate page
                window.location.href = 'generate.html';
            }
        });
    }
}

// Initialize Generate Page
function initGeneratePage() {
    // Get elements
    const promptTextarea = document.getElementById('promptTextarea');
    const negativePromptTextarea = document.getElementById('negativePromptTextarea');
    const promptEditorForm = document.getElementById('promptEditorForm');
    const loadingAnimation = document.getElementById('loading-animation');
    const previewImage = document.getElementById('preview-image');
    const webglCanvas = document.getElementById('webgl-canvas');
    const downloadBtn = document.getElementById('download-preview-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const closeFullscreenBtn = document.getElementById('close-fullscreen');
    const randomPromptBtn = document.getElementById('random-prompt-btn');
    const downloadInstruction = document.getElementById('download-instruction');
    const fullscreenDownloadBtn = document.getElementById('fullscreen-download-btn');
    
    // Update counters on page load
    updateCounters();
    
    // Setup fullscreen button
    if (fullscreenBtn && fullscreenModal && closeFullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            const currentImage = previewImage.src;
            if (currentImage) {
                fullscreenImage.src = currentImage;
                fullscreenModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
        
        closeFullscreenBtn.addEventListener('click', function() {
            fullscreenModal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        });
        
        // Close fullscreen on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !fullscreenModal.classList.contains('hidden')) {
                fullscreenModal.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
        
        // Setup fullscreen download button
        if (fullscreenDownloadBtn) {
            fullscreenDownloadBtn.addEventListener('click', function() {
                const currentImage = fullscreenImage.src;
                if (currentImage) {
                    downloadImage(currentImage, 'ai-generated-image.png');
                }
            });
        }
    }
    
    // Setup download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const currentImage = previewImage.src;
            if (currentImage) {
                downloadImage(currentImage, 'ai-generated-image.png');
            }
        });
    }
    
    // Setup right-click context menu for preview image
    if (previewImage) {
        previewImage.addEventListener('contextmenu', function(e) {
            // Show the download instruction briefly when user right-clicks
            if (downloadInstruction) {
                downloadInstruction.classList.remove('hidden');
                setTimeout(() => {
                    downloadInstruction.classList.add('hidden');
                }, 3000); // Hide after 3 seconds
            }
        });
    }
    
    // Setup random prompt button
    if (randomPromptBtn && promptTextarea) {
        randomPromptBtn.addEventListener('click', function() {
            const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
            promptTextarea.value = SAMPLE_PROMPTS[randomIndex];
        });
    }
    
    // Get initial prompt from localStorage if available
    const initialPrompt = localStorage.getItem('initialPrompt');
    if (initialPrompt && promptTextarea) {
        promptTextarea.value = initialPrompt;
        // Clear it after use
        localStorage.removeItem('initialPrompt');
        
        // Auto-generate on page load if we have an initial prompt
        generateImage(initialPrompt);
    } else {
        // Load history from localStorage
        loadHistoryFromLocalStorage();
    }
    
    // Setup form submission
    if (promptEditorForm) {
        promptEditorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const prompt = promptTextarea.value.trim();
            const negativePrompt = negativePromptTextarea.value.trim();
            
            if (prompt) {
                generateImage(prompt, negativePrompt);
            }
        });
    }
    
    // Setup prompt suggestion clicks
    const suggestionElements = document.querySelectorAll('.mb-6 .space-y-2 div');
    suggestionElements.forEach(element => {
        element.addEventListener('click', function() {
            const suggestion = this.querySelector('p').textContent;
            if (promptTextarea.value.trim()) {
                promptTextarea.value += ', ' + suggestion;
            } else {
                promptTextarea.value = suggestion;
            }
        });
    });
    
    // Initialize WebGL background effect
    initWebGL();
    
    // Handle fullscreen image display
    handleFullscreenImage();
}

// Generate image function
async function generateImage(prompt, negativePrompt = '') {
    // Show loading animation
    const loadingAnimation = document.getElementById('loading-animation');
    const previewImage = document.getElementById('preview-image');
    
    if (loadingAnimation) loadingAnimation.classList.remove('hidden');
    if (previewImage) previewImage.classList.add('hidden');
    
    try {
        // Get settings from UI
        const imageSize = document.getElementById('resolution-select')?.value || API_CONFIG.defaultSize;
        
        // Prepare request body
        const requestBody = {
            model: API_CONFIG.defaultModel,
            prompt: prompt,
            negative_prompt: negativePrompt,
            image_size: imageSize,
            batch_size: 1,
            seed: Math.floor(Math.random() * 4999999999),
            num_inference_steps: DEFAULT_SETTINGS.steps,
            guidance_scale: DEFAULT_SETTINGS.guidanceScale
        };
        
        // API call options
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${decryptApiKey(encryptedApiKey)}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };
        
        // Make API call
        const response = await fetch(API_CONFIG.url, options);
        const data = await response.json();
        
        // Handle response
        if (data && data.data && data.data.length > 0) {
            const imageUrl = data.data[0].url;
            displayGeneratedImage(imageUrl);
            addToHistory(imageUrl, prompt);
            incrementImageCounter();
        } else {
            throw new Error('No image data received');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
    } finally {
        // Hide loading animation
        if (loadingAnimation) loadingAnimation.classList.add('hidden');
    }
}

// Display the generated image
function displayGeneratedImage(imageUrl) {
    const previewImage = document.getElementById('preview-image');
    const previewContainer = document.getElementById('preview-container');
    
    if (previewImage) {
        // 设置图片源
        previewImage.src = imageUrl;
        
        // 显示图片
        previewImage.classList.remove('hidden');
        previewImage.classList.add('animate-fade-in');
        
        // 确保图片适应容器大小
        previewImage.onload = function() {
            // 检查图片尺寸
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;
            const containerWidth = previewContainer ? previewContainer.clientWidth : window.innerWidth;
            const containerHeight = previewContainer ? previewContainer.clientHeight : window.innerHeight;
            
            // 计算图片的宽高比
            const imgRatio = imgWidth / imgHeight;
            const containerRatio = containerWidth / containerHeight;
            
            // 根据宽高比决定如何调整图片大小
            if (imgRatio > containerRatio) {
                // 图片更宽，以宽度为基准
                previewImage.style.width = '100%';
                previewImage.style.height = 'auto';
            } else {
                // 图片更高，以高度为基准
                previewImage.style.width = 'auto';
                previewImage.style.height = '100%';
            }
            
            // 在移动设备上进一步限制图片大小
            if (window.innerWidth <= 768) {
                previewImage.style.maxWidth = '95%';
                previewImage.style.maxHeight = '95%';
                
                // 如果在移动设备上，切换到预览标签
                const previewTabButton = document.querySelector('.tab-button[data-target="preview-section"]');
                if (previewTabButton) {
                    previewTabButton.click();
                }
            }
        };
    }
}

// Add to history gallery
function addToHistory(imageUrl, prompt) {
    const historyGrid = document.getElementById('history-grid');
    
    if (historyGrid) {
        // Create new history item
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item group';
        
        historyItem.innerHTML = `
            <div class="relative rounded-lg overflow-hidden">
                <img src="${imageUrl}" class="w-full aspect-square object-cover" alt="Generated image">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div class="flex space-x-2">
                        <button class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition edit-btn">
                            <i class="fas fa-edit text-white"></i>
                        </button>
                        <button class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition download-btn">
                            <i class="fas fa-download text-white"></i>
                        </button>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-400 mt-2 truncate">${prompt}</p>
        `;
        
        // Add to the beginning of the grid
        historyGrid.insertBefore(historyItem, historyGrid.firstChild);
        
        // Setup download button
        const downloadBtn = historyItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            downloadImage(imageUrl, 'ai-generated-image.png');
        });
        
        // Setup edit button
        const editBtn = historyItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const promptTextarea = document.getElementById('promptTextarea');
            if (promptTextarea) {
                promptTextarea.value = prompt;
                // Scroll to the prompt editor
                promptTextarea.scrollIntoView({ behavior: 'smooth' });
                promptTextarea.focus();
            }
        });
        
        // Make the whole item clickable to show in fullscreen
        historyItem.addEventListener('click', function() {
            const fullscreenModal = document.getElementById('fullscreen-modal');
            const fullscreenImage = document.getElementById('fullscreen-image');
            
            if (fullscreenModal && fullscreenImage) {
                fullscreenImage.src = imageUrl;
                fullscreenModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
    }
    
    // Save to localStorage for persistence
    saveToLocalStorage(imageUrl, prompt);
}

// Save generated image to localStorage
function saveToLocalStorage(imageUrl, prompt) {
    // Get existing history
    let history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
    
    // Add new item
    history.unshift({
        imageUrl,
        prompt,
        timestamp: new Date().toISOString()
    });
    
    // Limit history to 20 items
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Save back to localStorage
    localStorage.setItem('imageHistory', JSON.stringify(history));
}

// Load history from localStorage
function loadHistoryFromLocalStorage() {
    const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
    
    history.forEach(item => {
        addToHistory(item.imageUrl, item.prompt);
    });
}

// Download image function - Fixed to handle CORS issues
function downloadImage(url, filename) {
    try {
        // Method 1: Direct download using anchor element
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.target = '_blank'; // Open in new tab if download fails
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download initiated for:', url);
    } catch (error) {
        console.error('Error with direct download:', error);
        tryCanvasDownload(url, filename);
    }
    
    // Show download instruction as a fallback
    const downloadInstruction = document.getElementById('download-instruction');
    if (downloadInstruction) {
        downloadInstruction.classList.remove('hidden');
        setTimeout(() => {
            downloadInstruction.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }
}

// Fallback method using canvas to download images
function tryCanvasDownload(url, filename) {
    console.log('Trying canvas download method for:', url);
    
    // Create an image element to load the image
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Try to request CORS access
    
    img.onload = function() {
        try {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convert canvas to data URL and download
            try {
                // Try to get the data URL
                const dataURL = canvas.toDataURL('image/png');
                
                // Create download link
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Canvas download successful');
            } catch (e) {
                console.error('Canvas toDataURL error (likely CORS):', e);
                showDownloadError();
            }
        } catch (e) {
            console.error('Canvas drawing error:', e);
            showDownloadError();
        }
    };
    
    img.onerror = function() {
        console.error('Error loading image for canvas method');
        showDownloadError();
    };
    
    // Set the source of the image
    img.src = url;
}

// Show download error message to user
function showDownloadError() {
    const downloadInstruction = document.getElementById('download-instruction');
    if (downloadInstruction) {
        downloadInstruction.classList.remove('hidden');
        setTimeout(() => {
            downloadInstruction.classList.add('hidden');
        }, 8000); // Show for longer (8 seconds) since this is an error case
    } else {
        alert('Unable to download image due to cross-origin restrictions. Right-click on the image and select "Save image as..." instead.');
    }
}

// WebGL initialization for real-time preview (placeholder)
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;
    
    // This is a placeholder for WebGL initialization
    // In a real app, you would set up a WebGL context and shaders here
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.warn('WebGL not supported, falling back to image preview');
        return;
    }
    
    // Basic WebGL setup
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Initialize WebGL when the page loads
window.addEventListener('load', initWebGL);

// 处理全屏模式下的图片显示
function handleFullscreenImage() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const closeFullscreenBtn = document.getElementById('close-fullscreen');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const previewImage = document.getElementById('preview-image');
    const fullscreenDownloadBtn = document.getElementById('fullscreen-download-btn');
    
    if (fullscreenBtn && fullscreenModal && closeFullscreenBtn && fullscreenImage && previewImage) {
        // 点击全屏按钮
        fullscreenBtn.addEventListener('click', function() {
            if (previewImage.src && !previewImage.classList.contains('hidden')) {
                // 设置全屏图片源
                fullscreenImage.src = previewImage.src;
                
                // 显示全屏模态框
                fullscreenModal.classList.remove('hidden');
                
                // 禁止背景滚动
                document.body.style.overflow = 'hidden';
                
                // 确保图片适应屏幕大小
                fullscreenImage.onload = function() {
                    // 检查图片尺寸
                    const imgWidth = this.naturalWidth;
                    const imgHeight = this.naturalHeight;
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 计算图片的宽高比
                    const imgRatio = imgWidth / imgHeight;
                    const screenRatio = screenWidth / screenHeight;
                    
                    // 根据宽高比决定如何调整图片大小
                    if (imgRatio > screenRatio) {
                        // 图片更宽，以宽度为基准
                        fullscreenImage.style.width = '90vw';
                        fullscreenImage.style.height = 'auto';
                    } else {
                        // 图片更高，以高度为基准
                        fullscreenImage.style.width = 'auto';
                        fullscreenImage.style.height = '85vh';
                    }
                    
                    // 在移动设备上进一步限制图片大小
                    if (window.innerWidth <= 768) {
                        fullscreenImage.style.maxWidth = '95vw';
                        fullscreenImage.style.maxHeight = '80vh';
                    }
                };
            }
        });
        
        // 点击关闭按钮
        closeFullscreenBtn.addEventListener('click', function() {
            // 隐藏全屏模态框
            fullscreenModal.classList.add('hidden');
            
            // 恢复背景滚动
            document.body.style.overflow = '';
        });
        
        // 按ESC键关闭全屏
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !fullscreenModal.classList.contains('hidden')) {
                fullscreenModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
        
        // 全屏下载按钮
        if (fullscreenDownloadBtn) {
            fullscreenDownloadBtn.addEventListener('click', function() {
                if (fullscreenImage && fullscreenImage.src) {
                    downloadImage(fullscreenImage.src, 'ai-generated-image.png');
                }
            });
        }
    }
}

// Function to increment visit counter
function incrementVisitCounter() {
    let visits = parseInt(localStorage.getItem('totalVisits') || '0');
    visits++;
    localStorage.setItem('totalVisits', visits.toString());
    updateCounters();
}

// Function to increment image generation counter
function incrementImageCounter() {
    let images = parseInt(localStorage.getItem('totalImagesGenerated') || '0');
    images++;
    localStorage.setItem('totalImagesGenerated', images.toString());
    updateCounters();
}

// Function to update counter displays
function updateCounters() {
    const visitCounter = document.getElementById('visitCounter');
    const imageCounter = document.getElementById('imageCounter');
    
    const visits = localStorage.getItem('totalVisits') || '0';
    const images = localStorage.getItem('totalImagesGenerated') || '0';
    
    if (visitCounter) {
        visitCounter.textContent = `Total Visits: ${visits}`;
    }
    
    if (imageCounter) {
        imageCounter.textContent = `Total Images Generated: ${images}`;
    }
} 
