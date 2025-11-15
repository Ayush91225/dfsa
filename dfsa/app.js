document.addEventListener('alpine:init', () => {
    Alpine.data('sidebarManager', () => ({
        leftSidebarOpen: window.innerWidth > 1024,
        rightSidebarOpen: window.innerWidth > 1024,
        isMobile: window.innerWidth <= 1024,
        searchQuery: '',
        showShimmer: true,
        selectedChapter: null,
        contentLoading: false,
        chapterContent: null,
        units: [
            { name: 'Thermodynamics', emoji: '🌡️', active: false, chId: 'ch001' },
            { name: 'Solid-state chemistry', emoji: '🔷', active: false, chId: 'ch002' },
            { name: 'Solutions', emoji: '🧪', active: false, chId: 'ch003' },
            { name: 'Electrochemistry', emoji: '⚡', active: false, chId: 'ch004' },
            { name: 'Chemical kinetics', emoji: '⏱️', active: false, chId: 'ch005' },
            { name: 'Surface chemistry', emoji: '🌊', active: false, chId: 'ch006' },
            { name: 'The p block elements', emoji: '⚛️', active: false, chId: 'ch007' },
            { name: 'D and f-block elements', emoji: '🔬', active: false, chId: 'ch008' },
            { name: 'Coordination complex', emoji: '🧬', active: false, chId: 'ch009' },
            { name: 'Haloalkanes and Haloarenes', emoji: '💧', active: false, chId: 'ch010' },
            { name: 'Alcohols phenols and ethers', emoji: '🍷', active: false, chId: 'ch011' },
            { name: 'Aldehydes, ketones and carboxylic acids', emoji: '🧫', active: false, chId: 'ch012' },
            { name: 'Amines', emoji: '🌿', active: false, chId: 'ch013' },
            { name: 'Biomolecules', emoji: '🧬', active: false, chId: 'ch014' },
            { name: 'Polymer', emoji: '🔗', active: false, chId: 'ch015' },
            { name: 'Chemistry in everyday life', emoji: '❤️', active: false, chId: 'ch016' }
        ],

        init() {
            this.checkMobile();
            this.setDefaultState();
            this.loadSelectedChapter();
            setTimeout(() => {
                this.showShimmer = false;
            }, 1000);
            window.addEventListener('resize', () => {
                const wasMobile = this.isMobile;
                this.checkMobile();
                if (wasMobile !== this.isMobile) {
                    this.setDefaultState();
                }
            });
        },

        checkMobile() {
            this.isMobile = window.innerWidth <= 1024;
        },

        setDefaultState() {
            if (!this.isMobile) {
                this.leftSidebarOpen = true;
                this.rightSidebarOpen = true;
            } else {
                this.leftSidebarOpen = false;
                this.rightSidebarOpen = false;
            }
        },

        toggleSidebar(side) {
            if (side === 'left') {
                this.leftSidebarOpen = !this.leftSidebarOpen;
                if (this.isMobile && this.leftSidebarOpen) {
                    this.rightSidebarOpen = false;
                }
            } else {
                this.rightSidebarOpen = !this.rightSidebarOpen;
                if (this.isMobile && this.rightSidebarOpen) {
                    this.leftSidebarOpen = false;
                }
            }
        },

        closeSidebars() {
            this.leftSidebarOpen = false;
            this.rightSidebarOpen = false;
        },

        get showOverlay() {
            return this.isMobile && (this.leftSidebarOpen || this.rightSidebarOpen);
        },

        get leftSidebarClasses() {
            return {
                'mobile-visible': this.isMobile && this.leftSidebarOpen,
                'collapsed': !this.isMobile && !this.leftSidebarOpen
            };
        },

        get rightSidebarClasses() {
            return {
                'mobile-visible': this.isMobile && this.rightSidebarOpen,
                'collapsed': !this.isMobile && !this.rightSidebarOpen
            };
        },

        get filteredUnits() {
            if (!this.searchQuery) return this.units;
            return this.units.filter(unit => 
                unit.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },

        selectChapter(chapter) {
            this.units.forEach(unit => unit.active = false);
            chapter.active = true;
            this.selectedChapter = chapter;
            this.saveSelectedChapter(chapter);
            this.loadChapterContent(chapter);
        },

        loadSelectedChapter() {
            const urlParams = new URLSearchParams(window.location.search);
            const urlChapter = urlParams.get('chapter');
            const savedChapter = localStorage.getItem('selectedChapter');
            
            const chapterName = urlChapter || savedChapter;
            if (chapterName) {
                const chapter = this.units.find(unit => unit.name === chapterName);
                if (chapter) {
                    this.selectChapter(chapter);
                }
            }
        },

        saveSelectedChapter(chapter) {
            localStorage.setItem('selectedChapter', chapter.name);
            const url = new URL(window.location);
            url.searchParams.set('chapter', chapter.name);
            window.history.replaceState({}, '', url);
        },

        loadChapterContent(chapter) {
            this.contentLoading = true;
            this.chapterContent = null;
            
            setTimeout(() => {
                this.chapterContent = {
                    title: `${chapter.name} Learning Assistant`,
                    emoji: chapter.emoji,
                    description: `Welcome to your <strong>${chapter.name}</strong> learning companion! I can help you understand key concepts, solve problems, and master the fundamentals. Ask me anything about this topic and I'll provide detailed explanations and guidance.`,
                    suggestions: [
                        `Explain key concepts in ${chapter.name}`,
                        `Solve practice problems`,
                        `Understand real-world applications`,
                        `Review important formulas`
                    ]
                };
                this.contentLoading = false;
            }, 1000);
        },
        
        selectedFiles: [],
        showGeneratedResources: false,
        resourcesLoading: false,
        showGeneratedFlashcards: false,
        flashcardsLoading: false,
        showGeneratedCareerPath: false,
        careerPathLoading: false,
        showFlashcardModal: false,
        flashcards: [],
        currentFlashcard: 0,
        isFlipped: false,
        
        generateQuiz() {
            this.showGeneratedResources = true;
            this.resourcesLoading = true;
            
            setTimeout(() => {
                this.resourcesLoading = false;
            }, 4000);
        },
        
        generateFlashcards() {
            this.showGeneratedFlashcards = true;
            this.flashcardsLoading = true;
            
            setTimeout(() => {
                this.flashcardsLoading = false;
            }, 4000);
        },
        
        generateCareerPath() {
            this.showGeneratedCareerPath = true;
            this.careerPathLoading = true;
            
            setTimeout(() => {
                this.careerPathLoading = false;
            }, 4000);
        },
        
        async openFlashcards() {
            console.log('openFlashcards called');
            if (!this.selectedChapter) {
                alert('Please select a chapter first');
                return;
            }
            
            try {
                const response = await fetch('thermodynamics-flashcards.json');
                const data = await response.json();
                
                // Validate chId matches
                if (this.selectedChapter.chId !== data.chapterId) {
                    console.log('Chapter ID mismatch - showing empty state');
                    this.flashcards = [];
                } else {
                    this.flashcards = data.flashcards;
                }
                
                this.currentFlashcard = 0;
                this.isFlipped = false;
                this.showFlashcardModal = true;
                console.log('Modal should be open now:', this.showFlashcardModal);
            } catch (error) {
                console.error('Failed to load flashcards:', error);
                this.flashcards = [];
                this.showFlashcardModal = true;
            }
        },
        
        closeFlashcardModal() {
            this.showFlashcardModal = false;
        },
        
        flipCard() {
            this.isFlipped = !this.isFlipped;
        },
        
        nextCard() {
            if (this.currentFlashcard < this.flashcards.length - 1) {
                this.currentFlashcard++;
                this.isFlipped = false;
            }
        },
        
        prevCard() {
            if (this.currentFlashcard > 0) {
                this.currentFlashcard--;
                this.isFlipped = false;
            }
        },
        
        openQuiz() {
            if (!this.selectedChapter) {
                alert('Please select a chapter first');
                return;
            }
            const quizId = this.selectedChapter.chId;
            const chapterName = encodeURIComponent(this.selectedChapter.name);
            window.location.href = `/quiz?q=${quizId}&ch=${chapterName}`;
        },
        
        openCareerPath() {
            if (!this.selectedChapter) {
                alert('Please select a chapter first');
                return;
            }
            const chapterId = this.selectedChapter.chId;
            const chapterName = encodeURIComponent(this.selectedChapter.name);
            window.location.href = `/career?ch=${chapterId}&name=${chapterName}`;
        },
        
        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            const remainingSlots = 3 - this.selectedFiles.length;
            
            const validFiles = files.slice(0, remainingSlots).filter(file => {
                const isValidType = file.type.includes('pdf') || file.type.includes('image');
                const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
                return isValidType && isValidSize;
            });
            
            validFiles.forEach(file => {
                this.selectedFiles.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    file: file
                });
            });
            
            event.target.value = '';
        },
        
        removeFile(index) {
            this.selectedFiles.splice(index, 1);
        },
        
        logout() {
            firebase.auth().signOut().then(() => {
                window.location.href = 'login/';
            }).catch((error) => {
                console.error('Logout error:', error);
            });
        }
    }));
});