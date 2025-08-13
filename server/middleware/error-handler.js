export function errorHandler(err, req, res, next) {
    console.error('Error caught:', err);

    const status = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    const response = {
        status: 'Error',
        message,
    };

    if (process.env.NODE_ENV === 'development') {
        response.error = err.message;
        response.stack = err.stack;
    }

    res.status(status).json(response);
}