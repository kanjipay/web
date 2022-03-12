import {db} from './firebase';

var uuid = require('uuid');


interface Item {
    id: String, 
    quantity: Number,
    title: String
}

interface Order {
    merchant_id: String,
    device_id: String,
    requested_items: Array<Item>
}

async function createOrder(req, res){
    try {
        const order: Order = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items']
        }
        console.log(order);
        const orderId = uuid.v4();
        await db.collection('Order').doc(orderId).set(order);
        const reponseBody = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items'],
            order_id: orderId,
            status:"PENDING",
        }
        console.log('response');
        console.log(reponseBody);
        res.status(201).json(reponseBody);
    } catch (error) {
        console.log(error);
        res.status(300).send(`Invalid Order object`)
    }
}

export {createOrder}