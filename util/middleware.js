class Middleware {
    constructor() {
        this.stack = [];
        this.step = 0;
    }
    
    use(fn) {
        this.stack.push(fn);
    }

    next() {
        if (this.step < this.stack.length) {
            this.stack[this.step++](this.hook, this.next.bind(this));
        }
    }
    
    run(hook) {
        this.hook = hook || {};
        this.step = 0;
        this.next();
    }
}

module.exports = Middleware;