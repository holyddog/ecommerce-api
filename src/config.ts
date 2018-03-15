export const Config = {
    MongoUri: 'mongodb://localhost:27017/ecommerce',    
    
    Host: 'http://localhost',
    Port: 3000,
    FilePath: '/files',

    FileDir: 'F:/Workspace/Node.js/ecommerce-api/public',
    LogDir: 'F:/Workspace/Node.js/ecommerce-api/log',
    PaymentSuccessCallbackUrl: 'http://localhost:4200/checkout/complete',
    PaymentFailCallbackUrl: 'http://localhost:4200/checkout/payment',
    PaymentSecretKey: "LGL61SBEZ0XZ",

    AppName: 'ECommerce API',

    Version: {
        base: 0,
        major: 0,
        minor: 1
    }
};