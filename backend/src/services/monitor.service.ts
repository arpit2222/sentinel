import UserConfig from '../models/UserConfig';
import Position from '../models/Position';
import Protocol from '../models/Protocol';
import RescueExecution from '../models/RescueExecution';
import { veniceAI } from './venice.service';
import { oneshot } from './oneshot.service';
import { telegramService } from './telegram.service';

export async function monitorPositions() {
  console.log('[Monitor] Running cycle...');
  try {
    const allConfigs = await UserConfig.find({ autoRepayEnabled: true });
    
    for (const config of allConfigs) {
      const positions = await Position.find({ userAddress: config.address, monitored: true });
      
      for (const position of positions) {
        // Skip if protocol not whitelisted or collateral blacklisted
        if (!config.whitelistedProtocols.includes(position.protocolId)) continue;
        if (config.blacklistedTokens.includes(position.collateralToken)) continue;

        const protocol = await Protocol.findOne({ id: position.protocolId });
        if (!protocol) continue;

        // Mock current price drop simulation
        // Real implementation would use Chainlink
        const mockPriceDrop = Math.random() * 5; // 0 to 5% drop
        const currentLtv = position.ltvPercent + mockPriceDrop; // simulate LTV increasing

        const liquidationLTV = protocol.liquidationThreshold / 100; // e.g. 80
        const liquidationRisk = (currentLtv / liquidationLTV) * 100;

        // Time to liquidation mock logic
        const hoursTilLiquidation = (liquidationLTV - currentLtv) / 2; // assuming 2% per hour volatility
        
        const decision = await veniceAI.decideLiquidationAction({
          liquidation_risk: liquidationRisk,
          time_to_liquidation: hoursTilLiquidation * 3600,
          current_ltv: currentLtv,
          protocol_safety: protocol.riskScore > 80 ? 'medium_risk' : 'audited_low_risk',
          user_risk_tolerance: 'conservative'
        });

        if (decision.should_repay) {
          console.log(`[Monitor] Triggering rescue for ${position.id}`);
          
          // Trigger 1Shot Relayer
          const result = await oneshot.relayerSend7710Transaction({
            delegation: config.parentDelegation || 'mock_delegation_bytes',
            tx: {
              to: protocol.poolAddress,
              data: '0xmockrepaydata'
            },
            feeToken: config.preferredStablecoin
          });

          if (result.status === 'success') {
            // Log execution
            await RescueExecution.create({
              txHash: result.txHash,
              userAddress: config.address,
              positionId: position.id,
              repayAmount: decision.repay_amount,
              costUSDC: result.gasFee,
              ltvBefore: currentLtv,
              ltvAfter: currentLtv - (decision.repay_amount / position.collateralAmount), // mock new LTV
              status: 'success',
              monitorReasoning: decision.reasoning,
              relayerResponse: result,
              executedAt: new Date()
            });

            // Trigger Telegram Alert
            telegramService.sendAlert(`🚨 *SENTINEL ALERT* 🚨\n\nVenice AI detected imminent liquidation on your position!\n\n*Action Taken:*\nRepaid ${decision.repay_amount} USDC via 1Shot Relayer.\nGas Fee: $${result.gasFee} (paid in USDC, no ETH needed).\n\n*Venice Reasoning:*\n_${decision.reasoning}_\n\n✅ Your funds are now safe.`);

            // Update position
            position.rescueCount += 1;
            position.lastRescueTime = new Date();
            position.ltvPercent = currentLtv - 10; // Drop LTV after rescue
            await position.save();
          }
        } else {
            // Just update simulated LTV
            position.ltvPercent = currentLtv > 0 ? currentLtv : position.ltvPercent;
            await position.save();
        }
      }
    }
  } catch (error) {
    console.error('[Monitor] Error:', error);
  }
}

// Start cron
export function startMonitor() {
  setInterval(monitorPositions, 30000); // Run every 30 seconds
}
