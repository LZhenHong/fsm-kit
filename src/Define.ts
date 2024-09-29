export enum MachineType {
    Normal,
    /** 并行 */
    Concurrent,
    /** 下推 */
    Pushdown
}

type Nullable<T> = T | undefined | null;

export type State = InstanceType<typeof import("./State").default>;
export type NullableState = Nullable<State>;

export type Relation = InstanceType<typeof import("./Relation").default>;

export type NormalStateMachine = InstanceType<typeof import("./StateMachines").NormalStateMachine>;
export type ConcurrentStateMachine = InstanceType<typeof import("./StateMachines").ConcurrentStateMachine>;
export type PushdownStateMachine = InstanceType<typeof import("./StateMachines").PushdownStateMachine>;
export type StateMachine = NormalStateMachine | ConcurrentStateMachine | PushdownStateMachine;
