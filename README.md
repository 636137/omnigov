## Proprietary Notice

This code is proprietary to **Maximus**. **No public license is granted**. See [`NOTICE`](./NOTICE).

---

# OmniGov

**Omnichannel Service Orchestration Platform for Government**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FedRAMP](https://img.shields.io/badge/FedRAMP-Ready-blue)](https://fedramp.gov)
[![Section 508](https://img.shields.io/badge/Section%20508-Compliant-green)](https://section508.gov)

## Background

Citizens engage with agencies via phone, email, chat, and online portals, yet legacy systems struggle to provide a seamless omnichannel experience. Government agencies should use a combination of communication channels to serve diverse populations, but no open-source framework unifies these channels into a single citizen journey. Existing tools like Notify.gov handle SMS and Touchpoints handles feedback, but they operate in isolation.

**The Omnichannel Gap:**
- Citizens repeat information across channels
- Agents lack context from previous interactions
- No unified view of citizen journey
- Channel silos create inconsistent experiences
- IRS Service Completion Rate measures holistic performance but lacks tooling

**Regulatory Context:**
- OMB M-23-22 requires consistent, accessible digital experiences
- 21st Century IDEA Act mandates seamless service delivery
- Executive Order on customer experience improvement
- IRS Service Completion Rate methodology for multi-channel measurement

## Need

A citizen who starts a benefits inquiry by phone, follows up via email, and checks status on a web portal should have a continuous, context-aware experience. Without orchestration, citizens repeat information, agents lack context, and service quality degrades.

**Key Pain Points:**
- **Context Loss**: Agents can't see previous interactions
- **Repeat Contacts**: Citizens explain situation multiple times
- **Channel Switching**: No seamless handoff between channels
- **Inconsistent Information**: Different answers across channels
- **No Journey View**: Can't track citizen across touchpoints
- **Agent Inefficiency**: Switching between multiple systems

**Target Outcomes:**
- Reduce repeat contacts by 40%
- Improve first-contact resolution by 30%
- Decrease citizen effort scores
- Enable holistic service measurement (IRS model)

## Solution

A channel-agnostic orchestration layer that maintains citizen interaction context across web, mobile, phone/IVR, SMS, email, chat, and in-person channels. Provides a unified agent desktop, citizen journey timeline, and real-time handoff capabilities.

**Core Capabilities:**
- **Unified Interaction Store**: Single source of truth for all touchpoints
- **Context Engine**: Maintains conversation state across channels
- **Agent Desktop**: 360° view of citizen journey
- **Real-Time Handoff**: Seamless channel switching
- **Journey Analytics**: Track citizen paths and pain points
- **Omnichannel Routing**: Intelligent work distribution

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Citizen Channels                         │
│  Web | Mobile | Phone | SMS | Email | Chat | In-Person     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Channel Adapters (Event Capture)               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Event Bus (Kafka/RabbitMQ)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼─────────┐
│ Interaction  │ │ Context │ │  Routing   │
│    Store     │ │ Engine  │ │   Engine   │
└───────┬──────┘ └──┬──────┘ └──┬─────────┘
        │           │            │
        └───────────┼────────────┘
                    │
        ┌───────────▼────────────┐
        │   Agent Desktop        │
        │  (USWDS Frontend)      │
        └────────────────────────┘
```

### Technology Stack

- **Event Bus**: Apache Kafka or RabbitMQ
- **Interaction Store**: PostgreSQL + Elasticsearch
- **Context Engine**: Redis for real-time state
- **Agent Desktop**: React + USWDS 3.0
- **Channel Adapters**: Node.js microservices
- **Analytics**: Apache Superset or Metabase
- **Infrastructure**: AWS GovCloud or Azure Government

### Channel Adapters

**Web Adapter:**
```javascript
// Capture web interactions
webAdapter.on('pageView', (event) => {
  interactionStore.record({
    citizenId: event.userId,
    channel: 'web',
    type: 'page_view',
    url: event.url,
    timestamp: Date.now()
  });
});
```

**Phone Adapter (CTI Integration):**
```javascript
// Capture phone calls
phoneAdapter.on('callStart', (event) => {
  interactionStore.record({
    citizenId: lookupByPhone(event.ani),
    channel: 'phone',
    type: 'call_start',
    ani: event.ani,
    dnis: event.dnis,
    timestamp: Date.now()
  });
});
```

**SMS Adapter (Notify.gov):**
```javascript
// Integrate with Notify.gov
const notifyAdapter = new NotifyGovAdapter({
  apiKey: process.env.NOTIFY_API_KEY
});

notifyAdapter.on('smsReceived', (event) => {
  interactionStore.record({
    citizenId: lookupByPhone(event.from),
    channel: 'sms',
    type: 'sms_received',
    message: event.body,
    timestamp: Date.now()
  });
});
```

**Email Adapter:**
```javascript
// Capture email interactions
emailAdapter.on('emailReceived', (event) => {
  interactionStore.record({
    citizenId: lookupByEmail(event.from),
    channel: 'email',
    type: 'email_received',
    subject: event.subject,
    body: event.body,
    timestamp: Date.now()
  });
});
```

**Chat Adapter:**
```javascript
// Real-time chat
chatAdapter.on('message', (event) => {
  interactionStore.record({
    citizenId: event.userId,
    channel: 'chat',
    type: 'chat_message',
    message: event.text,
    timestamp: Date.now()
  });
});
```

### Context Engine

Maintains citizen state across channels:

```javascript
const context = await contextEngine.get(citizenId);

// Context includes:
{
  citizenId: "CIT-12345",
  currentIssue: "passport-renewal",
  status: "awaiting-documents",
  lastChannel: "phone",
  lastInteraction: "2026-02-28T10:30:00Z",
  preferences: {
    language: "en",
    contactMethod: "sms"
  },
  history: [
    { channel: "web", action: "started-application", timestamp: "..." },
    { channel: "phone", action: "called-support", timestamp: "..." },
    { channel: "email", action: "sent-documents", timestamp: "..." }
  ]
}
```

### Agent Desktop

Unified view of citizen journey:

```
┌─────────────────────────────────────────────────────────────┐
│  Agent Desktop - John Citizen (CIT-12345)                   │
├─────────────────────────────────────────────────────────────┤
│  Current Issue: Passport Renewal - Awaiting Documents       │
│  Last Contact: Phone call 2 hours ago                       │
├─────────────────────────────────────────────────────────────┤
│  Timeline:                                                   │
│  ├─ 2/28 08:00 AM - Web: Started application               │
│  ├─ 2/28 08:15 AM - Web: Uploaded photo                    │
│  ├─ 2/28 10:30 AM - Phone: Called about document req.      │
│  ├─ 2/28 11:00 AM - Email: Sent birth certificate          │
│  └─ 2/28 02:00 PM - Chat: Current conversation             │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions:                                              │
│  [View Application] [Send SMS] [Schedule Callback]          │
└─────────────────────────────────────────────────────────────┘
```

### Routing Engine

Intelligent work distribution:

```javascript
const routingRules = {
  // Route to agent who handled previous interaction
  preferPreviousAgent: true,
  
  // Route based on skills
  skillBasedRouting: {
    'passport-renewal': ['agent-1', 'agent-2'],
    'visa-application': ['agent-3', 'agent-4']
  },
  
  // Load balancing
  maxQueueSize: 10,
  
  // SLA-based prioritization
  priorityRules: [
    { condition: 'waitTime > 30min', priority: 'high' },
    { condition: 'contactCount > 3', priority: 'high' }
  ]
};
```

### Compliance Alignment

| Requirement | Implementation |
|------------|----------------|
| **OMB M-23-22** | Consistent experience across channels |
| **21st Century IDEA** | Seamless digital service delivery |
| **Section 508** | USWDS agent desktop, accessible to all |
| **FedRAMP** | Cloud deployment on authorized infrastructure |
| **FISMA** | Audit logging of all interactions |
| **Privacy Act** | PII protection, consent management |

## Outcomes

### Target Metrics

- **Repeat Contacts**: 40% reduction
- **First-Contact Resolution**: 30% improvement
- **Citizen Effort Score**: <2.0 (5-point scale)
- **Agent Efficiency**: 25% more interactions handled
- **Channel Switching**: Seamless handoff in <30 seconds
- **Context Accuracy**: 95%+ agent access to full history

### Success Criteria

- Align with IRS Service Completion Rate methodology
- Improve Qualtrics XMI dimensions (Success, Effort, Emotion)
- Reduce average handle time by 20%
- Increase citizen satisfaction by 15 points

## Getting Started

### Prerequisites

```bash
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Kafka or RabbitMQ
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/636137/omnigov.git
cd omnigov

# Start infrastructure
docker-compose up -d postgres redis kafka

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run migrations
npm run db:migrate

# Start services
npm run start:all

# Access agent desktop at http://localhost:3000
```

### Configuration

Create `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/omnigov

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Notify.gov
NOTIFY_API_KEY=your_key

# Phone (CTI)
CTI_PROVIDER=genesys
CTI_API_URL=https://api.genesys.com
CTI_API_KEY=your_key

# Email
EMAIL_PROVIDER=ses
EMAIL_REGION=us-east-1
```

## Channel Integration

### Notify.gov SMS

```javascript
const { NotifyClient } = require('notifications-node-client');

const notify = new NotifyClient(process.env.NOTIFY_API_KEY);

// Send SMS
await notify.sendSms(
  'template-id',
  '+15555551234',
  {
    personalisation: {
      name: 'John Citizen',
      status: 'Your application is being processed'
    }
  }
);
```

### Phone/IVR Integration

```javascript
// Genesys Cloud CTI
const genesys = new GenesysAdapter({
  apiUrl: process.env.CTI_API_URL,
  apiKey: process.env.CTI_API_KEY
});

genesys.on('callArrived', async (call) => {
  const citizen = await lookupByPhone(call.ani);
  const context = await contextEngine.get(citizen.id);
  
  // Screen pop for agent
  await agentDesktop.screenPop({
    agentId: call.agentId,
    citizenId: citizen.id,
    context: context
  });
});
```

### Web Chat

```javascript
// Embed chat widget
<script src="https://omnigov.gov/chat-widget.js"></script>
<script>
  OmniGov.chat.init({
    agency: 'state-dept',
    service: 'passport',
    citizenId: 'CIT-12345'
  });
</script>
```

## API Documentation

### Record Interaction

```bash
POST /api/v1/interactions
{
  "citizenId": "CIT-12345",
  "channel": "phone",
  "type": "call_completed",
  "duration": 420,
  "resolution": "documents-requested",
  "notes": "Citizen needs to submit birth certificate"
}
```

### Get Citizen Context

```bash
GET /api/v1/citizens/CIT-12345/context

Response:
{
  "citizenId": "CIT-12345",
  "currentIssue": "passport-renewal",
  "status": "awaiting-documents",
  "interactions": [...],
  "preferences": {...}
}
```

### Create Handoff

```bash
POST /api/v1/handoffs
{
  "citizenId": "CIT-12345",
  "fromChannel": "phone",
  "toChannel": "chat",
  "context": "Citizen prefers to continue via chat",
  "priority": "normal"
}
```

## Analytics

### Journey Analytics

Track citizen paths:

```
Common Journey: Passport Renewal
├─ Web: Start application (100%)
├─ Web: Upload documents (85%)
├─ Phone: Call about status (40%)
├─ Email: Submit additional docs (25%)
└─ Web: Check status (90%)

Drop-off points:
- Document upload: 15% abandon
- Phone wait time: 10% hang up
```

### Channel Performance

```
Channel Metrics (Last 30 Days):
├─ Web: 45% of interactions, 4.2 satisfaction
├─ Phone: 30% of interactions, 3.8 satisfaction
├─ Email: 15% of interactions, 4.0 satisfaction
├─ Chat: 8% of interactions, 4.5 satisfaction
└─ SMS: 2% of interactions, 4.3 satisfaction
```

## Contributing

We welcome contributions from:
- Federal and state agencies
- Contact center technology vendors
- CX professionals
- Developers

See [CONTRIBUTING.md](CONTRIBUTING.md).

**Priority Areas:**
- Additional channel adapters (social media, video)
- AI-powered routing
- Predictive analytics
- Mobile agent app
- Voice biometrics

## Security

Report security issues to security@example.gov. See [SECURITY.md](SECURITY.md).

## License

MIT License - See [LICENSE](LICENSE).

## Acknowledgments

- Notify.gov (GSA)
- Touchpoints (GSA)
- IRS Service Completion Rate methodology
- Qualtrics XM Institute
- U.S. Web Design System (USWDS)

## Resources

- [Notify.gov](https://github.com/GSA/notifications-api)
- [Touchpoints](https://touchpoints.digital.gov/)
- [IRS Service Completion Rate](https://www.taxpayeradvocate.irs.gov/)
- [OMB M-23-22](https://www.whitehouse.gov/wp-content/uploads/2023/09/M-23-22-Delivering-a-Digital-First-Public-Experience.pdf)
- [Qualtrics XMI](https://www.qualtrics.com/xm-institute/)

---

**Status**: Active Development | **Maintainer**: Omnichannel Team | **Last Updated**: 2026-02-28

<!-- BEGIN COPILOT CUSTOM AGENTS -->
## GitHub Copilot Custom Agents (Maximus Internal)

This repository includes **GitHub Copilot custom agent profiles** under `.github/agents/` to speed up planning, documentation, and safe reviews.

### Included agents
- `implementation-planner` — Creates detailed implementation plans and technical specifications for this repository.
- `readme-creator` — Improves README and adjacent documentation without modifying production code.
- `security-auditor` — Performs a read-only security review (secrets risk, risky patterns) and recommends fixes.

### How to invoke

- **GitHub.com (Copilot coding agent):** select the agent from the agent dropdown (or assign it to an issue) after the `.agent.md` files are on the default branch.
- **GitHub Copilot CLI:** from the repo folder, run `/agent` and select one of the agents, or run:
  - `copilot --agent <agent-file-base-name> --prompt "<your prompt>"`
- **IDEs:** open Copilot Chat and choose the agent from the agents dropdown (supported IDEs), backed by the `.github/agents/*.agent.md` files.

References:
- Custom agents configuration: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Creating custom agents: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents
<!-- END COPILOT CUSTOM AGENTS -->
