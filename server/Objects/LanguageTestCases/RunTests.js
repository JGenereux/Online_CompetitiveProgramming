const Cpp = require('./cpp')
const Javascript = require("./javascript");
const Language = require("./Language");
const Python = require("./python");

class RunTest {
    language = new Language();
    
    constructor(language) {
        if(language === "javascript") {
            this.language = new Javascript();
        } else if(language === "c++" || language === "c") {
            this.language = new Cpp();
        } else if(language === "python") {
            this.language = new Python();
        }
    }
}

module.exports = RunTest