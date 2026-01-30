const asyncHandler = (requestHandler) => {
    //Higher order fucntion that takes a function in input and excutes it
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch(
            (err) => next(err)
        )
    }
}

export default asyncHandler;