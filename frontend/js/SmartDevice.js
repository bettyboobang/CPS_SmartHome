export class SmartDevice {
    constructor(id, name, meshGroup, defaultState = {}, onStateChange = null) {
        this.id = id;
        this.name = name;
        this.meshGroup = meshGroup;
        this.state = { ...defaultState };
        this.onStateChange = onStateChange;

        // Прив'язка даних для Raycaster
        if (this.meshGroup) {
            this.meshGroup.userData.smartDevice = this;
            this.meshGroup.traverse(child => {
                child.userData.smartDevice = this;
            });
        }
    }

    setState(newState, triggerVisual = true) {
        this.state = { ...this.state, ...newState };
        if (triggerVisual && typeof this.onStateChange === 'function') {
            this.onStateChange(this.state);
        }
    }

    toggle() {
        if (typeof this.state.state !== 'undefined') {
            return { state: !this.state.state };
        }
        if (typeof this.state.locked !== 'undefined') {
            return { locked: !this.state.locked, open: this.state.locked };
        }
        if (typeof this.state.blanketHeating !== 'undefined') {
            return { blanketHeating: !this.state.blanketHeating };
        }
        return this.state;
    }
}