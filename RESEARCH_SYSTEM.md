# Lead Research System

This document describes the automated lead research system that provides live research capabilities using background workers and AI agents.

## Overview

The research system automatically processes leads to gather additional business information using AI-powered research agents. The system provides:

- **Background Processing**: Automated research tasks running in the background
- **Live Updates**: Real-time research progress display in the UI
- **AI-Powered Research**: Claude agent with Perplexity web-search tool (structured by OpenAI) that gathers company data
- **Activity Tracking**: Detailed logging of all research activities

## Architecture

### Background Worker
- **Service**: `src/services/research-worker.ts`
- **Frequency**: Processes leads every 45 seconds
- **Batch Size**: 5 leads per cycle
- **Parallel Processing**: Multiple leads researched simultaneously

### Research Pipeline
1. **Discovery**: Find leads with `researchStatus = 'PENDING'`
2. **Assignment**: Assign leads to available AI agents
3. **Research**: Perform AI-powered company research
4. **Data Storage**: Store findings in `Lead.researchData` JSON field
5. **Activity Logging**: Create activity records for each research step

### Frontend Features
- **Auto-refresh**: Lead list refreshes every 20 seconds
- **Live Indicators**: Visual research status with spinners and badges
- **Activity Polling**: Sidebar activities update every 5 seconds
- **Research Triggers**: Manual research trigger buttons

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Add to your `.env.local`:
```env
# Perplexity (web search tool)
PERPLEXITY_API_KEY=your_perplexity_api_key

# Anthropic (Claude agent)
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI (structured output normalizer)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Run Database Migrations
```bash
npm run db:push
```

### 4. Start the System

#### Development Mode
```bash
npm run dev
```

#### Starting the Research Worker
1. Navigate to `/admin/research-worker` in your browser
2. Click "Start Worker" to begin processing leads
3. The worker will process 5 leads every 45 seconds

#### Alternative: API Control
You can also control the worker via API:
```bash
# Start worker
curl -X POST http://localhost:3000/api/research-worker

# Stop worker
curl -X DELETE http://localhost:3000/api/research-worker

# Check status
curl http://localhost:3000/api/research-worker
```

## Usage

### Automatic Research
1. Upload leads via spreadsheet
2. Leads are automatically queued for research (`researchStatus: 'PENDING'`)
3. Background worker picks up leads and processes them
4. Watch real-time progress in the UI

### Manual Research Triggers
1. Navigate to the AI Lead Intake page
2. Find leads with "Pending" or "Failed" research status
3. Click the "Research" button next to the lead
4. Watch the research progress with live updates

### Monitoring Research Progress

#### Lead List View
- **Yellow Badge**: Research pending
- **Blue Badge with Spinner**: Research in progress
- **Green Badge**: Research completed
- **Red Badge**: Research failed

#### Lead Sidebar
- Open any lead's sidebar to see detailed activity timeline
- Activities auto-refresh every 5 seconds when sidebar is open
- View research results in the "Research Data" section

## Research Types

### Company Information
- Industry classification
- Estimated monthly revenue
- Employee count estimates
- Business description
- Website validation

### Contact Validation
- Email validation
- Phone number verification
- Social media profiles

### Business Analysis
- Industry categorization
- Revenue range estimation
- Risk assessment
- Business legitimacy validation

## API Endpoints

### Trigger Manual Research
```
POST /api/leads/[id]/research
```

### Get Research Status
```
GET /api/leads/[id]/research
```

### View Lead Activities
```
GET /api/leads/[id]/activities
```

## Configuration

### Worker Settings
Edit `src/services/research-worker.ts`:
- `batchSize`: Number of leads processed per cycle (default: 5)
- `intervalMs`: Processing interval in milliseconds (default: 45000)
- Provider: Worker uses a Claude tool-use loop with a Perplexity search tool. Configure `ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY`.

### UI Refresh Rates
- Lead list: 20 seconds (configurable in `ai-lead-intake/page.tsx`)
- Activity timeline: 5 seconds (configurable in `ActivityTimeline.tsx`)

## Troubleshooting

### Research Worker Not Starting
- Check Perplexity API key is set (`PERPLEXITY_API_KEY`)
- Check Anthropic API key is set (`ANTHROPIC_API_KEY`)
- Verify database connection
- Check console logs for error messages

### No Research Activities Appearing
- Ensure leads have `researchStatus: 'PENDING'`
- Check if AI agents exist in the database
- Verify research worker is running

### UI Not Updating
- Check browser console for polling errors
- Verify API endpoints are accessible
- Check if auto-refresh intervals are set up correctly

## Database Schema

### Lead Research Fields
```sql
researchStatus: PENDING | IN_PROGRESS | COMPLETED | FAILED
researchData: JSONB -- Stores AI research findings
researchedAt: TIMESTAMP -- When research was completed
```

### Activity Types for Research
- `AI_ACTION`: Agent assignment
- `LEAD_RESEARCH`: Research activities and results
- `LEAD_QUALIFICATION`: General lead processing

## Performance Considerations

- Research worker processes 5 leads every 45 seconds
- Frontend polling is optimized to minimize API calls
- Database queries use proper indexing for performance
- AI API calls are rate-limited to prevent quota exhaustion

## Future Enhancements

- WebSocket integration for real-time updates
- Research task prioritization
- Advanced research agent specialization
- Research result quality scoring
- Integration with external data sources
- Native Mastra agent tools (web search/scrape) and structured outputs validation
