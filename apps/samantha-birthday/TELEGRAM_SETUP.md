# Telegram Setup Guide for Samantha

Follow these steps to enable Telegram notifications for Samantha Birthday Assistant.

## Step 1: Create a Telegram Bot

1. Open Telegram on your phone or computer
2. Search for **@BotFather** (official bot from Telegram)
3. Start a conversation with BotFather
4. Send the command: `/newbot`
5. BotFather will ask you to choose a name for your bot
   - Example: "Samantha Birthday Bot"
6. Next, choose a username for your bot (must end in 'bot')
   - Example: "samantha_birthday_bot" or "jamieBirthdayBot"
7. BotFather will respond with your **bot token**
   - It looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890`
   - **Save this token securely!** This is your `TELEGRAM_BOT_TOKEN`

## Step 2: Get Your Chat ID

### Method 1: Using @userinfobot (Easiest)

1. Open Telegram
2. Search for **@userinfobot**
3. Start a conversation with it
4. It will immediately send you your user information
5. Copy the number shown as "Id:" - this is your `TELEGRAM_CHAT_ID`
   - Example: `123456789`

### Method 2: Using @raw_data_bot

1. Open Telegram
2. Search for **@raw_data_bot**
3. Start a conversation with it
4. It will send you JSON data
5. Look for `"from": { "id": 123456789 }`
6. That number is your `TELEGRAM_CHAT_ID`

### Method 3: Using your bot (More technical)

1. Start a conversation with your newly created bot (the one from Step 1)
2. Send any message to your bot (e.g., "Hello")
3. Open this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. You'll see JSON data. Look for:
   ```json
   "chat": {
     "id": 123456789,
     ...
   }
   ```
5. That `id` number is your `TELEGRAM_CHAT_ID`

## Step 3: Configure Samantha

Add these environment variables to your system:

### For Development (Local)
Create a `.env` file in the project root:
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
TELEGRAM_CHAT_ID=123456789
```

### For Docker Deployment
Add to your `docker-compose.yml`:
```yaml
services:
  samantha-birthday:
    environment:
      - TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
      - TELEGRAM_CHAT_ID=123456789
```

Or pass as environment variables when running Docker:
```bash
docker run -e TELEGRAM_BOT_TOKEN="your_token" -e TELEGRAM_CHAT_ID="your_chat_id" ...
```

### For Production (Secrets Management)
Store these as **secrets** in your deployment platform:
- Kubernetes: Use Secrets
- Cloud platforms: Use their secret management (AWS Secrets Manager, GCP Secret Manager, etc.)
- Never commit tokens to Git!

## Step 4: Test the Setup

1. Start Samantha:
   ```bash
   npx nx serve samantha-birthday
   ```

2. Check the logs for:
   ```
   📱 Telegram notifier initialized
   ✅ Telegram message sent successfully
   ```

3. You should receive a Telegram message:
   ```
   🎂 Samantha Birthday Assistant
   
   ✅ Service started successfully
   🚀 Ready to track birthdays
   
   I'll notify you about upcoming birthdays every day! 🎉
   ```

## Troubleshooting

### "Telegram not configured" warning
- Check that both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set
- Verify the environment variables are loaded correctly

### "Failed to send Telegram message" error
- Verify your bot token is correct
- Make sure you've started a conversation with your bot (send it any message first)
- Check that your chat ID is correct
- Ensure your bot hasn't been blocked

### Bot doesn't respond
- Bots need to be started by sending them a message first
- Use `/start` command in your bot's chat

## Security Notes

- **Never share your bot token publicly!**
- Bot tokens give full control over your bot
- Store tokens in environment variables, never in code
- Rotate tokens if compromised (create a new bot)
- Use `.gitignore` to exclude `.env` files from version control

## Your Information

- **Phone:** +14036206143
- **Bot Token:** (Set after creating bot with @BotFather)
- **Chat ID:** (Get from @userinfobot or @raw_data_bot)

Once configured, Samantha will send you Telegram notifications when:
- She starts up
- Upcoming birthdays are detected (future feature)
