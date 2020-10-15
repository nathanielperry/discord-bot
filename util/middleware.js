class Middleware {
    constructor() {
        this.stack = [];
        this.step = 0;
        this.ejected = false;
    }
    
    use(fn) {
        this.stack.push(fn);
    }

    next() {
        if (!this.ejected && this.step < this.stack.length) {
            this.stack[this.step++](this.hook, this.next.bind(this), this.eject.bind(this));
        }
    }

    eject() {
        this.ejected = true;
    }
    
    run(hook) {
        this.hook = hook || {};
        this.step = 0;
        this.ejected = false;
        this.next();

        return this;
    }
}

module.exports = Middleware;