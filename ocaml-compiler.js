/**
 * OCaml Parser and Compiler Interface (FIXED)
 */

class OCamlParser {
    static async parse(code) {
        try {
            const algorithmType = this.detectAlgorithmType(code);
            const complexity = this.analyzeComplexity(algorithmType);

            return {
                success: true,
                algorithmType: algorithmType,
                complexity: complexity,
                hasErrors: false,
                errors: []
            };
        } catch (error) {
            console.error('Parse error:', error);
            return {
                success: false,
                hasErrors: true,
                errors: [{ 
                    message: error.message, 
                    line: 1,
                    type: 'ParseError'
                }],
                algorithmType: 'unknown'
            };
        }
    }

    static detectAlgorithmType(code) {
        const lowerCode = code.toLowerCase();

        if (lowerCode.includes('bubble') || this.hasBubbleSortPattern(code)) {
            return 'bubble_sort';
        }

        if (lowerCode.includes('quick') || lowerCode.includes('partition') || this.hasQuickSortPattern(code)) {
            return 'quick_sort';
        }

        if (lowerCode.includes('merge') || this.hasMergeSortPattern(code)) {
            return 'merge_sort';
        }

        if (lowerCode.includes('selection') || this.hasSelectionSortPattern(code)) {
            return 'selection_sort';
        }

        if (lowerCode.includes('insertion') || this.hasInsertionSortPattern(code)) {
            return 'insertion_sort';
        }

        return this.detectByPatterns(code);
    }

    static hasBubbleSortPattern(code) {
        return code.includes('for') && code.includes('arr.(j)') && code.includes('arr.(j + 1)');
    }

    static hasQuickSortPattern(code) {
        return code.includes('partition') || (code.includes('pivot') && code.includes('rec'));
    }

    static hasMergeSortPattern(code) {
        return code.includes('merge') && (code.includes('rec') || code.includes('/'));
    }

    static hasSelectionSortPattern(code) {
        return code.includes('min') && code.includes('for') && code.includes('for');
    }

    static hasInsertionSortPattern(code) {
        return code.includes('key') && code.includes('while');
    }

    static detectByPatterns(code) {
        if (code.includes('for') && code.includes('for')) {
            return 'bubble_sort';
        } else if (code.includes('rec')) {
            return 'quick_sort';
        }
        return 'unknown';
    }

    static analyzeComplexity(algorithmType) {
        const complexities = {
            'bubble_sort': { time: 'O(n²)', space: 'O(1)' },
            'quick_sort': { time: 'O(n log n)', space: 'O(log n)' },
            'merge_sort': { time: 'O(n log n)', space: 'O(n)' },
            'selection_sort': { time: 'O(n²)', space: 'O(1)' },
            'insertion_sort': { time: 'O(n²)', space: 'O(1)' },
            'unknown': { time: 'Unknown', space: 'Unknown' }
        };

        return complexities[algorithmType] || complexities['unknown'];
    }
}

window.OCamlParser = OCamlParser;