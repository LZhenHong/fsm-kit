export default abstract class State {
    async enter(from?: State) {
        await this.onEnter(from);
    }

    async exit(to?: State) {
        await this.onExit(to);
    }

    update(dt: number) { }

    protected abstract onEnter(from?: State): Promise<void>;
    protected abstract onExit(to?: State): Promise<void>;
}
