export class PaymentLogModel {
    ono?: string; // order_id
    amt?: string; // amount
    apc?: string; // approval_code
    pc?: string; // payment_channel
    ps?: string; // payment_status
    crc?: string; // channel_response_code
    crd?: string; // channel_response_desc
    mp?: string; // masked_pan
    rdt?: Date; // request_timestamp
    tdt?: Date; // transaction_datetime
}