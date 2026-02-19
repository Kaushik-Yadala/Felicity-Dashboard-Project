module.exports.authorization = (allowedRole) => {
    return (req,res,next) => {
        
        if (!req.user || !req.user.role){
            return res.status(403).json({success: false, message: 'Unauthenticated user'});
        }

        if (!allowedRole.includes(req.user.role)) {
            return res.status(403).json({success: false, message: 'Unauthorized user'});
        }

        next();
    }
}