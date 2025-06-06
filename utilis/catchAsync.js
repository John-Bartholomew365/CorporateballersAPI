const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
// This utility function is used to wrap asynchronous functions in Express.js routes. It catches any errors that occur during the execution of the function and passes them to the next middleware (error handling middleware) using the `next` function. This helps to avoid repetitive try-catch blocks in route handlers and keeps the code cleaner and more readable.