import { State, NullableState } from "./Define";

export default abstract class Relation {
    protected _params: any[] = [];

    get params(): any[] {
        return this._params;
    }

    constructor(...params: any[]) {
        this._params = params;
    }

    updateParams(...params: any[]) {
        this._params = params;
    }

    getParamAt<T>(index: number): T | undefined {
        return this._params[index] as T;
    }

    tryTransition(from: NullableState): boolean {
        return this.canTransition(from);
    }

    protected canTransition(from: NullableState): boolean {
        return true;
    }

    transition(from: NullableState): State {
        return this.onTransition(from);
    }

    protected abstract onTransition(from: NullableState): State;
}
