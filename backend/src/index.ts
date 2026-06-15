import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { startMonitor } from './services/monitor.service';
import UserConfig from './models/UserConfig';
import Position from './models/Position';
import RescueExecution from './models/RescueExecution';
import Protocol from './models/Protocol';
import Agent from './models/Agent';
import authRoutes from './routes/auth.route';
import { veniceAI } from './services/venice.service';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Gather context
    const positions = await Position.find({ userAddress: userId });
    const executions = await RescueExecution.find({ userAddress: userId }).sort({ executedAt: -1 }).limit(3);
    const config = await UserConfig.findOne({ address: userId });
    
    const context = {
      activePositions: positions,
      recentRescues: executions
    };

    const reply = await veniceAI.chatWithContext(message, context, config?.veniceApiKey);
    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users
app.get('/api/users/:address', async (req, res) => {
  try {
    let config = await UserConfig.findOne({ address: req.params.address });
    if (!config) {
      config = await UserConfig.create({ address: req.params.address });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/:address', async (req, res) => {
  try {
    const config = await UserConfig.findOneAndUpdate(
      { address: req.params.address },
      req.body,
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Positions
app.get('/api/users/:address/positions', async (req, res) => {
  try {
    const positions = await Position.find({ userAddress: req.params.address });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/positions', async (req, res) => {
  try {
    const position = await Position.create(req.body);
    res.json(position);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Executions
app.get('/api/users/:userId/executions', async (req, res) => {
  try {
    const executions = await RescueExecution.find({ userAddress: req.params.userId }).sort({ executedAt: -1 }).limit(10);
    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear Dashboard
app.delete('/api/users/:userId/clear', async (req, res) => {
  try {
    const { userId } = req.params;
    await Position.deleteMany({ userAddress: userId });
    await RescueExecution.deleteMany({ userAddress: userId });
    res.json({ message: 'Dashboard cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Demo Positionries
app.get('/api/protocols', async (req, res) => {
  try {
    const protocols = await Protocol.find();
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new Agent
app.post('/api/agents', async (req, res) => {
  try {
    const { name, agentType, url, owner } = req.body;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    // Mock Venice AI evaluation for hackathon demo
    const riskScore = Math.floor(Math.random() * 40) + 10; // 10-50 score
    const veniceReasoning = `Evaluated via Venice AI. Agent exhibits standard ${agentType} patterns. Moderate risk acceptable.`;

    const newAgent = await Agent.create({
      id,
      name,
      agentType,
      url,
      owner,
      riskScore,
      veniceReasoning,
      audited: false,
      ratingScore: 5, // Start with a default 5-star rating from creator
      ratingCount: 1,
      feedbacks: [{
        userId: owner,
        rating: 5,
        comment: 'Initial deployment rating.',
        createdAt: new Date()
      }]
    });
    
    res.json(newAgent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rate an Agent
app.post('/api/agents/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;

    const agent = await Agent.findOne({ id });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Append feedback
    agent.feedbacks.push({ userId, rating, comment, createdAt: new Date() });
    
    // Recalculate average rating
    const totalRating = agent.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    agent.ratingCount = agent.feedbacks.length;
    agent.ratingScore = totalRating / agent.ratingCount;

    await agent.save();
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed data route for testing
app.post('/api/seed', async (req, res) => {
  try {
    await Protocol.deleteMany({});
    await Agent.deleteMany({});
    
    await Protocol.create({
      id: 'aave-v3-base', name: 'Aave V3', chainId: 8453, poolAddress: '0x123', oracleAddress: '0x456',
      liquidationThreshold: 8000, liquidationPenalty: 1500, riskScore: 12, tvl: 150000000, audited: true, exploits: 0,
      veniceReasoning: 'Audited, high TVL, low risk.'
    });
    
    await Agent.create([
      {
        id: 'sentinel-executor-v1', name: 'Sentinel Official Executor', agentType: 'Executor', 
        successCount: 150, failCount: 2, riskScore: 5, owner: '0x789', audited: true,
        veniceReasoning: 'High success rate. Audited by Sentinel team. Low risk.',
        ratingScore: 4.8, ratingCount: 125,
        feedbacks: [{ userId: '0xabc', rating: 5, comment: 'Saved me twice.', createdAt: new Date() }]
      },
      {
        id: 'yield-optimizer-pro', name: 'Yield Optimizer Pro', agentType: 'Strategy', 
        successCount: 840, failCount: 15, riskScore: 25, owner: '0x111', audited: true,
        veniceReasoning: 'Consistent APY generation. Open source contracts. Moderate risk due to complex routing.',
        ratingScore: 4.5, ratingCount: 89,
        feedbacks: []
      },
      {
        id: 'flash-loan-defender', name: 'Flash Loan Defender', agentType: 'Security', 
        successCount: 42, failCount: 0, riskScore: 10, owner: '0x222', audited: true,
        veniceReasoning: 'Excellent track record in preventing MEV attacks. Highly trusted.',
        ratingScore: 5.0, ratingCount: 12,
        feedbacks: []
      },
      {
        id: 'degen-ape-bot', name: 'Degen Leverage Bot', agentType: 'Trading', 
        successCount: 12, failCount: 8, riskScore: 95, owner: '0x333', audited: false,
        veniceReasoning: 'WARNING: Unaudited code. High failure rate. Extreme risk of capital loss.',
        ratingScore: 2.1, ratingCount: 45,
        feedbacks: [{ userId: '0x999', rating: 1, comment: 'Lost all my ETH.', createdAt: new Date() }]
      }
    ]);

    res.json({ message: 'Seeded protocols and agents' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed position for hackathon demo
app.post('/api/seed-position', async (req, res) => {
  try {
    const address = req.body.address || '0xMockUser';
    await Position.deleteMany({ userAddress: address });
    
    // Ensure UserConfig exists
    await UserConfig.findOneAndUpdate(
      { address },
      { 
        address,
        autoRepayEnabled: true,
        whitelistedProtocols: ['aave-v3-base'],
        blacklistedTokens: []
      },
      { upsert: true }
    );

    // Ensure Protocol exists for the monitor to read liquidation thresholds
    await Protocol.findOneAndUpdate(
      { id: 'aave-v3-base' },
      {
        id: 'aave-v3-base', name: 'Aave V3', chainId: 8453, poolAddress: '0x123', oracleAddress: '0x456',
        liquidationThreshold: 8000, liquidationPenalty: 1500, riskScore: 12, tvl: 150000000, audited: true, exploits: 0,
        veniceReasoning: 'Audited, high TVL, low risk.'
      },
      { upsert: true }
    );

    const newPos = await Position.create({
      id: `pos-${Date.now()}`,
      userAddress: address,
      protocolId: 'aave-v3-base',
      collateralToken: 'ETH',
      collateralAmount: 10.5,
      debtToken: 'USDC',
      debtAmount: 25000,
      ltvPercent: 78, // High LTV, close to 80% liquidation
      monitored: true,
      rescueCount: 0
    });

    res.json({ message: 'Seeded high-risk position', position: newPos });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startMonitor();
  });
});
