# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the `flow-v2` directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Getting Your OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy the key and paste it into your `.env.local` file

## Important Notes

- Never commit your `.env.local` file to git
- The `.env.local` file is already in `.gitignore`
- You need a valid OpenAI API key for the app to function

