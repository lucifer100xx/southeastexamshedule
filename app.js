// SEU Super-Improved Exam Schedule Management System

class ExamScheduleApp {
    constructor() {
        this.examData = [];
        this.filteredData = [];
        this.selectedExams = new Set();
        this.isAdminLoggedIn = false;
        this.confirmCallback = null;
        
        // Sample data from provided JSON (initial data)
        this.sampleData = [
            {
                "Date": "2025-08-15",
                "Course_Code": "CSE265.15",
                "Course_Title": "Algorithm",
                "Faculty_Full": "Md. Anower Perves",
                "Faculty_Code": "AP",
                "Start_Time": "09:00:00",
                "End_Time": "10:30:00",
                "Students": 34,
                "Program": "D",
                "Slot": "Slot - K",
                "Search_Text": "cse265.15 algorithm md. anower perves ap"
            },
            {
                "Date": "2025-08-15",
                "Course_Code": "CSE343.8",
                "Course_Title": "Computer Architecture",
                "Faculty_Full": "Kazi Shahrier Rafid",
                "Faculty_Code": "KAZ",
                "Start_Time": "09:00:00",
                "End_Time": "10:30:00",
                "Students": 21,
                "Program": "D",
                "Slot": "Slot - K",
                "Search_Text": "cse343.8 computer architecture kazi shahrier rafid kaz"
            },
            {
                "Date": "2025-08-15",
                "Course_Code": "EEE181.16",
                "Course_Title": "Electrical Circuits Design I",
                "Faculty_Full": "Adib Md. Ridwan",
                "Faculty_Code": "ADMR",
                "Start_Time": "09:00:00",
                "End_Time": "10:30:00",
                "Students": 37,
                "Program": "D",
                "Slot": "Slot - K",
                "Search_Text": "eee181.16 electrical circuits design i adib md. ridwan admr"
            }
        ];
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Super-Improved SEU Exam Schedule App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            console.log('🔧 Starting application initialization...');
            
            // Load data first
            this.loadData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render
            this.renderExams();
            this.updateStats();
            this.updateResultsCount();
            this.updateStudentDashboard();
            
            // Check admin status
            this.checkAdminStatus();
            
            // Set up real-time sync
            this.setupRealtimeSync();
            
            // Ensure modals are properly hidden (but after DOM is ready)
            setTimeout(() => {
                this.hideAllModals();
            }, 100);
            
            console.log('✅ Application initialized successfully');
            console.log('📊 Exam data loaded:', this.examData.length, 'exams');
            
            this.showToast('Application loaded successfully!', 'success');
        } catch (error) {
            console.error('❌ Error initializing application:', error);
            this.showToast('Failed to initialize application. Please refresh the page.', 'error');
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('seu_exam_data');
            if (savedData) {
                this.examData = JSON.parse(savedData);
                console.log('📂 Loaded data from localStorage:', this.examData.length, 'exams');
            } else {
                this.examData = [...this.sampleData];
                this.saveData();
                console.log('🆕 Using sample data:', this.examData.length, 'exams');
            }
            this.filteredData = [...this.examData];
        } catch (error) {
            console.error('Error loading data:', error);
            this.examData = [...this.sampleData];
            this.filteredData = [...this.examData];
        }
    }

    saveData() {
        try {
            localStorage.setItem('seu_exam_data', JSON.stringify(this.examData));
            this.triggerDataUpdate();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    setupRealtimeSync() {
        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'seu_exam_data') {
                console.log('🔄 Data updated in another tab, syncing...');
                this.loadData();
                this.renderExams();
                this.updateStats();
                this.updateResultsCount();
                this.showToast('Data synced from another tab!', 'success');
            }
        });
        
        // Custom event for real-time updates
        document.addEventListener('dataUpdated', () => {
            this.loadData();
            this.renderExams();
            this.updateStats();
            this.updateResultsCount();
        });
    }

    triggerDataUpdate() {
        // Dispatch custom event for real-time sync
        document.dispatchEvent(new CustomEvent('dataUpdated'));
        
        // Also trigger storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'seu_exam_data',
            newValue: JSON.stringify(this.examData)
        }));
    }

    hideAllModals() {
        console.log('🙈 Hiding all modals...');
        const elements = ['loginModal', 'confirmModal', 'loadingOverlay', 'toast'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
                console.log(`Hidden element: ${id}`);
            }
        });
    }

    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            console.log('✓ Search input found, adding listeners');
            searchInput.addEventListener('input', (e) => {
                console.log('Search input:', e.target.value);
                this.handleSearch(e.target.value);
            });
            searchInput.addEventListener('keyup', (e) => {
                this.handleSearch(e.target.value);
            });
        } else {
            console.error('❌ Search input not found!');
        }

        // Clear search
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSearch();
            });
        }

        // Admin login/logout - Fixed with more robust event handling
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            console.log('✓ Admin login button found');
            adminLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔓 Admin login button clicked');
                this.showLoginModal();
            });
        } else {
            console.error('❌ Admin login button not found!');
        }
        
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Login modal controls
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideLoginModal();
            });
        }
        
        const cancelLoginBtn = document.getElementById('cancelLoginBtn');
        if (cancelLoginBtn) {
            cancelLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideLoginModal();
            });
        }
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Student dashboard
        const toggleDashboard = document.getElementById('toggleDashboard');
        if (toggleDashboard) {
            toggleDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDashboard();
            });
        }
        
        const clearSelectionsBtn = document.getElementById('clearSelectionsBtn');
        if (clearSelectionsBtn) {
            clearSelectionsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllSelections();
            });
        }
        
        const exportSelectedBtn = document.getElementById('exportSelectedBtn');
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportSelectedToPDF();
            });
        }

        // Confirmation modal
        const closeConfirmBtn = document.getElementById('closeConfirmBtn');
        if (closeConfirmBtn) {
            closeConfirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideConfirmModal();
            });
        }
        
        const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
        if (cancelConfirmBtn) {
            cancelConfirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideConfirmModal();
            });
        }
        
        const proceedConfirmBtn = document.getElementById('proceedConfirmBtn');
        if (proceedConfirmBtn) {
            proceedConfirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConfirmAction();
            });
        }

        // Toast close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toast__close')) {
                this.hideToast();
            }
        });

        // Modal overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__overlay')) {
                this.hideLoginModal();
                this.hideConfirmModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLoginModal();
                this.hideConfirmModal();
            }
        });
        
        // Setup admin event listeners with delegation
        this.setupAdminEventListeners();
        
        console.log('✅ All event listeners set up successfully');
    }

    setupAdminEventListeners() {
        // Use event delegation for admin buttons since they might be hidden initially
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clearDataBtn') {
                console.log('Clear data button clicked');
                e.preventDefault();
                this.confirmClearData();
            } else if (e.target.id === 'importBtn') {
                console.log('Import button clicked');
                e.preventDefault();
                this.handleFileImport();
            }
        });
    }

    handleSearch(query) {
        console.log('🔍 Handling search for:', query);
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredData = [...this.examData];
            console.log('Empty search - showing all exams:', this.filteredData.length);
        } else {
            this.filteredData = this.examData.filter(exam => {
                const matches = exam.Search_Text?.toLowerCase().includes(searchTerm) ||
                              exam.Course_Code.toLowerCase().includes(searchTerm) ||
                              exam.Course_Title.toLowerCase().includes(searchTerm) ||
                              exam.Faculty_Full.toLowerCase().includes(searchTerm) ||
                              exam.Faculty_Code.toLowerCase().includes(searchTerm);
                return matches;
            });
            console.log('Search results:', this.filteredData.length, 'exams found for:', searchTerm);
        }
        
        this.renderExams();
        this.updateResultsCount();
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.handleSearch('');
            this.showToast('Search cleared', 'success');
        }
    }

    renderExams() {
        const examGrid = document.getElementById('examGrid');
        if (!examGrid) {
            console.error('❌ Exam grid not found');
            return;
        }
        
        console.log('🎨 Rendering exams:', this.filteredData.length);
        
        if (this.filteredData.length === 0) {
            examGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                    <h3>No exams found</h3>
                    <p>Try adjusting your search criteria or import new data from the admin panel.</p>
                </div>
            `;
            return;
        }

        // Sort exams
        const sortedExams = [...this.filteredData].sort((a, b) => {
            const dateCompare = new Date(a.Date) - new Date(b.Date);
            if (dateCompare !== 0) return dateCompare;
            return a.Start_Time.localeCompare(b.Start_Time);
        });

        examGrid.innerHTML = sortedExams.map(exam => this.createExamCard(exam)).join('');
        
        // Add click listeners to exam cards
        this.setupExamCardListeners();
        
        console.log('✅ Exams rendered successfully');
    }

    createExamCard(exam) {
        const examId = `${exam.Course_Code}_${exam.Date}_${exam.Start_Time}`;
        const isSelected = this.selectedExams.has(examId);
        
        return `
            <div class="exam-card ${isSelected ? 'selected' : ''}" data-exam-id="${examId}" tabindex="0">
                <input type="checkbox" 
                       class="exam-card__checkbox" 
                       ${isSelected ? 'checked' : ''} 
                       data-exam-id="${examId}">
                       
                <div class="exam-card__header">
                    <div class="exam-card__date">${this.formatDate(exam.Date)}</div>
                    <div class="exam-card__time">${this.formatTime(exam.Start_Time)} - ${this.formatTime(exam.End_Time)}</div>
                </div>
                
                <div class="exam-card__content">
                    <div class="exam-card__course">
                        <div class="exam-card__course-code">${exam.Course_Code}</div>
                        <div class="exam-card__course-title">${exam.Course_Title}</div>
                        <div class="exam-card__faculty">
                            <span class="exam-card__faculty-code">[${exam.Faculty_Code}]</span> 
                            ${exam.Faculty_Full}
                        </div>
                    </div>
                    
                    <div class="exam-card__details">
                        <div class="exam-card__students">
                            <strong>${exam.Students}</strong> students
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupExamCardListeners() {
        console.log('🎯 Setting up exam card listeners...');
        
        // Handle checkbox changes
        document.querySelectorAll('.exam-card__checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                console.log('Checkbox changed:', e.target.dataset.examId, e.target.checked);
                this.toggleExamSelection(e.target.dataset.examId);
            });
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
            });
        });

        // Handle card clicks
        document.querySelectorAll('.exam-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on checkbox
                if (!e.target.classList.contains('exam-card__checkbox')) {
                    const checkbox = card.querySelector('.exam-card__checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        console.log('Card clicked, toggling selection:', card.dataset.examId, checkbox.checked);
                        this.toggleExamSelection(card.dataset.examId);
                    }
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const checkbox = card.querySelector('.exam-card__checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        this.toggleExamSelection(card.dataset.examId);
                    }
                }
            });
        });
        
        console.log('✅ Exam card listeners set up for', document.querySelectorAll('.exam-card').length, 'cards');
    }

    toggleExamSelection(examId) {
        console.log('🎯 Toggling exam selection:', examId);
        const exam = this.findExamById(examId);
        if (!exam) {
            console.error('Exam not found for ID:', examId);
            return;
        }

        if (this.selectedExams.has(examId)) {
            this.selectedExams.delete(examId);
            console.log('✅ Removed from selection:', examId);
        } else {
            this.selectedExams.add(examId);
            console.log('✅ Added to selection:', examId);
        }

        console.log('📊 Current selections:', Array.from(this.selectedExams));

        // Update UI immediately
        this.updateExamCardSelection(examId);
        this.updateStudentDashboard();
    }

    findExamById(examId) {
        return this.examData.find(exam => 
            `${exam.Course_Code}_${exam.Date}_${exam.Start_Time}` === examId
        );
    }

    updateExamCardSelection(examId) {
        const card = document.querySelector(`[data-exam-id="${examId}"]`);
        if (!card) return;

        const checkbox = card.querySelector('.exam-card__checkbox');
        const isSelected = this.selectedExams.has(examId);
        
        if (checkbox) {
            checkbox.checked = isSelected;
        }
        card.classList.toggle('selected', isSelected);
        
        console.log('🎨 Updated card UI for:', examId, 'selected:', isSelected);
    }

    updateStudentDashboard() {
        const selectedCount = document.getElementById('selectedCount');
        const selectedExams = document.getElementById('selectedExams');
        
        if (!selectedCount || !selectedExams) {
            console.error('❌ Dashboard elements not found');
            return;
        }

        const count = this.selectedExams.size;
        selectedCount.textContent = count;
        console.log('📊 Updated dashboard count:', count);

        if (count === 0) {
            selectedExams.innerHTML = `
                <div class="no-selection">
                    <p>Select individual course sections from the exam cards to build your schedule.</p>
                </div>
            `;
        } else {
            const examItems = Array.from(this.selectedExams)
                .map(examId => this.findExamById(examId))
                .filter(exam => exam)
                .sort((a, b) => {
                    const dateCompare = new Date(a.Date) - new Date(b.Date);
                    if (dateCompare !== 0) return dateCompare;
                    return a.Start_Time.localeCompare(b.Start_Time);
                });

            selectedExams.innerHTML = examItems.map(exam => {
                const examId = `${exam.Course_Code}_${exam.Date}_${exam.Start_Time}`;
                return `
                    <div class="selected-exam-item">
                        <button class="selected-exam-item__remove" data-exam-id="${examId}">&times;</button>
                        <div class="selected-exam-item__course">${exam.Course_Code}</div>
                        <div class="selected-exam-item__details">
                            ${this.formatDate(exam.Date)} • ${this.formatTime(exam.Start_Time)}<br>
                            ${exam.Faculty_Code} - ${exam.Students} students
                        </div>
                    </div>
                `;
            }).join('');

            // Add remove listeners
            selectedExams.querySelectorAll('.selected-exam-item__remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleExamSelection(btn.dataset.examId);
                });
            });
        }
        
        console.log('✅ Student dashboard updated');
    }

    clearAllSelections() {
        this.selectedExams.clear();
        
        // Update all checkboxes
        document.querySelectorAll('.exam-card__checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update all cards
        document.querySelectorAll('.exam-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.updateStudentDashboard();
        this.showToast('All selections cleared', 'success');
    }

    toggleDashboard() {
        const dashboard = document.getElementById('studentDashboard');
        const content = document.getElementById('dashboardContent');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    updateResultsCount() {
        const count = this.filteredData.length;
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${count} exam${count !== 1 ? 's' : ''} found`;
        }
    }

    // Admin Functions
    showLoginModal() {
        console.log('🔓 Showing login modal...');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('hidden');
            console.log('✅ Login modal should now be visible');
            
            // Focus on username field
            setTimeout(() => {
                const usernameField = document.getElementById('username');
                if (usernameField) {
                    usernameField.focus();
                    usernameField.value = ''; // Clear any existing value
                }
            }, 100);
        } else {
            console.error('❌ Login modal element not found!');
        }
    }

    hideLoginModal() {
        console.log('🙈 Hiding login modal...');
        const loginModal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        if (loginForm) {
            loginForm.reset();
        }
    }

    handleLogin() {
        console.log('🔐 Handling login...');
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        
        console.log('Login attempt:', { username: username, password: '***' });
        
        if (username === 'admin' && password === '282028') {
            console.log('✅ Login successful');
            this.isAdminLoggedIn = true;
            this.hideLoginModal();
            this.showAdminPanel();
            this.showToast('Login successful! Welcome, Admin.', 'success');
        } else {
            console.log('❌ Login failed');
            this.showToast('Invalid username or password!', 'error');
        }
    }

    logout() {
        console.log('👋 Logging out...');
        this.isAdminLoggedIn = false;
        this.hideAdminPanel();
        this.showToast('Logged out successfully.', 'success');
    }

    showAdminPanel() {
        console.log('👑 Showing admin panel...');
        const adminPanel = document.getElementById('adminPanel');
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        
        if (adminPanel) adminPanel.classList.remove('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.add('hidden');
        if (adminLogoutBtn) adminLogoutBtn.classList.remove('hidden');
        
        console.log('✅ Admin panel should now be visible');
    }

    hideAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        
        if (adminPanel) adminPanel.classList.add('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.remove('hidden');
        if (adminLogoutBtn) adminLogoutBtn.classList.add('hidden');
    }

    checkAdminStatus() {
        if (this.isAdminLoggedIn) {
            this.showAdminPanel();
        } else {
            this.hideAdminPanel();
        }
    }

    // Data Management
    confirmClearData() {
        console.log('🗑️ Confirming data clear...');
        this.showConfirmModal(
            'Clear All Data',
            'Are you sure you want to delete all exam data? This action cannot be undone.',
            () => this.clearAllData()
        );
    }

    clearAllData() {
        console.log('🗑️ Clearing all data...');
        this.showLoading('Clearing all data...');
        
        setTimeout(() => {
            this.examData = [];
            this.filteredData = [];
            this.selectedExams.clear();
            this.saveData();
            
            this.renderExams();
            this.updateStats();
            this.updateResultsCount();
            this.updateStudentDashboard();
            
            this.hideLoading();
            this.showToast('All data cleared successfully!', 'success');
            console.log('✅ All data cleared - UI updated');
        }, 1000);
    }

    async handleFileImport() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput?.files[0];

        if (!file) {
            this.showToast('Please select an Excel file to import.', 'warning');
            return;
        }

        if (!this.isValidExcelFile(file)) {
            this.showToast('Please select a valid Excel file (.xlsx or .xls).', 'error');
            return;
        }

        try {
            this.showLoading('Reading Excel file...');
            this.showUploadProgress(0);
            
            const data = await this.readExcelFile(file);
            
            this.showUploadProgress(50);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const parsedData = this.parseExcelData(data);
            
            this.showUploadProgress(75);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (parsedData.length === 0) {
                throw new Error('No valid exam data found in the file');
            }

            // Replace existing data
            this.examData = parsedData;
            this.filteredData = [...this.examData];
            this.selectedExams.clear();
            this.saveData();
            
            this.showUploadProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update UI
            this.renderExams();
            this.updateStats();
            this.updateResultsCount();
            this.updateStudentDashboard();
            
            // Clear file input
            fileInput.value = '';
            
            this.hideLoading();
            this.hideUploadProgress();
            this.showToast(`Successfully imported ${parsedData.length} exams!`, 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            this.hideLoading();
            this.hideUploadProgress();
            this.showToast(`Import failed: ${error.message}`, 'error');
        }
    }

    isValidExcelFile(file) {
        return file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               file.type === 'application/vnd.ms-excel' ||
               file.name.toLowerCase().endsWith('.xlsx') ||
               file.name.toLowerCase().endsWith('.xls');
    }

    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Failed to read Excel file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    parseExcelData(rawData) {
        const parsedData = [];
        
        rawData.forEach((row, index) => {
            try {
                // Expected columns: Program, Slot, Date, Start Time, End Time, Course Code, Course Title, Students, Faculty
                const courseCode = row['Course Code'] || row['Course_Code'] || '';
                const courseTitle = row['Course Title'] || row['Course_Title'] || '';
                const faculty = row['Faculty'] || '';
                const date = this.parseDate(row['Date'] || '');
                const startTime = this.parseTime(row['Start Time'] || row['Start_Time'] || '');
                const endTime = this.parseTime(row['End Time'] || row['End_Time'] || '');
                const students = parseInt(row['Students'] || 0);
                
                if (!courseCode || !courseTitle || !date || !startTime) {
                    console.warn(`Skipping row ${index + 1}: missing required data`);
                    return;
                }

                // Parse faculty (handle [CODE] Name format)
                const facultyMatch = faculty.match(/\[([^\]]+)\]\s*(.+)/);
                const facultyCode = facultyMatch ? facultyMatch[1] : '';
                const facultyFull = facultyMatch ? facultyMatch[2] : faculty;

                const examData = {
                    Date: date,
                    Course_Code: courseCode,
                    Course_Title: courseTitle,
                    Faculty_Full: facultyFull,
                    Faculty_Code: facultyCode,
                    Start_Time: startTime,
                    End_Time: endTime,
                    Students: students,
                    Program: row['Program'] || '',
                    Slot: row['Slot'] || '',
                    Search_Text: `${courseCode} ${courseTitle} ${facultyFull} ${facultyCode}`.toLowerCase()
                };
                
                parsedData.push(examData);
            } catch (error) {
                console.warn(`Error parsing row ${index + 1}:`, error);
            }
        });
        
        console.log(`Parsed ${parsedData.length} exams from ${rawData.length} rows`);
        return parsedData;
    }

    parseDate(dateValue) {
        if (!dateValue) return '';
        
        try {
            // Handle DD.MM.YYYY format
            if (typeof dateValue === 'string' && dateValue.includes('.')) {
                const [day, month, year] = dateValue.split('.');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            // Handle Excel date numbers
            if (typeof dateValue === 'number') {
                const date = XLSX.SSF.parse_date_code(dateValue);
                const year = date.y;
                const month = String(date.m).padStart(2, '0');
                const day = String(date.d).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            
            // Handle other formats
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Error parsing date:', dateValue, error);
            return '';
        }
    }

    parseTime(timeValue) {
        if (!timeValue) return '';
        
        try {
            if (typeof timeValue === 'string') {
                // Handle HH:MM format
                if (timeValue.includes(':')) {
                    const [hours, minutes] = timeValue.split(':');
                    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
                }
            }
            
            // Handle Excel time numbers
            if (typeof timeValue === 'number') {
                const totalMinutes = Math.round(timeValue * 24 * 60);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            }
            
            return '';
        } catch (error) {
            console.warn('Error parsing time:', timeValue, error);
            return '';
        }
    }

    showUploadProgress(percent) {
        const progress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progress) progress.classList.remove('hidden');
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
    }

    hideUploadProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) progress.classList.add('hidden');
    }

    updateStats() {
        const totalExams = this.examData.length;
        const uniqueDates = new Set(this.examData.map(exam => exam.Date)).size;
        const uniqueCourses = new Set(this.examData.map(exam => exam.Course_Code.split('.')[0])).size;
        
        const totalExamsEl = document.getElementById('totalExams');
        const totalDatesEl = document.getElementById('totalDates');
        const totalCoursesEl = document.getElementById('totalCourses');
        
        if (totalExamsEl) totalExamsEl.textContent = totalExams;
        if (totalDatesEl) totalDatesEl.textContent = uniqueDates;
        if (totalCoursesEl) totalCoursesEl.textContent = uniqueCourses;
    }

    // PDF Export
    exportSelectedToPDF() {
        if (this.selectedExams.size === 0) {
            this.showToast('Please select at least one exam to export.', 'warning');
            return;
        }

        if (typeof window.jspdf === 'undefined') {
            this.showToast('PDF library not loaded. Please refresh and try again.', 'error');
            return;
        }

        this.showLoading('Generating PDF...');
        
        setTimeout(() => {
            try {
                this.generateSelectedExamsPDF();
                this.hideLoading();
                this.showToast('PDF exported successfully!', 'success');
            } catch (error) {
                console.error('PDF generation error:', error);
                this.hideLoading();
                this.showToast('Error generating PDF. Please try again.', 'error');
            }
        }, 1000);
    }

    generateSelectedExamsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(33, 128, 141);
        doc.text('Southeast University (SEU)', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('My Selected Exam Schedule', 20, 30);
        
        // Get selected exams
        const selectedExamData = Array.from(this.selectedExams)
            .map(examId => this.findExamById(examId))
            .filter(exam => exam)
            .sort((a, b) => {
                const dateCompare = new Date(a.Date) - new Date(b.Date);
                if (dateCompare !== 0) return dateCompare;
                return a.Start_Time.localeCompare(b.Start_Time);
            });

        let yPosition = 50;
        let currentDate = '';

        selectedExamData.forEach(exam => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            // Date header
            if (exam.Date !== currentDate) {
                currentDate = exam.Date;
                doc.setFontSize(14);
                doc.setTextColor(33, 128, 141);
                doc.text(`${this.formatDate(exam.Date)}`, 20, yPosition);
                yPosition += 10;
                
                doc.setDrawColor(33, 128, 141);
                doc.line(20, yPosition - 2, 190, yPosition - 2);
                yPosition += 5;
            }

            // Exam details
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            doc.setFont(undefined, 'bold');
            doc.text(`${exam.Course_Code}`, 20, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(`${exam.Course_Title}`, 60, yPosition);
            
            yPosition += 5;
            
            doc.text(`Time: ${this.formatTime(exam.Start_Time)} - ${this.formatTime(exam.End_Time)}`, 20, yPosition);
            doc.text(`Students: ${exam.Students}`, 120, yPosition);
            
            yPosition += 5;
            
            doc.text(`Faculty: [${exam.Faculty_Code}] ${exam.Faculty_Full}`, 20, yPosition);
            
            yPosition += 10;
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`, 20, 290);
            doc.text(`Total Selected Exams: ${selectedExamData.length}`, 120, 290);
        }

        const fileName = `SEU_My_Exam_Schedule_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    // Modal Functions
    showConfirmModal(title, message, callback) {
        console.log('❓ Showing confirm modal:', title);
        const confirmModal = document.getElementById('confirmModal');
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        
        if (confirmModal && confirmTitle && confirmMessage) {
            confirmTitle.textContent = title;
            confirmMessage.textContent = message;
            confirmModal.classList.remove('hidden');
            this.confirmCallback = callback;
            console.log('✅ Confirm modal shown with callback:', typeof callback);
        } else {
            console.error('❌ Confirm modal elements not found');
        }
    }

    hideConfirmModal() {
        console.log('🙈 Hiding confirm modal');
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            confirmModal.classList.add('hidden');
            this.confirmCallback = null;
        }
    }

    handleConfirmAction() {
        console.log('✅ Confirm action triggered, callback:', typeof this.confirmCallback);
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.hideConfirmModal();
    }

    showLoading(text = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        if (loadingText) loadingText.textContent = text;
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const messageEl = toast?.querySelector('.toast__message');
        
        if (!toast || !messageEl) return;
        
        messageEl.textContent = message;
        
        toast.classList.remove('toast--success', 'toast--error', 'toast--warning');
        toast.classList.add(`toast--${type}`);
        toast.classList.remove('hidden');
        
        setTimeout(() => this.hideToast(), 4000);
    }

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.add('hidden');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Starting SEU Super-Improved Exam Schedule Management System');
    try {
        window.examApp = new ExamScheduleApp();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});