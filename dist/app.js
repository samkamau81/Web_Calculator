class Calculator {
    constructor(displayId) {
        this.display = document.getElementById(displayId);
        this.state = {
            currentInput: '0',
            operator: null,
            previousInput: null,
            shouldResetDisplay: false
        };
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.handleKeyPress(e.key);
        });
        // Touch feedback for mobile
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'translateY(0) scale(0.95)';
            });
            btn.addEventListener('touchend', () => {
                btn.style.transform = '';
            });
        });
    }
    handleKeyPress(key) {
        if (this.isDigit(key) || key === '.') {
            this.appendNumber(key);
        }
        else if (this.isOperation(key)) {
            this.appendOperator(key);
        }
        else if (key === 'Enter' || key === '=') {
            this.calculate();
        }
        else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        }
        else if (key === 'Backspace') {
            this.deleteLast();
        }
    }
    isDigit(key) {
        return key >= '0' && key <= '9';
    }
    isOperation(key) {
        return ['+', '-', '*', '/'].includes(key);
    }
    updateDisplay() {
        this.display.textContent = this.formatNumber(this.state.currentInput);
    }
    formatNumber(num) {
        if (num === 'Error')
            return num;
        const number = parseFloat(num);
        if (isNaN(number))
            return num;
        // Format large numbers with commas
        if (Math.abs(number) >= 1000) {
            return number.toLocaleString('en-US', {
                maximumFractionDigits: 8,
                useGrouping: true
            });
        }
        return number.toString();
    }
    clear() {
        this.state = {
            currentInput: '0',
            operator: null,
            previousInput: null,
            shouldResetDisplay: false
        };
        this.updateDisplay();
        this.animateButton(document.querySelector('.clear'));
    }
    deleteLast() {
        if (this.state.currentInput.length > 1) {
            this.state.currentInput = this.state.currentInput.slice(0, -1);
        }
        else {
            this.state.currentInput = '0';
        }
        this.updateDisplay();
    }
    appendNumber(num) {
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
        }
        else {
            this.state.currentInput += num;
        }
        this.updateDisplay();
    }
    appendOperator(op) {
        // If there's a pending calculation, perform it first
        if (this.state.operator !== null && !this.state.shouldResetDisplay) {
            this.calculate();
        }
        this.state.operator = op;
        this.state.previousInput = this.state.currentInput;
        this.state.shouldResetDisplay = true;
        // Animate operator button
        const operatorBtn = document.querySelector(`[data-operation="${op}"]`);
        if (operatorBtn) {
            this.animateButton(operatorBtn);
        }
    }
    calculate() {
        if (this.state.operator === null || this.state.shouldResetDisplay) {
            return;
        }
        const prev = parseFloat(this.state.previousInput);
        const current = parseFloat(this.state.currentInput);
        if (isNaN(prev) || isNaN(current)) {
            this.state.currentInput = 'Error';
            this.updateDisplay();
            return;
        }
        let result;
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
        }
        catch (error) {
            this.state.currentInput = 'Error';
            console.error('Calculation error:', error);
        }
        this.updateDisplay();
        this.animateButton(document.querySelector('.equals'));
    }
    animateButton(button) {
        if (button) {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 300);
        }
    }
    // Public methods for external access
    getCurrentInput() {
        return this.state.currentInput;
    }
    getOperator() {
        return this.state.operator;
    }
    getPreviousInput() {
        return this.state.previousInput;
    }
}
// Global calculator instance
let calculator;
// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    calculator = new Calculator('display');
});
// Global functions for HTML button clicks (to maintain compatibility)
function clearDisplay() {
    calculator?.clear();
}
function deleteLast() {
    calculator?.deleteLast();
}
function appendToDisplay(value) {
    if (['+', '-', '*', '/'].includes(value)) {
        calculator?.appendOperator(value);
    }
    else {
        calculator?.appendNumber(value);
    }
}
function calculate() {
    calculator?.calculate();
}
// Export for module usage
export { Calculator };
//# sourceMappingURL=app.js.map