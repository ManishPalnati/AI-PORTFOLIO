import json
import boto3
import csv
from decimal import Decimal

s3 = boto3.client('s3')
eventbridge = boto3.client('events')
dynamodb = boto3.resource('dynamodb')

BUCKET = 'ai-portfolio-bucket'
table = dynamodb.Table('portfolio_import_new')

def read_csv(file_key):
    obj = s3.get_object(Bucket=BUCKET, Key=file_key)
    lines = obj['Body'].read().decode('utf-8').splitlines()
    return list(csv.DictReader(lines))

def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }

def lambda_handler(event, context):

    method = event.get("requestContext", {}).get("http", {}).get("method")

    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": ""
        }

    if method == "POST":
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)

        user_id = int(body["user_id"])
        stock = body["stock"]
        quantity = Decimal(str(body["quantity"]))
        buy_price = Decimal(str(body["buy_price"]))

        table.put_item(
            Item={
                "user_id": user_id,
                "stock": stock,
                "quantity": quantity,
                "buy_price": buy_price
            }
        )

        return response(200, {"message": "added"})

    if method == "DELETE":
        try:
            body = event.get("body") or "{}"

            if isinstance(body, str):
                body = json.loads(body)

            print("DELETE BODY:", body)

            user_id = body.get("user_id")
            stock = body.get("stock")

            if user_id is None or stock is None:
                return response(400, {"error": "missing fields"})

            table.delete_item(
                Key={
                    "user_id": int(user_id),
                    "stock": str(stock).upper().strip()
                }
            )

            print("DELETED:", stock)

            return response(200, {"message": "deleted"})

        except Exception as e:
            print("DELETE ERROR:", str(e))
            return response(500, {"error": str(e)})

    if method == "PUT":
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)

        user_id = int(body["user_id"])
        stock = body["stock"]
        quantity = Decimal(str(body["quantity"]))

        table.update_item(
            Key={
                "user_id": user_id,
                "stock": stock
            },
            UpdateExpression="SET quantity = :q",
            ExpressionAttributeValues={
                ":q": quantity
            }
        )

        return response(200, {"message": "updated"})

    query = event.get("queryStringParameters") or {}
    user_id = int(query.get("user_id", "1"))

    response_db = table.scan()
    all_rows = response_db['Items']

    portfolio = [
        row for row in all_rows
        if str(row.get("user_id")) == str(user_id)
    ]

    prices = read_csv('historical_prices.csv')
    all_stocks = list(set([row['stock'] for row in prices]))

    price_table = dynamodb.Table('StockPrices')
    price_map = {}

    response_prices = price_table.scan()
    for item in response_prices['Items']:
        price_map[item['stock']] = float(item['price'])

    total_investment = 0
    total_value = 0
    detailed_data = []

    for row in portfolio:
        stock = row['stock']
        qty = float(row['quantity'])
        buy_price = float(row['buy_price'])

        current_price = price_map.get(stock, buy_price)

        investment = qty * buy_price
        value = qty * current_price
        profit = value - investment

        total_investment += investment
        total_value += value

        detailed_data.append({
            "stock": stock,
            "quantity": qty,
            "buy_price": buy_price,
            "current_price": current_price,
            "profit": round(profit, 2)
        })

    total_profit = total_value - total_investment

    if total_profit < 0:
        risk = "High"
        recommendation = "Portfolio underperforming"
    elif total_profit < 500:
        risk = "Medium"
        recommendation = "Stable but can improve"
    else:
        risk = "Low"
        recommendation = "Healthy portfolio"

    eventbridge.put_events(
        Entries=[{
            'Source': 'portfolio.app',
            'DetailType': 'RiskThresholdBreached',
            'Detail': json.dumps({
                'user_id': user_id,
                'risk': risk,
                'profit': total_profit
            }),
            'EventBusName': 'default'
        }]
    )

    return response(200, {
        "user_id": user_id,
        "totalInvestment": total_investment,
        "currentValue": total_value,
        "profit": total_profit,
        "risk": risk,
        "recommendation": recommendation,
        "holdings": detailed_data,
        "allStocks": all_stocks
    })