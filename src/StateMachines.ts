import { MachineType, NullableState, Relation, State } from "./Define";

export class NormalStateMachine {
    get type(): MachineType {
        return MachineType.Normal;
    }

    private _current: NullableState;

    get current(): NullableState {
        return this._current;
    }

    constructor(initialState?: State) {
        this._current = initialState;
    }

    async start(state: NullableState) {
        state && (this._current = state);
        if (!this._current) {
            throw new Error("No initial state set.");
        }
        await this._current?.enter();
    }

    async stop() {
        await this._current?.exit();
    }

    async transition(relation: NonNullable<Relation>): Promise<boolean> {
        let from = this._current;
        if (!relation.tryTransition(from)) {
            return false;
        }

        try {
            let to = relation.transition(from);
            await this._current?.exit(to);
            this._current = to;
            await this._current?.enter(from || undefined);
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    update(dt: number) {
        this._current?.update(dt);
    }
}

export class ConcurrentStateMachine {
    get type(): MachineType {
        return MachineType.Concurrent;
    }

    private _currents: NullableState[] = [];

    get states(): State[] {
        return this._currents.filter(state => !!state) as State[];
    }

    constructor(...initialStates: NonNullable<State>[]) {
        this._currents = initialStates;
    }

    append(state: NonNullable<State>) {
        this._currents.push(state);
    }

    async start(...states: NonNullable<State>[]) {
        this._currents = states;
        await Promise.all(this.states.map(state => state.enter()));
    }

    async stop() {
        await Promise.all(this.states.map(state => state.exit()));
    }

    async transition(relation: NonNullable<Relation>): Promise<boolean[]> {
        let transiteFn = async (from: NullableState) => {
            let success = false;
            let to: NullableState = null;
            if (relation.tryTransition(from)) {
                try {
                    to = relation.transition(from);
                    await from?.exit(to);
                    await to.enter(from || undefined);
                    success = true;
                } catch (error) {
                    console.error(error);
                }
            }
            return { success, to };
        }
        let results = await Promise.all(this._currents.map(transiteFn));
        this._currents = results.map(result => result.to);
        return results.map(result => result.success);
    }

    update(dt: number) {
        this.states.forEach(state => state.update(dt));
    }
}

export class PushdownStateMachine {
    get type(): MachineType {
        return MachineType.Pushdown;
    }

    private _stack: NullableState[] = [];

    get stack(): State[] {
        return this._stack.filter(state => !!state) as State[];
    }

    get current(): NullableState {
        return this._stack[this._stack.length - 1];
    }

    constructor(initialState?: State) {
        if (initialState) {
            this._stack.push(initialState);
        }
    }

    push(state: NonNullable<State>) {
        this._stack.push(state);
    }

    pop() {
        return this._stack.pop();
    }

    async start(...states: NonNullable<State>[]) {
        this._stack = states;
        await Promise.all(this.stack.map(state => state.enter()));
    }

    async stop() {
        await Promise.all(this.stack.map(state => state.exit()));
    }

    async transition(relation: NonNullable<Relation>): Promise<boolean> {
        let from = this.current;
        if (!relation.tryTransition(from)) {
            return false;
        }

        try {
            let to = relation.transition(from);
            await from?.exit(to);
            await to.enter(from || undefined);
            this.push(to);
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    async rollback(): Promise<boolean> {
        let from = this.pop();
        if (!from) {
            return false;
        }

        let to = this.current;
        await from.exit(to || undefined);
        await to?.enter(from);
        return true;
    }

    update(dt: number) {
        this.current?.update(dt);
    }
}
