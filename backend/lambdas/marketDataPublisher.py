import json
import boto3
import random
import csv

eventbridge = boto3.client('events')
s3 = boto3.client('s3')

BUCKET = 'ai-portfolio-bucket'

def get_stocks():
    obj = s3.get_object(Bucket=BUCKET, Key='historical_prices.csv')
    lines = obj['Body'].read().decode('utf-8').splitlines()
    reader = csv.DictReader(lines)
    return list(set([row['stock'] for row in reader]))

def lambda_handler(event, context):
    stocks = get_stocks()
    events = []

    for stock in stocks:
        price = round(random.uniform(200, 3000), 2)

        events.append({
            'Source': 'market.data',
            'DetailType': 'PriceUpdated',
            'Detail': json.dumps({
                'stock': stock,
                'price': price
            }),
            'EventBusName': 'default'
        })

    for i in range(0, len(events), 10):
        batch = events[i:i+10]
        eventbridge.put_events(Entries=batch)

    return {
        "statusCode": 200,
        "body": json.dumps("Price events sent")
    }