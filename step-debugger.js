/**
 * Step-by-step debugging functionality
 */

class StepDebugger {
    constructor(app) {
        this.app = app;
    }

    step(direction) {
        if (direction === 'forward') {
            this.app.stepForward();
        } else if (direction === 'backward') {
            this.app.stepBack();
        }
    }

    goToStep(stepNumber) {
        if (stepNumber >= 0 && stepNumber < this.app.sortingSteps.length) {
            this.app.currentStep = stepNumber;
            this.app.updateVisualization();
        }
    }
}

window.StepDebugger = StepDebugger;