/**
 * UI Controls Handler (FIXED - Dynamic Array Size)
 */

class VisualizationControls {
    constructor(app) {
        this.app = app;
        this.setupControls();
    }

    setupControls() {
        // FIXED: Array size control with proper dynamic updating
        const arraySizeSlider = document.getElementById('array-size');
        const arraySizeValue = document.getElementById('array-size-value');

        if (arraySizeSlider && arraySizeValue) {
            // Set initial values
            arraySizeSlider.value = this.app.arraySize;
            arraySizeValue.textContent = this.app.arraySize;

            // Add input event listener for real-time updates
            arraySizeSlider.addEventListener('input', (e) => {
                const newSize = parseInt(e.target.value);
                console.log(`Array size changed from ${this.app.arraySize} to ${newSize}`);

                this.app.arraySize = newSize;
                arraySizeValue.textContent = newSize;

                // Update visualization immediately with new size
                this.app.generateInitialVisualization();

                // Clear current sorting steps since array size changed
                this.app.sortingSteps = [];
                this.app.currentStep = 0;
                document.getElementById('total-steps').textContent = 0;
                document.getElementById('current-step').textContent = 0;
                document.getElementById('step-description').textContent = 
                    `Array size set to ${newSize}. Click "Compile & Visualize" to generate steps.`;
            });

            // Also handle change event for better compatibility
            arraySizeSlider.addEventListener('change', (e) => {
                this.app.generateInitialVisualization();
            });
        }

        // Animation speed control
        const speedSlider = document.getElementById('animation-speed');
        const speedValue = document.getElementById('animation-speed-value');

        if (speedSlider && speedValue) {
            speedSlider.value = this.app.animationSpeed;
            speedValue.textContent = this.app.animationSpeed;

            speedSlider.addEventListener('input', (e) => {
                const newSpeed = parseInt(e.target.value);
                console.log(`Animation speed changed to ${newSpeed}`);

                this.app.animationSpeed = newSpeed;
                speedValue.textContent = newSpeed;
            });
        }

        // Array type selector
        const arrayTypeSelect = document.getElementById('array-type');
        if (arrayTypeSelect) {
            arrayTypeSelect.value = this.app.arrayType;

            arrayTypeSelect.addEventListener('change', (e) => {
                console.log(`Array type changed to ${e.target.value}`);

                this.app.arrayType = e.target.value;
                this.app.generateInitialVisualization();

                // Clear current sorting steps since array data changed
                this.app.sortingSteps = [];
                this.app.currentStep = 0;
                document.getElementById('total-steps').textContent = 0;
                document.getElementById('current-step').textContent = 0;
                document.getElementById('step-description').textContent = 
                    `Array type set to ${e.target.value}. Click "Compile & Visualize" to generate steps.`;
            });
        }
    }
}

window.VisualizationControls = VisualizationControls;