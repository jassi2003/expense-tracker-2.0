import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {

        const { token } = req.headers

        console.log("Received Token:", token);

        if (!token) {
            console.log("No token provided.");
            return res.status(401).json({
                message: "Not authorized",
                error: true,
                success: false,
            });
        }

        // Verify the token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = token_decode.payload;
        next();

    } catch (err) {
        console.log("JWT Error:", err);
        return res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
};


export default authUser;

