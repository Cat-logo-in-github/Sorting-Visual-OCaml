/**
 * OCaml Sorting Visualizer - Main Application (ALL ISSUES FIXED)
 */

class OCamlSortingVisualizer {
    constructor() {
        this.currentFile = null;
        this.sortingSteps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.animationSpeed = 5;
        this.arraySize = 15; // FIXED: This will be properly used
        this.arrayType = 'random';
        this.currentAlgorithm = 'bubble_sort';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExampleAlgorithms();
        this.animator = new SortingAnimator(this);
        this.fileManager = new FileManager(this);
        this.controls = new VisualizationControls(this);
        this.stepDebugger = new StepDebugger(this);

        // Generate initial array
        this.generateInitialVisualization();
    }

    setupEventListeners() {
        // Compile button
        document.getElementById('compile-btn').addEventListener('click', () => {
            this.compileAndVisualize();
        });

        // Example algorithm buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algorithm = e.target.dataset.algorithm;
                this.loadExampleAlgorithm(algorithm);
            });
        });

        // Playback controls
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('step-back-btn').addEventListener('click', () => this.stepBack());
        document.getElementById('step-forward-btn').addEventListener('click', () => this.stepForward());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());

        // Format and save buttons
        document.getElementById('format-btn').addEventListener('click', () => this.formatCode());
        document.getElementById('save-btn').addEventListener('click', () => this.saveCurrentFile());
    }

    loadExampleAlgorithms() {
        this.examples = {
            'bubble': {
                code: `(* Bubble Sort Algorithm *)
let bubble_sort arr =
  let n = Array.length arr in
  for i = 0 to n - 2 do
    for j = 0 to n - i - 2 do
      if arr.(j) > arr.(j + 1) then begin
        let temp = arr.(j) in
        arr.(j) <- arr.(j + 1);
        arr.(j + 1) <- temp
      end
    done
  done;
  arr`,
                type: 'bubble_sort'
            },
            'quick': {
                code: `(* Quick Sort Algorithm *)
let partition arr low high =
  let pivot = arr.(high) in
  let i = ref (low - 1) in
  for j = low to high - 1 do
    if arr.(j) <= pivot then begin
      incr i;
      let temp = arr.(!i) in
      arr.(!i) <- arr.(j);
      arr.(j) <- temp
    end
  done;
  let temp = arr.(!i + 1) in
  arr.(!i + 1) <- arr.(high);
  arr.(high) <- temp;
  !i + 1

let rec quick_sort arr low high =
  if low < high then begin
    let pi = partition arr low high in
    quick_sort arr low (pi - 1);
    quick_sort arr (pi + 1) high
  end`,
                type: 'quick_sort'
            },
            'merge': {
                code: `(* Merge Sort Algorithm *)
let merge arr l m r =
  let n1 = m - l + 1 in
  let n2 = r - m in
  let left = Array.make n1 0 in
  let right = Array.make n2 0 in

  for i = 0 to n1 - 1 do
    left.(i) <- arr.(l + i)
  done;

  for j = 0 to n2 - 1 do
    right.(j) <- arr.(m + 1 + j)
  done;

  let i = ref 0 and j = ref 0 and k = ref l in

  while !i < n1 && !j < n2 do
    if left.(!i) <= right.(!j) then begin
      arr.(!k) <- left.(!i);
      incr i
    end else begin
      arr.(!k) <- right.(!j);
      incr j
    end;
    incr k
  done;

  while !i < n1 do
    arr.(!k) <- left.(!i);
    incr i; incr k
  done;

  while !j < n2 do
    arr.(!k) <- right.(!j);
    incr j; incr k
  done

let rec merge_sort_array arr l r =
  if l < r then begin
    let m = l + (r - l) / 2 in
    merge_sort_array arr l m;
    merge_sort_array arr (m + 1) r;
    merge arr l m r
  end`,
                type: 'merge_sort'
            },
            'selection': {
                code: `(* Selection Sort Algorithm *)
let selection_sort arr =
  let n = Array.length arr in
  for i = 0 to n - 1 do
    let min_idx = ref i in
    for j = i + 1 to n - 1 do
      if arr.(j) < arr.(!min_idx) then
        min_idx := j
    done;
    if !min_idx <> i then begin
      let temp = arr.(i) in
      arr.(i) <- arr.(!min_idx);
      arr.(!min_idx) <- temp
    end
  done;
  arr`,
                type: 'selection_sort'
            },
            'insertion': {
                code: `(* Insertion Sort Algorithm *)
let insertion_sort arr =
  let n = Array.length arr in
  for i = 1 to n - 1 do
    let key = arr.(i) in
    let j = ref (i - 1) in
    while !j >= 0 && arr.(!j) > key do
      arr.(!j + 1) <- arr.(!j);
      decr j
    done;
    arr.(!j + 1) <- key
  done;
  arr`,
                type: 'insertion_sort'
            }
        };
    }

    loadExampleAlgorithm(name) {
        if (this.examples[name]) {
            document.getElementById('code-editor').value = this.examples[name].code;
            this.currentAlgorithm = this.examples[name].type;
            this.currentFile = null;
        }
    }

    async compileAndVisualize() {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            alert('Please enter OCaml code to visualize.');
            return;
        }

        this.showLoading(true);
        this.updateCompilationStatus('compiling', 'Analyzing code...');

        try {
            const result = await OCamlParser.parse(code);
            if (result.success) {
                this.currentAlgorithm = result.algorithmType;
                this.generateSortingSteps();
                this.updateCompilationStatus('success', 'Ready to visualize');
                this.hideErrorPanel();

                document.getElementById('time-complexity').textContent = result.complexity.time;
                this.updateAlgorithmExplanation(result.algorithmType);
            } else {
                this.updateCompilationStatus('error', 'Analysis failed');
                this.showErrorPanel(result.errors);
            }
        } catch (error) {
            console.error('Compilation error:', error);
            this.updateCompilationStatus('error', 'Parse error');
            this.showErrorPanel([{ message: error.message, line: 1 }]);
        } finally {
            this.showLoading(false);
        }
    }

    generateSortingSteps() {
        // FIXED: Use actual arraySize from slider
        const array = this.generateArray();
        console.log(`Generating steps for ${this.currentAlgorithm} with ${array.length} elements`);

        // Generate different steps based on algorithm type
        switch (this.currentAlgorithm) {
            case 'bubble_sort':
                this.sortingSteps = this.simulateBubbleSort([...array]);
                break;
            case 'quick_sort':
                this.sortingSteps = this.simulateQuickSort([...array]);
                break;
            case 'merge_sort':
                this.sortingSteps = this.simulateMergeSort([...array]);
                break;
            case 'selection_sort':
                this.sortingSteps = this.simulateSelectionSort([...array]);
                break;
            case 'insertion_sort':
                this.sortingSteps = this.simulateInsertionSort([...array]);
                break;
            default:
                this.sortingSteps = this.simulateBubbleSort([...array]);
        }

        this.currentStep = 0;
        document.getElementById('total-steps').textContent = this.sortingSteps.length;
        document.getElementById('current-step').textContent = 1;

        console.log(`Generated ${this.sortingSteps.length} steps for ${this.currentAlgorithm}`);

        if (this.animator && this.sortingSteps.length > 0) {
            this.animator.drawStep(this.sortingSteps[0]);
        }
    }

    // FIXED: Realistic bubble sort with proper O(n²) step count
    simulateBubbleSort(arr) {
        const steps = [];
        const n = arr.length;
        let comparisons = 0, swaps = 0, accesses = 0;

        steps.push({
            array: [...arr],
            description: `Starting Bubble Sort with ${n} elements`,
            metrics: { comparisons, swaps, accesses }
        });

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                accesses += 2;

                steps.push({
                    array: [...arr],
                    comparing: [j, j + 1],
                    description: `Pass ${i + 1}: Comparing ${arr[j]} and ${arr[j + 1]} at positions ${j} and ${j + 1}`,
                    metrics: { comparisons, swaps, accesses }
                });

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    swaps++;
                    accesses += 4;

                    steps.push({
                        array: [...arr],
                        swapping: [j, j + 1],
                        description: `Swapped ${arr[j]} and ${arr[j + 1]} - larger element bubbles right`,
                        metrics: { comparisons, swaps, accesses }
                    });
                }
            }

            // Mark element as sorted
            steps.push({
                array: [...arr],
                sorted: Array.from({ length: i + 1 }, (_, idx) => n - 1 - idx),
                description: `Pass ${i + 1} complete - element ${arr[n - 1 - i]} is in final position`,
                metrics: { comparisons, swaps, accesses }
            });
        }

        steps.push({
            array: [...arr],
            sorted: Array.from({ length: n }, (_, i) => i),
            description: `Bubble Sort completed! Made ${comparisons} comparisons and ${swaps} swaps`,
            metrics: { comparisons, swaps, accesses }
        });

        return steps;
    }

    // FIXED: Realistic quick sort with proper partitioning steps
    simulateQuickSort(arr) {
        const steps = [];
        const n = arr.length;
        let comparisons = 0, swaps = 0;

        steps.push({
            array: [...arr],
            description: `Starting Quick Sort with ${n} elements`,
            metrics: { comparisons, swaps }
        });

        const quicksort = (low, high, depth = 0) => {
            if (low < high) {
                steps.push({
                    array: [...arr],
                    dividing: [low, high],
                    description: `Depth ${depth}: Partitioning range [${low}..${high}] (${high - low + 1} elements)`,
                    metrics: { comparisons, swaps }
                });

                const pi = partition(low, high, depth);

                steps.push({
                    array: [...arr],
                    sorted: [pi],
                    pivot: pi,
                    description: `Pivot ${arr[pi]} placed in final position ${pi}`,
                    metrics: { comparisons, swaps }
                });

                // Recurse on left partition
                if (pi - 1 > low) {
                    quicksort(low, pi - 1, depth + 1);
                }

                // Recurse on right partition  
                if (pi + 1 < high) {
                    quicksort(pi + 1, high, depth + 1);
                }
            } else if (low === high) {
                steps.push({
                    array: [...arr],
                    sorted: [low],
                    description: `Single element ${arr[low]} at position ${low} is sorted`,
                    metrics: { comparisons, swaps }
                });
            }
        };

        const partition = (low, high, depth) => {
            const pivot = arr[high];
            let i = low - 1;

            steps.push({
                array: [...arr],
                pivot: high,
                description: `Depth ${depth}: Selected pivot ${pivot} at position ${high}`,
                metrics: { comparisons, swaps }
            });

            for (let j = low; j < high; j++) {
                comparisons++;
                steps.push({
                    array: [...arr],
                    comparing: [j, high],
                    pivot: high,
                    description: `Comparing ${arr[j]} with pivot ${pivot}`,
                    metrics: { comparisons, swaps }
                });

                if (arr[j] <= pivot) {
                    i++;
                    if (i !== j) {
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        swaps++;

                        steps.push({
                            array: [...arr],
                            swapping: [i, j],
                            pivot: high,
                            description: `Moved ${arr[i]} to left partition (≤ ${pivot})`,
                            metrics: { comparisons, swaps }
                        });
                    }
                }
            }

            // Place pivot in correct position
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            swaps++;

            steps.push({
                array: [...arr],
                swapping: [i + 1, high],
                description: `Placed pivot ${pivot} at position ${i + 1}`,
                metrics: { comparisons, swaps }
            });

            return i + 1;
        };

        quicksort(0, n - 1);

        steps.push({
            array: [...arr],
            sorted: Array.from({ length: n }, (_, i) => i),
            description: `Quick Sort completed! Made ${comparisons} comparisons and ${swaps} swaps`,
            metrics: { comparisons, swaps }
        });

        return steps;
    }

    // FIXED: Complete merge sort implementation that goes to the end
    simulateMergeSort(arr) {
        const steps = [];
        const n = arr.length;
        let comparisons = 0, merges = 0;

        steps.push({
            array: [...arr],
            description: `Starting Merge Sort with ${n} elements`,
            metrics: { comparisons, merges }
        });

        const mergeSort = (l, r, depth = 0) => {
            if (l < r) {
                const m = Math.floor((l + r) / 2);

                steps.push({
                    array: [...arr],
                    dividing: [l, m, r],
                    description: `Depth ${depth}: Dividing range [${l}..${r}] at position ${m}`,
                    metrics: { comparisons, merges }
                });

                // Recursively sort left half
                mergeSort(l, m, depth + 1);

                // Recursively sort right half
                mergeSort(m + 1, r, depth + 1);

                // Merge the sorted halves
                merge(l, m, r, depth);
            }
        };

        const merge = (l, m, r, depth) => {
            const n1 = m - l + 1;
            const n2 = r - m;
            const left = arr.slice(l, m + 1);
            const right = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;

            steps.push({
                array: [...arr],
                merging: [l, m, r],
                description: `Depth ${depth}: Merging sorted ranges [${l}..${m}] and [${m+1}..${r}]`,
                metrics: { comparisons, merges }
            });

            // Merge elements in sorted order
            while (i < n1 && j < n2) {
                comparisons++;

                steps.push({
                    array: [...arr],
                    comparing: [l + i, m + 1 + j],
                    merging: [l, m, r],
                    description: `Comparing ${left[i]} and ${right[j]} for position ${k}`,
                    metrics: { comparisons, merges }
                });

                if (left[i] <= right[j]) {
                    arr[k] = left[i];
                    i++;
                } else {
                    arr[k] = right[j];
                    j++;
                }

                steps.push({
                    array: [...arr],
                    merging: [l, m, r],
                    placed: k,
                    description: `Placed ${arr[k]} at position ${k}`,
                    metrics: { comparisons, merges }
                });

                k++;
            }

            // Copy remaining elements from left subarray
            while (i < n1) {
                arr[k] = left[i];
                steps.push({
                    array: [...arr],
                    merging: [l, m, r],
                    placed: k,
                    description: `Copied remaining ${left[i]} from left array`,
                    metrics: { comparisons, merges }
                });
                i++;
                k++;
            }

            // Copy remaining elements from right subarray
            while (j < n2) {
                arr[k] = right[j];
                steps.push({
                    array: [...arr],
                    merging: [l, m, r],
                    placed: k,
                    description: `Copied remaining ${right[j]} from right array`,
                    metrics: { comparisons, merges }
                });
                j++;
                k++;
            }

            merges++;
            steps.push({
                array: [...arr],
                merged: [l, r],
                description: `Completed merge of range [${l}..${r}] - now sorted`,
                metrics: { comparisons, merges }
            });
        };

        mergeSort(0, n - 1);

        // FIXED: Add final completion step
        steps.push({
            array: [...arr],
            sorted: Array.from({ length: n }, (_, i) => i),
            description: `Merge Sort completed! Made ${comparisons} comparisons and ${merges} merges`,
            metrics: { comparisons, merges }
        });

        return steps;
    }

    // FIXED: Realistic selection sort with proper O(n²) behavior
    simulateSelectionSort(arr) {
        const steps = [];
        const n = arr.length;
        let comparisons = 0, swaps = 0;

        steps.push({
            array: [...arr],
            description: `Starting Selection Sort with ${n} elements`,
            metrics: { comparisons, swaps }
        });

        for (let i = 0; i < n; i++) {
            let minIdx = i;

            steps.push({
                array: [...arr],
                current: i,
                description: `Position ${i}: Finding minimum element from remaining ${n - i} elements`,
                metrics: { comparisons, swaps }
            });

            // Find minimum element in remaining unsorted array
            for (let j = i + 1; j < n; j++) {
                comparisons++;
                steps.push({
                    array: [...arr],
                    comparing: [j, minIdx],
                    current: i,
                    description: `Comparing ${arr[j]} at position ${j} with current minimum ${arr[minIdx]}`,
                    metrics: { comparisons, swaps }
                });

                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                    steps.push({
                        array: [...arr],
                        current: i,
                        minimum: minIdx,
                        description: `Found new minimum: ${arr[minIdx]} at position ${minIdx}`,
                        metrics: { comparisons, swaps }
                    });
                }
            }

            // Swap minimum element with first element of unsorted part
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                swaps++;

                steps.push({
                    array: [...arr],
                    swapping: [i, minIdx],
                    description: `Swapped ${arr[i]} into position ${i} - now in sorted position`,
                    metrics: { comparisons, swaps }
                });
            }

            steps.push({
                array: [...arr],
                sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
                description: `Position ${i} complete - first ${i + 1} elements are sorted`,
                metrics: { comparisons, swaps }
            });
        }

        steps.push({
            array: [...arr],
            sorted: Array.from({ length: n }, (_, i) => i),
            description: `Selection Sort completed! Made ${comparisons} comparisons and ${swaps} swaps`,
            metrics: { comparisons, swaps }
        });

        return steps;
    }

    // FIXED: Realistic insertion sort with proper shifting behavior
    simulateInsertionSort(arr) {
        const steps = [];
        const n = arr.length;
        let comparisons = 0, swaps = 0;

        steps.push({
            array: [...arr],
            sorted: [0],
            description: `Starting Insertion Sort - element ${arr[0]} at position 0 is already sorted`,
            metrics: { comparisons, swaps }
        });

        for (let i = 1; i < n; i++) {
            const key = arr[i];
            let j = i - 1;

            steps.push({
                array: [...arr],
                current: i,
                sorted: Array.from({ length: i }, (_, idx) => idx),
                description: `Position ${i}: Inserting ${key} into sorted portion (first ${i} elements)`,
                metrics: { comparisons, swaps }
            });

            // Find correct position and shift elements
            while (j >= 0) {
                comparisons++;
                steps.push({
                    array: [...arr],
                    comparing: [j, i],
                    current: i,
                    description: `Comparing ${arr[j]} with key ${key}`,
                    metrics: { comparisons, swaps }
                });

                if (arr[j] > key) {
                    arr[j + 1] = arr[j];
                    swaps++;

                    steps.push({
                        array: [...arr],
                        swapping: [j, j + 1],
                        current: i,
                        description: `Shifted ${arr[j + 1]} right to position ${j + 1}`,
                        metrics: { comparisons, swaps }
                    });

                    j--;
                } else {
                    break;
                }
            }

            // Insert key at correct position
            arr[j + 1] = key;

            steps.push({
                array: [...arr],
                sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
                description: `Inserted ${key} at position ${j + 1} - first ${i + 1} elements now sorted`,
                metrics: { comparisons, swaps }
            });
        }

        steps.push({
            array: [...arr],
            sorted: Array.from({ length: n }, (_, i) => i),
            description: `Insertion Sort completed! Made ${comparisons} comparisons and ${swaps} shifts`,
            metrics: { comparisons, swaps }
        });

        return steps;
    }

    // FIXED: Use actual arraySize from slider
    generateArray() {
        const size = this.arraySize; // This comes from the slider
        let array = [];

        switch (this.arrayType) {
            case 'random':
                array = Array.from({ length: size }, () => Math.floor(Math.random() * (size * 3)) + 1);
                break;
            case 'reverse':
                array = Array.from({ length: size }, (_, i) => size - i);
                break;
            case 'nearly-sorted':
                array = Array.from({ length: size }, (_, i) => i + 1);
                // Swap a few elements to make it nearly sorted
                for (let i = 0; i < Math.max(1, Math.floor(size / 10)); i++) {
                    const idx1 = Math.floor(Math.random() * size);
                    const idx2 = Math.floor(Math.random() * size);
                    [array[idx1], array[idx2]] = [array[idx2], array[idx1]];
                }
                break;
            case 'duplicates':
                const uniqueValues = Math.max(3, Math.floor(size / 4));
                const values = Array.from({ length: uniqueValues }, (_, i) => (i + 1) * 5);
                array = Array.from({ length: size }, () => 
                    values[Math.floor(Math.random() * values.length)]
                );
                break;
        }

        console.log(`Generated array of size ${size}:`, array);
        return array;
    }

    generateInitialVisualization() {
        const array = this.generateArray();
        if (this.animator) {
            this.animator.drawArray(array);
        }
    }

    updateAlgorithmExplanation(algorithmType) {
        const explanations = {
            'bubble_sort': 'Compares adjacent elements and swaps them if in wrong order. Larger elements "bubble up" to the end.',
            'quick_sort': 'Selects a pivot and partitions array so smaller elements are left, larger right. Recursively sorts partitions.',
            'merge_sort': 'Divides array into halves until single elements, then merges them back in sorted order.',
            'selection_sort': 'Finds the minimum element and places it at the beginning, then repeats for remaining elements.',
            'insertion_sort': 'Builds sorted array one element at a time by inserting each into its correct position.',
            'unknown': 'Upload an OCaml sorting algorithm to see its explanation.'
        };

        const explanation = explanations[algorithmType] || explanations['unknown'];
        document.getElementById('algorithm-explanation').innerHTML = 
            `<h4>How it works:</h4><p>${explanation}</p>`;
    }

    // Playback controls
    play() {
        if (this.sortingSteps.length === 0) {
            alert('Please compile an algorithm first.');
            return;
        }

        this.isPlaying = true;
        this.updatePlaybackButtons();
        this.animate();
    }

    pause() {
        this.isPlaying = false;
        this.updatePlaybackButtons();
    }

    stepBack() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateVisualization();
        }
    }

    stepForward() {
        if (this.currentStep < this.sortingSteps.length - 1) {
            this.currentStep++;
            this.updateVisualization();
        }
    }

    reset() {
        this.currentStep = 0;
        this.isPlaying = false;
        this.updatePlaybackButtons();
        if (this.sortingSteps.length > 0) {
            this.updateVisualization();
        }
    }

    animate() {
        if (!this.isPlaying || this.currentStep >= this.sortingSteps.length - 1) {
            this.isPlaying = false;
            this.updatePlaybackButtons();
            return;
        }

        this.currentStep++;
        this.updateVisualization();

        const delay = Math.max(50, 1100 - (this.animationSpeed * 100));
        setTimeout(() => this.animate(), delay);
    }

    updateVisualization() {
        if (this.sortingSteps[this.currentStep]) {
            this.animator.drawStep(this.sortingSteps[this.currentStep]);
            this.updateStepInfo();
        }
    }

    updateStepInfo() {
        const step = this.sortingSteps[this.currentStep];
        document.getElementById('current-step').textContent = this.currentStep + 1;
        document.getElementById('step-description').textContent = step.description;

        if (step.metrics) {
            document.getElementById('comparison-count').textContent = step.metrics.comparisons || 0;
            document.getElementById('swap-count').textContent = step.metrics.swaps || step.metrics.merges || 0;
            document.getElementById('access-count').textContent = step.metrics.accesses || 0;
        }
    }

    updatePlaybackButtons() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');

        if (this.isPlaying) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
        } else {
            playBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
        }
    }

    // Utility methods
    updateCompilationStatus(type, message) {
        const status = document.getElementById('compilation-status');
        status.className = `compilation-status ${type} visible`;
        status.textContent = message;

        setTimeout(() => {
            status.classList.remove('visible');
        }, 3000);
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showErrorPanel(errors) {
        const panel = document.getElementById('error-panel');
        const errorList = document.getElementById('error-list');

        if (panel && errorList) {
            errorList.innerHTML = errors.map(error => 
                `<div class="error-item">
                    <strong>Line ${error.line}:</strong> ${error.message}
                </div>`
            ).join('');

            panel.style.display = 'block';
        }
    }

    hideErrorPanel() {
        const panel = document.getElementById('error-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    formatCode() {
        const editor = document.getElementById('code-editor');
        if (editor) {
            let code = editor.value;
            code = code.replace(/;\s*\n\s*/g, ';\n  ')
                      .replace(/\blet\b/g, '\nlet')
                      .replace(/\bin\b/g, '\nin ')
                      .trim();
            editor.value = code;
        }
    }

    saveCurrentFile() {
        const content = document.getElementById('code-editor').value;
        if (this.currentFile) {
            this.fileManager.saveFile(this.currentFile, content);
        } else {
            const filename = prompt('Enter filename (with .ml extension):');
            if (filename && filename.trim()) {
                let finalFilename = filename.trim();
                if (!finalFilename.endsWith('.ml')) {
                    finalFilename += '.ml';
                }
                this.fileManager.addFile(finalFilename, content);
                this.currentFile = finalFilename;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sortingVisualizer = new OCamlSortingVisualizer();
});