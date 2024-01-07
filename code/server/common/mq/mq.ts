import * as amqpLib from "amqplib"

export class BaseMq {
    private static conn:amqpLib.Connection
    static async initChannel (uri) {
        BaseMq.conn=await amqpLib.connect(uri)
    }
    async createChannel() {
        let channel=await BaseMq.conn.createChannel()
        return channel
    }
}