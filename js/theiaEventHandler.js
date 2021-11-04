// Based on https://stackoverflow.com/questions/21817397/event-handler-namespace-in-vanilla-javascript?#answer-44426162

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
