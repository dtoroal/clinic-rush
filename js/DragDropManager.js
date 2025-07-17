/**
 * DragDropManager - Handles drag and drop interactions for patients
 */
class DragDropManager {
    constructor(gameManager, patientManager, treatmentManager) {
        this.gameManager = gameManager;
        this.patientManager = patientManager;
        this.treatmentManager = treatmentManager;
        this.draggedPatient = null;
        this.dragOffset = { x: 0, y: 0 };
        this.ghostElement = null;
        
        this.initializeDragDropEvents();
    }
    
    initializeDragDropEvents() {
        // Add event listeners for drag and drop
        document.addEventListener('dragstart', (e) => this.onDragStart(e));
        document.addEventListener('dragend', (e) => this.onDragEnd(e));
        document.addEventListener('dragover', (e) => this.onDragOver(e));
        document.addEventListener('drop', (e) => this.onDrop(e));
        
        // Add mouse events for better visual feedback
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Make treatment stations droppable
        this.setupDropZones();
    }
    
    setupDropZones() {
        const stations = document.querySelectorAll('.treatment-station');
        stations.forEach(station => {
            station.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.highlightDropZone(station, true);
            });
            
            station.addEventListener('dragleave', (e) => {
                this.highlightDropZone(station, false);
            });
            
            station.addEventListener('drop', (e) => {
                e.preventDefault();
                this.highlightDropZone(station, false);
            });
        });
    }
    
    onDragStart(e) {
        if (!e.target.classList.contains('patient')) return;
        
        this.draggedPatient = {
            id: e.target.dataset.patientId,
            station: e.target.dataset.station,
            element: e.target
        };
        
        // Create a custom drag image
        const dragImage = this.createDragImage(e.target);
        e.dataTransfer.setDragImage(dragImage, 50, 30);
        e.dataTransfer.setData('text/plain', this.draggedPatient.id);
        
        // Add dragging class for visual feedback
        e.target.classList.add('dragging');
        
        // Highlight compatible stations
        this.highlightCompatibleStations(this.draggedPatient.station);
        
        console.log(`Started dragging patient to station ${this.draggedPatient.station}`);
    }
    
    onDragEnd(e) {
        if (!e.target.classList.contains('patient')) return;
        
        // Remove visual feedback
        e.target.classList.remove('dragging');
        this.clearAllHighlights();
        
        // Clean up drag image
        if (this.ghostElement) {
            document.body.removeChild(this.ghostElement);
            this.ghostElement = null;
        }
        
        this.draggedPatient = null;
    }
    
    onDragOver(e) {
        e.preventDefault(); // Allow drop
    }
    
    onDrop(e) {
        e.preventDefault();
        
        if (!this.draggedPatient) return;
        
        // Find the treatment station
        const station = e.target.closest('.treatment-station');
        if (!station) return;
        
        const stationId = station.dataset.station;
        const patientId = this.draggedPatient.id;
        const requiredStation = this.draggedPatient.station;
        
        // Check if this is the correct station
        if (stationId !== requiredStation) {
            this.showDropError(station, `This patient needs ${requiredStation} station!`);
            return;
        }
        
        // Check if station is occupied
        if (this.treatmentManager.isStationOccupied(stationId)) {
            this.showDropError(station, 'This station is occupied!');
            return;
        }
        
        // Get patient data
        const patient = this.patientManager.getPatientById(patientId);
        if (!patient) return;
        
        // Perform the treatment
        this.treatmentManager.movePatientToStation(patient, stationId);
        
        // Show success feedback
        this.showDropSuccess(station);
        
        console.log(`Patient dropped at correct station ${stationId}`);
    }
    
    onMouseDown(e) {
        if (!e.target.classList.contains('patient')) return;
        
        // Add hover effect when starting to drag
        e.target.style.cursor = 'grabbing';
    }
    
    onMouseMove(e) {
        // Could add custom drag preview here if needed
    }
    
    onMouseUp(e) {
        // Reset cursor
        const patients = document.querySelectorAll('.patient');
        patients.forEach(patient => {
            patient.style.cursor = 'grab';
        });
    }
    
    createDragImage(element) {
        // Create a custom drag image that looks like the patient
        const dragImage = element.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.opacity = '0.8';
        dragImage.style.transform = 'rotate(5deg) scale(0.9)';
        dragImage.style.zIndex = '10000';
        dragImage.style.pointerEvents = 'none';
        
        document.body.appendChild(dragImage);
        this.ghostElement = dragImage;
        
        return dragImage;
    }
    
    highlightCompatibleStations(requiredStation) {
        const stations = document.querySelectorAll('.treatment-station');
        stations.forEach(station => {
            const stationId = station.dataset.station;
            if (stationId === requiredStation) {
                station.classList.add('drop-zone-compatible');
            } else {
                station.classList.add('drop-zone-incompatible');
            }
        });
    }
    
    highlightDropZone(station, highlight) {
        if (highlight) {
            const stationId = station.dataset.station;
            const requiredStation = this.draggedPatient?.station;
            
            if (stationId === requiredStation) {
                station.classList.add('drop-zone-active');
            } else {
                station.classList.add('drop-zone-wrong');
            }
        } else {
            station.classList.remove('drop-zone-active', 'drop-zone-wrong');
        }
    }
    
    clearAllHighlights() {
        const stations = document.querySelectorAll('.treatment-station');
        stations.forEach(station => {
            station.classList.remove(
                'drop-zone-compatible', 
                'drop-zone-incompatible', 
                'drop-zone-active', 
                'drop-zone-wrong'
            );
        });
    }
    
    showDropError(station, message) {
        // Create error feedback
        const errorPopup = document.createElement('div');
        errorPopup.className = 'drop-error-popup';
        errorPopup.textContent = message;
        
        const rect = station.getBoundingClientRect();
        errorPopup.style.position = 'fixed';
        errorPopup.style.left = `${rect.left + rect.width / 2}px`;
        errorPopup.style.top = `${rect.top - 10}px`;
        errorPopup.style.transform = 'translateX(-50%)';
        errorPopup.style.background = '#ff6b6b';
        errorPopup.style.color = 'white';
        errorPopup.style.padding = '8px 15px';
        errorPopup.style.borderRadius = '20px';
        errorPopup.style.fontSize = '0.9em';
        errorPopup.style.fontWeight = 'bold';
        errorPopup.style.zIndex = '10000';
        errorPopup.style.animation = 'errorShake 0.5s ease-out';
        
        document.body.appendChild(errorPopup);
        
        setTimeout(() => {
            errorPopup.remove();
        }, 2000);
        
        // Shake the station
        station.style.animation = 'stationShake 0.5s ease-out';
        setTimeout(() => {
            station.style.animation = '';
        }, 500);
    }
    
    showDropSuccess(station) {
        // Create success feedback
        const successPopup = document.createElement('div');
        successPopup.className = 'drop-success-popup';
        successPopup.textContent = '✓ Perfect!';
        
        const rect = station.getBoundingClientRect();
        successPopup.style.position = 'fixed';
        successPopup.style.left = `${rect.left + rect.width / 2}px`;
        successPopup.style.top = `${rect.top - 10}px`;
        successPopup.style.transform = 'translateX(-50%)';
        successPopup.style.background = '#48bb78';
        successPopup.style.color = 'white';
        successPopup.style.padding = '8px 15px';
        successPopup.style.borderRadius = '20px';
        successPopup.style.fontSize = '0.9em';
        successPopup.style.fontWeight = 'bold';
        successPopup.style.zIndex = '10000';
        successPopup.style.animation = 'successBounce 0.6s ease-out';
        
        document.body.appendChild(successPopup);
        
        setTimeout(() => {
            successPopup.remove();
        }, 1500);
        
        // Success animation for station
        station.style.animation = 'successPulse 0.6s ease-out';
        setTimeout(() => {
            station.style.animation = '';
        }, 600);
    }
    
    addDragDropStyles() {
        if (!document.getElementById('drag-drop-styles')) {
            const style = document.createElement('style');
            style.id = 'drag-drop-styles';
            style.textContent = `
                /* Drag and Drop Styles */
                .patient {
                    cursor: grab;
                    transition: all 0.2s ease;
                }
                
                .patient:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
                
                .patient.dragging {
                    opacity: 0.5;
                    transform: rotate(5deg) scale(0.95);
                    cursor: grabbing;
                }
                
                .drag-hint {
                    position: absolute;
                    bottom: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 10px;
                    font-size: 0.7em;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                    white-space: nowrap;
                }
                
                .patient:hover .drag-hint {
                    opacity: 1;
                }
                
                /* Drop Zone Styles */
                .treatment-station.drop-zone-compatible {
                    border: 3px solid #48bb78;
                    background: linear-gradient(45deg, #f0fff4, #e6fffa);
                    transform: scale(1.05);
                    box-shadow: 0 0 20px rgba(72, 187, 120, 0.3);
                }
                
                .treatment-station.drop-zone-incompatible {
                    border: 3px solid #cbd5e0;
                    opacity: 0.5;
                    transform: scale(0.95);
                }
                
                .treatment-station.drop-zone-active {
                    border: 3px solid #4299e1;
                    background: linear-gradient(45deg, #ebf8ff, #bee3f8);
                    animation: dropZonePulse 1s infinite;
                }
                
                .treatment-station.drop-zone-wrong {
                    border: 3px solid #f56565;
                    background: linear-gradient(45deg, #fff5f5, #fed7d7);
                    animation: dropZoneShake 0.5s ease-out;
                }
                
                /* Animations */
                @keyframes dropZonePulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(66, 153, 225, 0.6); }
                }
                
                @keyframes dropZoneShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes errorShake {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    25% { transform: translateX(-50%) translateY(-5px); }
                    75% { transform: translateX(-50%) translateY(5px); }
                }
                
                @keyframes successBounce {
                    0% { transform: translateX(-50%) scale(0) translateY(10px); opacity: 0; }
                    50% { transform: translateX(-50%) scale(1.1) translateY(-5px); opacity: 1; }
                    100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
                }
                
                @keyframes stationShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                
                @keyframes successPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                /* Remove the old treat buttons since we're using drag and drop */
                .treat-button {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    init() {
        this.addDragDropStyles();
    }
}
