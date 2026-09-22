import cors from "cors";

const allowedOrigins = [
    "http://localhost:3000",
    "https://lowmark-two.vercel.app",
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header.
        // Useful for tools such as Postman and server-to-server requests.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error("Not allowed by CORS")
        );
    },

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],
};

export default cors(corsOptions);