class EventHandlerClass {
    constructor() {
        this.functionMap = {};
    }

    addEventListener(target, event, func) {
        this.functionMap[event] = func;
        target.addEventListener(event.split('.')[0], this.functionMap[event]);
    }

    removeEventListener(target, event) {
        target.removeEventListener(event.split('.')[0], this.functionMap[event]);
        delete this.functionMap[event];
    }
}

export const theiaEventHandler = new EventHandlerClass();
