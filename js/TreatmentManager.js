/**
 * TreatmentManager - Handles treatment stations and patient treatment
 */
class TreatmentManager {
    constructor(gameState, patientManager, gameManager = null) {
        this.gameState = gameState;
        this.patientManager = patientManager;
        this.gameManager = gameManager;
        this.treatmentStations = {
            'consultation': { occupied: false, patientId: null, timer: null },
            'surgery': { occupied: false, patientId: null, timer: null },
            'radiology': { occupied: false, patientId: null, timer: null },
            'emergency': { occupied: false, patientId: null, timer: null }
        };
    }
    
    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }
    
    // This method is now called directly by DragDropManager
    // instead of the old treatPatient method
    movePatientToStation(patient, stationId) {
        const station = this.treatmentStations[stationId];
        
        // Update station state
        station.occupied = true;
        station.patientId = patient.id;
        
        // Update station UI
        this.updateStationUI(patient, stationId, 'treating');
        
        // Remove patient from waiting room
        this.patientManager.removePatient(patient.id);
        
        // Start treatment
        station.timer = setTimeout(() => {
            this.completePatientTreatment(patient, stationId);
        }, this.gameState.treatmentTime[stationId]);
        
        console.log(`${patient.name} is being treated at station ${stationId}`);
        return true;
    }
    
    completePatientTreatment(patient, stationId) {
        // Calculate points (bonus for remaining patience)
        const patienceBonus = Math.floor((patient.patience / patient.maxPatience) * 50);
        const totalPoints = patient.points + patienceBonus;
        
        // Update game state
        this.gameState.addScore(totalPoints);
        this.gameState.incrementPatientsServed();
        
        // Create happy particles effect
        this.createHappyParticles(stationId);
        
        // Clear station
        this.clearStation(stationId);
        
        // Notify game manager if available
        if (this.gameManager) {
            this.gameManager.onPatientTreatmentComplete(totalPoints, stationId);
        }
        
        console.log(`${patient.name} treated! +${totalPoints} points`);
        
        return totalPoints;
    }
    
    createHappyParticles(stationId) {
        const stationElement = document.getElementById(`station-${stationId}`);
        const particles = ['💚', '⭐', '✨', '🎉', '👍'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'happy-particle';
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                
                const rect = stationElement.getBoundingClientRect();
                particle.style.position = 'fixed';
                particle.style.left = `${rect.left + Math.random() * rect.width}px`;
                particle.style.top = `${rect.top + rect.height / 2}px`;
                particle.style.zIndex = '1000';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    clearStation(stationId) {
        const station = this.treatmentStations[stationId];
        
        if (station.timer) {
            clearTimeout(station.timer);
            station.timer = null;
        }
        
        station.occupied = false;
        station.patientId = null;
        
        // Update UI
        this.updateStationUI(null, stationId, 'available');
    }
    
    updateStationUI(patient, stationId, status) {
        const stationElement = document.getElementById(`station-${stationId}`);
        if (!stationElement) {
            console.error(`Station element not found: station-${stationId}`);
            return;
        }
        
        const stationPatient = stationElement.querySelector('.station-patient');
        const dropHint = stationElement.querySelector('.drop-hint');
        
        if (status === 'treating' && patient) {
            stationPatient.innerHTML = `
                <div class="patient-avatar">
                    <div class="patient-face face-happy"></div>
                </div>
                <div class="patient-details">
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-type">${patient.typeName}</div>
                </div>
            `;
            stationPatient.classList.add('occupied');
            if (dropHint) dropHint.style.display = 'none';
        } else {
            stationPatient.innerHTML = '<span class="station-status">Available</span>';
            stationPatient.classList.remove('occupied');
            if (dropHint) dropHint.style.display = 'block';
        }
    }
    
    clearAllStations() {
        Object.keys(this.treatmentStations).forEach(stationId => {
            this.clearStation(stationId);
        });
    }
    
    stopAllTreatments() {
        Object.values(this.treatmentStations).forEach(station => {
            if (station.timer) {
                clearTimeout(station.timer);
                station.timer = null;
            }
        });
    }
    
    isStationOccupied(stationId) {
        return this.treatmentStations[stationId].occupied;
    }
}
