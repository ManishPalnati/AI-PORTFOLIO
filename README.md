Architecture

The system follows a loosely coupled event-driven design, where services communicate via events.

Tech Stack
Frontend: React.js
API Layer: Amazon API Gateway
Backend: AWS Lambda (Python)
Database: Amazon DynamoDB
Event System: Amazon EventBridge / SNS / SQS


Workflow
User interacts with React frontend
API Gateway triggers Lambda functions
Data is stored/retrieved from DynamoDB
Events are generated and processed asynchronously


Key Events
PriceUpdated
PortfolioRevalued
RiskThresholdBreached

Each event triggers independent services, ensuring scalability and flexibility.


Prerequisites
Node.js (v16+)
Python (3.8+)
AWS CLI configured (aws configure)
AWS account with access to:
Lambda
API Gateway
DynamoDB
EventBridge / SNS / SQS


AWS Setup
1. Create DynamoDB Tables
UserPortfolio
StockPrices
RiskMetrics
2. Create Lambda Functions
Price Update
Portfolio Valuation
Risk Calculation
Insight Generation

Upload code and configure triggers.

3. Setup API Gateway
Create REST API
Connect endpoints to Lambda
Enable CORS
4. Configure Event System

Option A: EventBridge

Create event rules for routing events

Option B: SNS + SQS

Create topics and subscribe Lambda functions
5. IAM Roles

Ensure Lambda has permissions for:

DynamoDB access
Event publishing and consumption


Frontend Setup
cd frontend
npm install
npm start

Update API endpoints in:

src/config.js


Backend Setup
cd backend
pip install -r requirements.txt
Dataset
Use provided CSV file in /data
Or generate synthetic portfolio data
Upload into DynamoDB
Running the Project
Deploy backend services on AWS
Start frontend
Trigger events by updating stock prices or portfolios

The system will automatically process events and update results.

Features
Event-driven architecture
Serverless backend (AWS Lambda)
Real-time portfolio evaluation
Risk detection system
Rule-based insights
Scalable and loosely coupled design


Challenges
IAM permission configuration
Event flow design
Managing asynchronous processing
👨‍💻 Author

Manish Kumar Palnati

📄 License

For academic and demonstration purposes only.
