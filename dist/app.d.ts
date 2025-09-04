interface CalculatorState {
    currentInput: string;
    operator: string | null;
    previousInput: string | null;
    shouldResetDisplay: boolean;
}
type Operation = '+' | '-' | '*' | '/';
declare class Calculator {
    private display;
    private state;
    constructor(displayId: string);
    private initializeEventListeners;
    private handleKeyPress;
    private isDigit;
    private isOperation;
    private updateDisplay;
    private formatNumber;
    clear(): void;
    deleteLast(): void;
    appendNumber(num: string): void;
    appendOperator(op: Operation): void;
    calculate(): void;
    private animateButton;
    getCurrentInput(): string;
    getOperator(): string | null;
    getPreviousInput(): string | null;
}
export { Calculator, type CalculatorState, type Operation };
//# sourceMappingURL=app.d.ts.map