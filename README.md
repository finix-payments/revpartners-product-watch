# Product-Sync

## Setup

1. Log into HubSpot account
2. Go to Settings → Integrations → Private Apps
3. Create a new private app
4. Give it scopes:
   - crm.objects.products.read
   - crm.objects.line_items.read/write
   - crm.objects.deals.read/write
   - crm.objects.quotes.read/write
5. Register Webhook
   - enter target url (Lambda endpoint)
   - listen for product.propertyChange → description
6. Copy Private App API Token
7. Set as environment var "API_TOKEN" in Lambda
