function careerManager() {
    return {
        rightSidebarOpen: window.innerWidth > 1024,
        selectedField: null,
        selectedCareer: null,
        selectedNode: null,
        showCareerModal: false,
        modalPosition: { x: 20, y: 20 },
        isDraggingModal: false,
        modalDragStart: { x: 0, y: 0 },
        canvas: null,
        ctx: null,
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        isDraggingNode: false,
        draggedNode: null,
        offset: { x: 0, y: 0 },
        scale: 1,
        touches: [],
        lastDistance: 0,
        chapterId: null,
        chapterName: null,
        mindmapNodes: [],
        
        careerFields: [
            {
                name: "Chemical Engineering",
                emoji: "⚗️",
                active: false,
                description: "Design and optimize chemical processes for manufacturing and production",
                careers: [
                    {
                        id: 1,
                        title: "Process Engineer",
                        description: "Design and optimize manufacturing processes",
                        salary: "$75k - $120k",
                        education: "Bachelor's in Chemical Engineering"
                    },
                    {
                        id: 2,
                        title: "Plant Manager",
                        description: "Oversee chemical manufacturing operations",
                        salary: "$90k - $150k",
                        education: "Bachelor's + Experience"
                    }
                ]
            },
            {
                name: "Research & Development",
                emoji: "🔬",
                active: false,
                description: "Conduct research and develop new chemical products and processes",
                careers: [
                    {
                        id: 3,
                        title: "Research Scientist",
                        description: "Conduct experiments and develop new materials",
                        salary: "$70k - $130k",
                        education: "PhD in Chemistry/Materials Science"
                    },
                    {
                        id: 4,
                        title: "Lab Technician",
                        description: "Support research activities and run experiments",
                        salary: "$40k - $65k",
                        education: "Associate's or Bachelor's"
                    }
                ]
            },
            {
                name: "Energy & Environment",
                emoji: "🌱",
                active: false,
                description: "Work on sustainable energy solutions and environmental protection",
                careers: [
                    {
                        id: 5,
                        title: "Environmental Engineer",
                        description: "Develop solutions for environmental challenges",
                        salary: "$65k - $110k",
                        education: "Bachelor's in Environmental Engineering"
                    },
                    {
                        id: 6,
                        title: "Energy Analyst",
                        description: "Analyze energy systems and efficiency",
                        salary: "$60k - $95k",
                        education: "Bachelor's in Engineering/Science"
                    }
                ]
            }
        ],

        init() {
            this.loadChapterFromURL();
            this.$nextTick(() => {
                this.canvas = document.getElementById('careerCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // Add roundRect polyfill for older browsers
                if (!this.ctx.roundRect) {
                    this.ctx.roundRect = function(x, y, width, height, radius) {
                        this.beginPath();
                        this.moveTo(x + radius, y);
                        this.lineTo(x + width - radius, y);
                        this.quadraticCurveTo(x + width, y, x + width, y + radius);
                        this.lineTo(x + width, y + height - radius);
                        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                        this.lineTo(x + radius, y + height);
                        this.quadraticCurveTo(x, y + height, x, y + height - radius);
                        this.lineTo(x, y + radius);
                        this.quadraticCurveTo(x, y, x + radius, y);
                        this.closePath();
                    };
                }
                
                this.resizeCanvas();
                this.generateMindmap();
                this.drawCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
            });
        },
        
        loadChapterFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            this.chapterId = urlParams.get('ch');
            this.chapterName = urlParams.get('name');
        },
        
        async generateMindmap() {
            if (!this.chapterId) return;
            
            try {
                const response = await fetch('../career-data.json');
                const careerData = await response.json();
                
                const chapterData = careerData[this.chapterId];
                if (chapterData) {
                    this.mindmapNodes = {
                        center: chapterData.center,
                        nodes: chapterData.careers
                    };
                } else {
                    this.mindmapNodes = { 
                        center: { title: 'Career Paths', x: 400, y: 300 }, 
                        nodes: [] 
                    };
                }
            } catch (error) {
                console.error('Failed to load career data:', error);
                this.mindmapNodes = { 
                    center: { title: 'Career Paths', x: 400, y: 300 }, 
                    nodes: [] 
                };
            }
        },

        resizeCanvas() {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.drawCanvas();
        },

        drawCanvas() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#0f1419';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.ctx.strokeStyle = '#1e2328';
            this.ctx.lineWidth = 1;
            const gridSize = 20 * this.scale;
            
            for (let x = this.offset.x % gridSize; x < this.canvas.width; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = this.offset.y % gridSize; y < this.canvas.height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            // Draw mindmap
            this.drawMindmap();
        },
        
        drawMindmap() {
            if (!this.mindmapNodes.center) return;
            
            const centerX = this.mindmapNodes.center.x;
            const centerY = this.mindmapNodes.center.y;
            
            // Draw flowchart connections
            this.mindmapNodes.nodes.forEach(node => {
                this.drawFlowchartConnection(centerX, centerY, node.x, node.y);
            });
            
            // Draw center node
            this.drawCenterNode(centerX, centerY, this.mindmapNodes.center.title);
            
            // Draw career nodes
            this.mindmapNodes.nodes.forEach(node => {
                this.drawCareerNode(node.x, node.y, node.title, node);
            });
        },
        
        drawFlowchartConnection(x1, y1, x2, y2) {
            const actualX1 = x1 * this.scale + this.offset.x;
            const actualY1 = y1 * this.scale + this.offset.y;
            const actualX2 = x2 * this.scale + this.offset.x;
            const actualY2 = y2 * this.scale + this.offset.y;
            
            // Draw straight vertical line from center to intermediate level
            this.ctx.strokeStyle = '#64b5f6';
            this.ctx.lineWidth = 2 * this.scale;
            this.ctx.lineCap = 'round';
            
            const midY = actualY1 + (actualY2 - actualY1) * 0.5;
            
            this.ctx.beginPath();
            // Vertical line down from center
            this.ctx.moveTo(actualX1, actualY1 + 30 * this.scale);
            this.ctx.lineTo(actualX1, midY);
            // Horizontal line to position
            this.ctx.lineTo(actualX2, midY);
            // Vertical line to final node
            this.ctx.lineTo(actualX2, actualY2 - 25 * this.scale);
            this.ctx.stroke();
            
            // Draw arrow at the end
            this.drawArrow(actualX2, actualY2 - 25 * this.scale, actualX2, midY);
        },
        
        drawArrow(x, y, fromX, fromY) {
            const angle = Math.atan2(y - fromY, x - fromX);
            const arrowLength = 8 * this.scale;
            const arrowAngle = Math.PI / 6;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x - arrowLength * Math.cos(angle - arrowAngle),
                y - arrowLength * Math.sin(angle - arrowAngle)
            );
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x - arrowLength * Math.cos(angle + arrowAngle),
                y - arrowLength * Math.sin(angle + arrowAngle)
            );
            this.ctx.stroke();
        },
        
        drawCenterNode(x, y, title) {
            const actualX = x * this.scale + this.offset.x;
            const actualY = y * this.scale + this.offset.y;
            const width = 160 * this.scale;
            const height = 60 * this.scale;
            const radius = 30 * this.scale;
            
            // Draw rounded rectangle (start/end node)
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.strokeStyle = '#ff5252';
            this.ctx.lineWidth = 2 * this.scale;
            
            this.ctx.beginPath();
            this.ctx.roundRect(actualX - width/2, actualY - height/2, width, height, radius);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `bold ${14 * this.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(title, actualX, actualY);
        },
        
        drawCareerNode(x, y, title, nodeData) {
            const actualX = x * this.scale + this.offset.x;
            const actualY = y * this.scale + this.offset.y;
            const width = 150 * this.scale;
            const height = 50 * this.scale;
            
            // Draw rectangle (process node)
            this.ctx.fillStyle = '#4fc3f7';
            this.ctx.strokeStyle = '#29b6f6';
            this.ctx.lineWidth = 2 * this.scale;
            
            this.ctx.fillRect(actualX - width/2, actualY - height/2, width, height);
            this.ctx.strokeRect(actualX - width/2, actualY - height/2, width, height);
            
            // Draw text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${11 * this.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const words = title.split(' ');
            if (words.length > 1) {
                this.ctx.fillText(words[0], actualX, actualY - 8 * this.scale);
                this.ctx.fillText(words.slice(1).join(' '), actualX, actualY + 8 * this.scale);
            } else {
                this.ctx.fillText(title, actualX, actualY);
            }
        },

        toggleSidebar(side) {
            if (side === 'right') {
                this.rightSidebarOpen = !this.rightSidebarOpen;
            }
        },



        selectField(field) {
            this.careerFields.forEach(f => f.active = false);
            field.active = true;
            this.selectedField = field;
        },

        selectCareer(career) {
            this.selectedCareer = career;
        },

        startDrag(e) {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const clickedNode = this.getNodeAtPosition(clickX, clickY);
            if (clickedNode) {
                if (e.shiftKey) {
                    // Shift+click to drag node
                    this.isDraggingNode = true;
                    this.draggedNode = clickedNode;
                    this.dragStart = { 
                        x: (clickX - this.offset.x) / this.scale - clickedNode.x, 
                        y: (clickY - this.offset.y) / this.scale - clickedNode.y 
                    };
                } else {
                    // Regular click to open modal
                    this.openCareerModal(clickedNode);
                }
                return;
            }
            
            // Canvas drag
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
        },
        
        getNodeAtPosition(x, y) {
            // Check center node (rounded rectangle)
            const centerX = this.mindmapNodes.center.x * this.scale + this.offset.x;
            const centerY = this.mindmapNodes.center.y * this.scale + this.offset.y;
            const centerWidth = 160 * this.scale;
            const centerHeight = 60 * this.scale;
            
            if (x >= centerX - centerWidth/2 && x <= centerX + centerWidth/2 && 
                y >= centerY - centerHeight/2 && y <= centerY + centerHeight/2) {
                return this.mindmapNodes.center;
            }
            
            // Check career nodes (rectangles)
            for (const node of this.mindmapNodes.nodes) {
                const nodeX = node.x * this.scale + this.offset.x;
                const nodeY = node.y * this.scale + this.offset.y;
                const width = 150 * this.scale;
                const height = 50 * this.scale;
                
                if (x >= nodeX - width/2 && x <= nodeX + width/2 && 
                    y >= nodeY - height/2 && y <= nodeY + height/2) {
                    return node;
                }
            }
            return null;
        },
        
        openCareerModal(node) {
            this.selectedNode = node;
            this.showCareerModal = true;
        },
        
        closeCareerModal() {
            this.showCareerModal = false;
            this.selectedNode = null;
        },

        handleDrag(e) {
            if (this.isDraggingNode && this.draggedNode) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                this.draggedNode.x = (mouseX - this.offset.x) / this.scale - this.dragStart.x;
                this.draggedNode.y = (mouseY - this.offset.y) / this.scale - this.dragStart.y;
                this.drawCanvas();
                return;
            }
            
            if (!this.isDragging) return;
            this.offset = { x: e.clientX - this.dragStart.x, y: e.clientY - this.dragStart.y };
            this.drawCanvas();
        },

        endDrag() {
            this.isDragging = false;
            this.isDraggingNode = false;
            this.draggedNode = null;
        },

        handleZoom(e) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));
            this.drawCanvas();
        },

        handleTouchStart(e) {
            this.touches = Array.from(e.touches);
            if (this.touches.length === 1) {
                this.isDragging = true;
                this.dragStart = { 
                    x: this.touches[0].clientX - this.offset.x, 
                    y: this.touches[0].clientY - this.offset.y 
                };
            } else if (this.touches.length === 2) {
                e.preventDefault();
                this.isDragging = false;
                this.lastDistance = this.getDistance(this.touches[0], this.touches[1]);
            }
        },

        handleTouchMove(e) {
            this.touches = Array.from(e.touches);
            
            if (this.touches.length === 1 && this.isDragging) {
                e.preventDefault();
                this.offset = { 
                    x: this.touches[0].clientX - this.dragStart.x, 
                    y: this.touches[0].clientY - this.dragStart.y 
                };
                this.drawCanvas();
            } else if (this.touches.length === 2) {
                e.preventDefault();
                const distance = this.getDistance(this.touches[0], this.touches[1]);
                if (this.lastDistance > 0) {
                    const zoomFactor = distance / this.lastDistance;
                    this.scale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));
                    this.drawCanvas();
                }
                this.lastDistance = distance;
            }
        },

        handleTouchEnd(e) {
            this.isDragging = false;
            this.touches = [];
            this.lastDistance = 0;
        },

        getDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        startDragModal(e) {
            e.preventDefault();
            this.isDraggingModal = true;
            this.modalDragStart = {
                x: e.clientX - this.modalPosition.x,
                y: e.clientY - this.modalPosition.y
            };
            
            const handleMouseMove = (e) => {
                if (this.isDraggingModal) {
                    this.modalPosition = {
                        x: e.clientX - this.modalDragStart.x,
                        y: e.clientY - this.modalDragStart.y
                    };
                }
            };
            
            const handleMouseUp = () => {
                this.isDraggingModal = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };
}