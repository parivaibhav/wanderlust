//wrapAsync function is used to error handling from backend and avoid to server crash

module.exports = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
};
