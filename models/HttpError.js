class HttpError extends Error {
    constructor(message,codeError) {
        super(message);
        this.code=codeError;
        console.log(this.code)
    }
}


module.exports=HttpError;