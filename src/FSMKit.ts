import { MachineType, StateMachine } from "./Define";
import { ConcurrentStateMachine, NormalStateMachine, PushdownStateMachine } from "./StateMachines";

export default abstract class FSMKit {
    private static _machines: Map<string, StateMachine> = new Map();

    static getOrCreateMachine(name: string, type: MachineType = MachineType.Normal): StateMachine {
        let machine = this._machines.get(name);
        if (!machine) {
            machine = this.createMachine(type);
            this._machines.set(name, machine);
        }
        return machine;
    }

    private static createMachine(type: MachineType): StateMachine {
        switch (type) {
            case MachineType.Normal:
                return new NormalStateMachine();
            case MachineType.Concurrent:
                return new ConcurrentStateMachine();
            case MachineType.Pushdown:
                throw new PushdownStateMachine();
            default:
                throw new Error("Unsupported machine type.");
        }
    }

    static update(dt: number) {
        Array.from(this._machines.values())
            .forEach(machine => machine?.update(dt));
    }

    static deleteMachine(name: string): boolean {
        return this._machines.delete(name);
    }

    static hasMachine(name: string): boolean {
        return this._machines.has(name);
    }

    static clear() {
        this._machines.clear();
    }
}
