/**
 * Sorting Animation Controller (FIXED - Dynamic Array Size)
 */

class SortingAnimator {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('visualization-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.colors = {
            normal: '#3498db',
            comparing: '#e74c3c',
            swapping: '#f39c12',
            sorted: '#27ae60',
            pivot: '#9b59b6',
            current: '#e67e22',
            minimum: '#f1c40f',
            merging: '#1abc9c',
            divided: '#34495e',
            placed: '#2ecc71'
        };

        if (this.canvas) {
            this.setupCanvas();
            this.generateInitialArray();
        }
    }

    setupCanvas() {
        // Set up canvas with proper dimensions
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;

        console.log(`Canvas setup: ${this.width} x ${this.height}`);
    }

    generateInitialArray() {
        // Generate sample array based on current array size
        const sampleArray = Array.from({ length: this.app.arraySize }, (_, i) => (i + 1) * 5);
        this.drawArray(sampleArray);
    }

    // FIXED: Dynamic bar width calculation based on actual array length
    drawArray(array, highlights = {}) {
        if (!this.ctx || !array || array.length === 0) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        const arrayLength = array.length;
        console.log(`Drawing array of length ${arrayLength}:`, array.slice(0, 10), '...');

        // FIXED: Calculate bar width dynamically based on actual array length
        const padding = 40;
        const availableWidth = this.width - (padding * 2);
        const barSpacing = 2;
        const totalSpacing = (arrayLength - 1) * barSpacing;
        const barWidth = Math.max(1, Math.floor((availableWidth - totalSpacing) / arrayLength));

        const maxValue = Math.max(...array);
        const minValue = Math.min(...array);
        const valueRange = maxValue - minValue || 1;
        const heightScale = (this.height - 100) / valueRange;

        console.log(`Bar calculation: width=${barWidth}, spacing=${barSpacing}, scale=${heightScale.toFixed(2)}`);

        // Draw bars
        array.forEach((value, index) => {
            const x = padding + index * (barWidth + barSpacing);
            const normalizedValue = value - minValue;
            const barHeight = Math.max(5, normalizedValue * heightScale);
            const y = this.height - 60 - barHeight;

            // Determine bar color based on highlights
            let color = this.colors.normal;
            let isHighlighted = false;

            if (highlights.comparing && highlights.comparing.includes(index)) {
                color = this.colors.comparing;
                isHighlighted = true;
            } else if (highlights.swapping && highlights.swapping.includes(index)) {
                color = this.colors.swapping;
                isHighlighted = true;
            } else if (highlights.sorted && highlights.sorted.includes(index)) {
                color = this.colors.sorted;
            } else if (highlights.pivot !== undefined && highlights.pivot === index) {
                color = this.colors.pivot;
                isHighlighted = true;
            } else if (highlights.current !== undefined && highlights.current === index) {
                color = this.colors.current;
                isHighlighted = true;
            } else if (highlights.minimum !== undefined && highlights.minimum === index) {
                color = this.colors.minimum;
                isHighlighted = true;
            } else if (highlights.merging && this.isInRange(index, highlights.merging)) {
                color = this.colors.merging;
            } else if (highlights.divided && this.isInRange(index, highlights.divided)) {
                color = this.colors.divided;
            } else if (highlights.placed !== undefined && highlights.placed === index) {
                color = this.colors.placed;
                isHighlighted = true;
            } else if (highlights.merged && this.isInRange(index, highlights.merged)) {
                color = this.colors.sorted;
            }

            // Draw bar
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Draw border for highlighted elements
            if (isHighlighted) {
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, barWidth, barHeight);
            }

            // Draw value label on top of bar (only if bar is wide enough)
            if (barWidth >= 15) {
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = 'bold 8px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toString(), x + barWidth / 2, y - 3);
            }

            // Draw index label at bottom (only for smaller arrays)
            if (arrayLength <= 25 && barWidth >= 8) {
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.font = '7px Arial';
                this.ctx.fillText(index.toString(), x + barWidth / 2, this.height - 35);
            }
        });

        // Draw array size info
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Array Size: ${arrayLength}`, 10, 20);

        // Draw value range info
        this.ctx.fillText(`Values: ${minValue} - ${maxValue}`, 10, this.height - 10);

        // Draw legend if there are highlights
        this.drawLegend(highlights);
    }

    isInRange(index, range) {
        if (!range || range.length < 2) return false;
        if (range.length === 2) {
            return index >= range[0] && index <= range[1];
        } else if (range.length === 3) {
            // For merge sort: [left, middle, right]
            return index >= range[0] && index <= range[2];
        }
        return false;
    }

    drawLegend(highlights) {
        if (!highlights || Object.keys(highlights).length === 0) return;

        const legendY = 40;
        const legendItemWidth = 80;
        let legendX = 150;

        const activeLegendItems = [];

        // Determine which legend items to show
        if (highlights.comparing) activeLegendItems.push({ color: this.colors.comparing, label: 'Comparing' });
        if (highlights.swapping) activeLegendItems.push({ color: this.colors.swapping, label: 'Swapping' });
        if (highlights.sorted) activeLegendItems.push({ color: this.colors.sorted, label: 'Sorted' });
        if (highlights.pivot !== undefined) activeLegendItems.push({ color: this.colors.pivot, label: 'Pivot' });
        if (highlights.current !== undefined) activeLegendItems.push({ color: this.colors.current, label: 'Current' });
        if (highlights.minimum !== undefined) activeLegendItems.push({ color: this.colors.minimum, label: 'Minimum' });
        if (highlights.merging) activeLegendItems.push({ color: this.colors.merging, label: 'Merging' });
        if (highlights.placed !== undefined) activeLegendItems.push({ color: this.colors.placed, label: 'Placed' });

        activeLegendItems.forEach((item, index) => {
            // Draw color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, legendY - 8, 12, 10);

            // Draw label
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = '9px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.label, legendX + 16, legendY);

            legendX += legendItemWidth;

            // Wrap to next line if too wide
            if (legendX > this.width - legendItemWidth) {
                legendX = 150;
                legendY += 20;
            }
        });

        // Reset text align
        this.ctx.textAlign = 'center';
    }

    drawStep(step) {
        if (!step) return;

        const highlights = {};

        // Map step properties to highlights
        if (step.comparing) highlights.comparing = step.comparing;
        if (step.swapping) highlights.swapping = step.swapping;
        if (step.sorted) highlights.sorted = step.sorted;
        if (step.pivot !== undefined) highlights.pivot = step.pivot;
        if (step.current !== undefined) highlights.current = step.current;
        if (step.minimum !== undefined) highlights.minimum = step.minimum;
        if (step.merging) highlights.merging = step.merging;
        if (step.dividing) highlights.divided = step.dividing;
        if (step.placed !== undefined) highlights.placed = step.placed;
        if (step.merged) highlights.merged = step.merged;

        this.drawArray(step.array, highlights);
    }

    // Handle window resize
    resize() {
        if (this.canvas) {
            this.setupCanvas();
            // Redraw current step if available
            if (this.app.sortingSteps.length > 0 && this.app.currentStep < this.app.sortingSteps.length) {
                this.drawStep(this.app.sortingSteps[this.app.currentStep]);
            } else {
                this.generateInitialArray();
            }
        }
    }
}

// Handle window resize globally
window.addEventListener('resize', () => {
    if (window.sortingVisualizer && window.sortingVisualizer.animator) {
        setTimeout(() => {
            window.sortingVisualizer.animator.resize();
        }, 100);
    }
});

window.SortingAnimator = SortingAnimator;