import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
price_table = dynamodb.Table('StockPrices')

def lambda_handler(event, context):

    print(" Event received:", event)

    #  HANDLE SQS WRAPPER
    records = event.get("Records", [])

    for record in records:
        body = json.loads(record.get("body", "{}"))

        detail = body.get("detail", {})
        detail_type = body.get("detail-type", "")

        #  1. HANDLE MARKET DATA
        if detail_type == "PriceUpdated":
            stock = detail.get("stock")
            price = detail.get("price")

            if stock and price:
                price_table.put_item(
                    Item={
                        "stock": stock,
                        "price": Decimal(str(price))
                    }
                )

                print(f"PRICE UPDATED → {stock}: {price}")

        #  2. HANDLE RISK EVENTS
        elif detail_type == "RiskThresholdBreached":
            user_id = detail.get("user_id")
            risk = detail.get("risk")
            profit = detail.get("profit")

            if risk == "High":
                print(f"HIGH RISK USER: {user_id}")
            elif risk == "Medium":
                print(f"MEDIUM RISK USER: {user_id}")
            else:
                print(f"LOW RISK USER: {user_id}")

    return {"status": "processed"}