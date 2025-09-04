interface CalculatorState {
    currentInput: string;
    operator: string | null;
    previousInput: string | null;
    shouldResetDisplay: boolean;
}

type Operation = '+' | '-' | '*' | '/';

class Calculator {
    private display: HTMLElement;
    private state: CalculatorState;

    constructor(displayId: string) {
        this.display = document.getElementById(displayId)!;
        this.state = {
            currentInput: '0',
            operator: null,
            previousInput: null,
            shouldResetDisplay: false
        };
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        // Keyboard support
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            e.preventDefault();
            this.handleKeyPress(e.key);
        });

        // Touch feedback for mobile
        document.querySelectorAll<HTMLButtonElement>('.btn').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'translateY(0) scale(0.95)';
            });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = '';
            });
        });
    }

    private handleKeyPress(key: string): void {
        if (this.isDigit(key) || key === '.') {
            this.appendNumber(key);
        } else if (this.isOperation(key)) {
            this.appendOperator(key as Operation);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.deleteLast();
        }
    }

    private isDigit(key: string): boolean {
        return key >= '0' && key <= '9';
    }

    private isOperation(key: string): boolean {
        return ['+', '-', '*', '/'].includes(key);
    }

    private updateDisplay(): void {
        this.display.textContent = this.formatNumber(this.state.currentInput);
    }

    private formatNumber(num: string): string {
        if (num === 'Error') return num;
        
        const number = parseFloat(num);
        if (isNaN(number)) return num;
        
        // Format large numbers with commas
        if (Math.abs(number) >= 1000) {
            return number.toLocaleString('en-US', { 
                maximumFractionDigits: 8,
                useGrouping: true 
            });
        }
        
        return number.toString();
    }

    public clear(): void {
        this.state = {
            currentInput: '0',
            operator: null,
            previousInput: null,
            shouldResetDisplay: false
        };
        this.updateDisplay();
        this.animateButton(document.querySelector('.clear') as HTMLElement);
    }

    public deleteLast(): void {
        if (this.state.currentInput.length > 1) {
            this.state.currentInput = this.state.currentInput.slice(0, -1);
        } else {
            this.state.currentInput = '0';
        }
        this.updateDisplay();
    }

    public appendNumber(num: string): void {
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = '';
            this.state.shouldResetDisplay = false;
        }

        // Prevent multiple decimal points
        if (num === '.' && this.state.currentInput.includes('.')) {
            return;
        }

        // Replace leading zero with number (except for decimal)
        if (this.state.currentInput === '0' && num !== '.') {
            this.state.currentInput = num;
        } else {
            this.state.currentInput += num;
        }

        this.updateDisplay();
    }

    public appendOperator(op: Operation): void {
        // If there's a pending calculation, perform it first
        if (this.state.operator !== null && !this.state.shouldResetDisplay) {
            this.calculate();
        }

        this.state.operator = op;
        this.state.previousInput = this.state.currentInput;
        this.state.shouldResetDisplay = true;

        // Animate operator button
        const operatorBtn = document.querySelector(`[data-operation="${op}"]`) as HTMLElement;
        if (operatorBtn) {
            this.animateButton(operatorBtn);
        }
    }

    public calculate(): void {
        if (this.state.operator === null || this.state.shouldResetDisplay) {
            return;
        }

        const prev = parseFloat(this.state.previousInput!);
        const current = parseFloat(this.state.currentInput);

        if (isNaN(prev) || isNaN(current)) {
            this.state.currentInput = 'Error';
            this.updateDisplay();
            return;
        }

        let result: number;
        
        try {
            switch (this.state.operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = prev / current;
                    break;
                default:
                    return;
            }

            // Handle floating point precision
            result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
            
            this.state.currentInput = result.toString();
            this.state.operator = null;
            this.state.previousInput = null;
            this.state.shouldResetDisplay = true;
            
        } catch (error) {
            this.state.currentInput = 'Error';
            console.error('Calculation error:', error);
        }

        this.updateDisplay();
        this.animateButton(document.querySelector('.equals') as HTMLElement);
    }

    private animateButton(button: HTMLElement | null): void {
        if (button) {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 300);
        }
    }

    // Public methods for external access
    public getCurrentInput(): string {
        return this.state.currentInput;
    }

    public getOperator(): string | null {
        return this.state.operator;
    }

    public getPreviousInput(): string | null {
        return this.state.previousInput;
    }
}

// Global calculator instance
let calculator: Calculator;

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    calculator = new Calculator('display');
});

// Global functions for HTML button clicks (to maintain compatibility)
function clearDisplay(): void {
    calculator?.clear();
}

function deleteLast(): void {
    calculator?.deleteLast();
}

function appendToDisplay(value: string): void {
    if (['+', '-', '*', '/'].includes(value)) {
        calculator?.appendOperator(value as Operation);
    } else {
        calculator?.appendNumber(value);
    }
}

function calculate(): void {
    calculator?.calculate();
}

// Export for module usage
export { Calculator, type CalculatorState, type Operation };