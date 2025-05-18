# AI Therapy Assistant

A mental health application that provides therapeutic conversation, emotional tracking, and crisis resources using advanced NLP and machine learning capabilities.

## Features

- **AI Therapy Conversations**: Engage in therapeutic conversations with an AI assistant trained to provide empathetic responses
- **Emotion Tracking**: Visualize your emotional patterns over time
- **Crisis Detection**: Automatic detection of crisis language with localized mental health resources
- **Diagnostic Summaries**: Get insights about your emotional patterns and concerns
- **External Resources**: Access to mental health information and resources
- **Speech Recognition & Synthesis**: Voice input and output for accessibility

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Recharts (for emotion visualization)
- Lucide React (for icons)
- Web Speech API (for speech recognition and synthesis)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd mental_health_project
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173)

## Deployment on Vercel

This project is configured for seamless deployment on Vercel.

### Deploy with Vercel CLI

1. Install Vercel CLI
   ```
   npm install -g vercel
   ```

2. Login to Vercel
   ```
   vercel login
   ```

3. Deploy the project
   ```
   vercel
   ```

### Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Select the repository
6. Keep the default settings (the project is already configured with vercel.json)
7. Click "Deploy"

## Environment Variables

For production deployment, you may need to set the following environment variables in your Vercel project settings:

- `VITE_OPENROUTER_API_KEY`: API key for OpenRouter (if using)
- `VITE_LLAMA_API_KEY`: API key for Llama model (if using)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Vite, and TailwindCSS
- Uses Recharts for data visualization
- Icons provided by Lucide React 
